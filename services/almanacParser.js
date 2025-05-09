// src/services/almanacParser.js
const PDFParser = require('pdf2json');
const fs = require('fs').promises;
const AlmanacEvent = require('../models/AlmanacEventSchema');

// Enhanced text normalization to handle excessive spaces
const normalizeText = (text) => {
    return text
        .replace(/\s+/g, ' ') // Collapse multiple spaces into one
        .replace(/[-\s]+/g, ' ') // Replace multiple dashes or spaces
        .trim();
};

// Date parsing utility with flexible format handling
const parseDate = (dateStr) => {
    try {
        // Remove day names and normalize
        let cleanedDate = dateStr.replace(/^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\s*/i, '');
        // Handle single-digit days (e.g., "3 March 2025" -> "03 March 2025")
        cleanedDate = cleanedDate.replace(/^(\d)\s+/, '0$1 ');
        // Replace common month abbreviations
        const monthMap = {
            'Jan': 'January', 'Feb': 'February', 'Mar': 'March', 'Apr': 'April',
            'May': 'May', 'Jun': 'June', 'Jul': 'July', 'Aug': 'August',
            'Sep': 'September', 'Oct': 'October', 'Nov': 'November', 'Dec': 'December'
        };
        Object.keys(monthMap).forEach(abbr => {
            cleanedDate = cleanedDate.replace(new RegExp(abbr, 'i'), monthMap[abbr]);
        });
        const date = new Date(cleanedDate);
        return isNaN(date) ? null : date;
    } catch {
        return null;
    }
};

