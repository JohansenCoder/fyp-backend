const PDFParser = require('pdf2json');
const AlmanacEvent = require('../models/AlmanacEventSchema');

async function parseAndStoreAlmanac(pdfPath) {
    const parser = new PDFParser();
    parser.loadPDF(pdfPath);

    return new Promise((resolve, reject) => {
        parser.on('pdfParser_dataReady', async (pdfData) => {
            const events = [];
            const pages = pdfData.Pages;

            // Example parsing logic (adjust based on PDF structure)
            for (const page of pages) {
                const text = page.Texts.map(t => decodeURIComponent(t.R[0].T));
                let currentEvent = null;

                for (const line of text) {
                    // Match event titles (e.g., "Semester I Examinations - MCHAS")
                    const titleMatch = line.match(/^(.*?)\s*-\s*(MCHAS|except for MCHAS|All)/i);
                    const dateMatch = line.match(/(\w+day)\s+(\d{2}\s+\w+\s+\d{4})/);

                    if (titleMatch) {
                        currentEvent = {
                            title: titleMatch[1].trim(),
                            college: titleMatch[2] === 'MCHAS' ? 'MCHAS' : titleMatch[2] === 'except for MCHAS' ? 'All' : 'All',
                            eventType: inferEventType(titleMatch[1]),
                            description: '',
                            startDate: null,
                            endDate: null
                        };
                    } else if (dateMatch && currentEvent) {
                        const date = new Date(dateMatch[2]);
                        if (line.includes('Begins')) {
                            currentEvent.startDate = date;
                        } else if (line.includes('Ends')) {
                            currentEvent.endDate = date;
                            if (currentEvent.title && currentEvent.startDate && currentEvent.endDate) {
                                events.push(currentEvent);
                                currentEvent = null;
                            }
                        }
                    }
                }
            }

            // Store in MongoDB
            await AlmanacEvent.deleteMany({}); // Clear existing events
            await AlmanacEvent.insertMany(events);
            console.log(`Stored ${events.length} almanac events`);
            resolve(events);
        });

        parser.on('error', (err) => {
            console.error('PDF parsing error:', err);
            reject(err);
        });
    });
}

// Helper to infer event type from title
function inferEventType(title) {
    if (title.includes('Examination')) return 'Examinations';
    if (title.includes('Graduation')) return 'Graduation';
    if (title.includes('Semester')) return 'Semester';
    if (title.includes('Orientation')) return 'Orientation';
    return 'Other';
}

module.exports = { parseAndStoreAlmanac };