const { parseAndStoreAlmanac } = require('../services/almanacParser');

async function run() {
    try {
        await parseAndStoreAlmanac('UDSM_ALMANAC_2025.pdf');
        console.log('Almanac parsing complete');
    } catch (err) {
        console.error('Error:', err);
    }
}

run();