async function parseAlmanac(filePath) {
    return new Promise((resolve, reject) => {
        try {
            const pdfParser = new PDFParser();
            const events = [];
            const warnings = [];
            const unmatchedLines = []; // Track lines that don't match any pattern

            pdfParser.on('pdfParser_dataReady', async (pdfData) => {
                try {
                    // Extract text from all pages
                    const text = pdfData.Pages.map(page =>
                        page.Texts.map(text => decodeURIComponent(text.R[0].T)).join(' ')
                    ).join('\n');
                    console.log('Extracted PDF text (first 1000 chars):', text.substring(0, 1000));

                    // Split into lines and normalize
                    const lines = text.split('\n').map(normalizeText).filter(line => line.length > 0);
                    console.log(`Total lines extracted: ${lines.length}`);

                    let currentSection = '';
                    let currentCollege = 'All'; // Default to 'All' unless MCHAS is specified

                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        console.log(`Processing line: ${line}`); // Debug: Log each line

                        // Detect section headers
                        if (line.match(/^[A-H]\./) || line.match(/SEMESTER|MARKING|GRADUATION|ORIENTATION|PRACTICAL|APPEALS/i)) {
                            currentSection = line;
                            currentCollege = line.includes('MCHAS') ? 'MCHAS' : 'All';
                            console.log(`New section: ${currentSection}, College: ${currentCollege}`);
                            continue;
                        }

                        // Skip irrelevant lines
                        if (line.match(/^\d+$/) || line.match(/ABBREVIATIONS|University of Dar es Salaam/i)) {
                            console.log(`Skipping irrelevant line: ${line}`);
                            continue;
                        }

                        // Event detection patterns
                        const eventPatterns = [
                            {
                                // Matches "Begins: - Monday 03 March 2025" or "Results Release: Friday 04 April 2025"
                                regex: /(Begins|Starts|Start Working|Results Release|Release Date|Sitting|Applications)\s*[:-]?\s*(\w+\s+\d{1,2}\s+\w+\s+\d{4})/i,
                                endRegex: /(Ends|Complete Working)\s*[:-]?\s*(\w+\s+\d{1,2}\s+\w+\s+\d{4})/i,
                                type: (title) => {
                                    if (title.match(/lecture|semester/i)) return 'lectures';
                                    if (title.match(/examination|sitting/i)) return 'examinations';
                                    if (title.match(/orientation|registration/i)) return 'orientation';
                                    if (title.match(/graduation/i)) return 'graduation';
                                    if (title.match(/marking|compilation/i)) return 'marking';
                                    if (title.match(/practical|field work|teaching practice/i)) return 'practical';
                                    if (title.match(/results release|release date/i)) return 'results';
                                    if (title.match(/appeals|irregularities/i)) return 'appeals';
                                    return 'other';
                                }
                            },
                            {
                                // Matches "Monday 03 March 2025 to Friday 21 March 2025"
                                regex: /(\w+\s+\d{1,2}\s+\w+\s+\d{4})\s*(?:-|to)\s*(\w+\s+\d{1,2}\s+\w+\s+\d{4})/i,
                                type: (title) => {
                                    if (title.match(/lecture|semester/i)) return 'lectures';
                                    if (title.match(/examination/i)) return 'examinations';
                                    return 'other';
                                }
                            },
                            {
                                // Matches standalone dates like "Friday 29 August 2025" for graduations
                                regex: /^(\w+\s+\d{1,2}\s+\w+\s+\d{4})$/i,
                                type: (title) => {
                                    if (title.match(/graduation/i)) return 'graduation';
                                    if (title.match(/results/i)) return 'results';
                                    return 'other';
                                }
                            }
                        ];

                        let matched = false;
                        for (const pattern of eventPatterns) {
                            const match = line.match(pattern.regex);
                            if (match) {
                                matched = true;
                                let title = line.split(':')[0].trim();
                                let startDate = parseDate(match[2] || match[1]);
                                let endDate = null;

                                // Handle end date
                                if (pattern.endRegex) {
                                    const endMatch = line.match(pattern.endRegex);
                                    if (endMatch) {
                                        endDate = parseDate(endMatch[2]);
                                    } else if (i + 1 < lines.length) {
                                        const nextLineMatch = lines[i + 1].match(pattern.endRegex);
                                        if (nextLineMatch) {
                                            endDate = parseDate(nextLineMatch[2]);
                                            i++; // Skip next line
                                        }
                                    }
                                } else if (match[2]) {
                                    endDate = parseDate(match[2]);
                                }

                                // Determine event type
                                const eventType = pattern.type(title);

                                // Clean up title
                                title = title.replace(/^(Begins|Ends|Starts|Start Working|Results Release|Release Date|Sitting|Applications)\s*[:-]?/i, '').trim();
                                if (currentSection.includes('MCHAS') && !title.includes('MCHAS')) {
                                    title += ' - MCHAS';
                                } else if (currentSection.includes('except for MCHAS') && !title.includes('except')) {
                                    title += ' - except MCHAS';
                                }

                                // Validate and add event
                                if (startDate && title) {
                                    events.push({
                                        title,
                                        startDate,
                                        endDate,
                                        college: currentCollege,
                                        eventType
                                    });
                                    console.log(`Event added: ${title}, Start: ${startDate}, End: ${endDate}, Type: ${eventType}`);
                                } else {
                                    warnings.push(`Could not parse event: ${line} (Invalid date or title)`);
                                    console.log(`Failed to parse: ${line}`);
                                }
                                break;
                            }
                        }

                        if (!matched) {
                            unmatchedLines.push(line);
                            console.log(`Unmatched line: ${line}`);
                        }
                    }

                    // Log unmatched lines for debugging
                    if (unmatchedLines.length > 0) {
                        console.log(`Unmatched lines (${unmatchedLines.length}):`, unmatchedLines.slice(0, 10)); // First 10 for brevity
                    }

                    // Save events to database
                    if (events.length > 0) {
                        try {
                            await AlmanacEvent.deleteMany({}); // Clear existing events (optional)
                            await AlmanacEvent.insertMany(events);
                            console.log(`Saved ${events.length} events to database`);
                        } catch (dbErr) {
                            warnings.push(`Database save error: ${dbErr.message}`);
                            console.error(`Database error: ${dbErr.message}`);
                        }
                    } else {
                        console.log('No events to save');
                        warnings.push('No events extracted from the PDF');
                    }

                    resolve({ events, warnings });
                    pdfParser.destroy();
                } catch (err) {
                    console.error(`PDF processing error: ${err.message}`);
                    reject(new Error(`PDF processing error: ${err.message}`));
                }
            });

            pdfParser.on('pdfParser_dataError', (err) => {
                console.error(`PDF parsing error: ${err.message}`);
                reject(new Error(`PDF parsing error: ${err.message}`));
            });

            pdfParser.loadPDF(filePath);
        } catch (err) {
            console.error(`Almanac parsing failed: ${err.message}`);
            reject(new Error(`Almanac parsing failed: ${err.message}`));
        }
    }).finally(async () => {
        await fs.unlink(filePath).catch(() => {}); // Clean up file
    });
}

module.exports = { parseAlmanac };