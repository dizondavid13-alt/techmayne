/**
 * Script to update Google Sheets header with new "Embed Script" column
 * Run this once to add the new column U to your existing sheet
 */

const sheetsService = require('../services/sheetsService');

async function updateHeader() {
  try {
    console.log('Updating Google Sheets header...');
    await sheetsService.createHeaderRow();
    console.log('✅ Header updated successfully! Column U now contains "Embed Script"');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating header:', error);
    process.exit(1);
  }
}

updateHeader();
