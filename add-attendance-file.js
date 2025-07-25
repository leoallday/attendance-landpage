#!/usr/bin/env node

/**
 * Helper script to add new attendance files to the manifest
 * Usage: node add-attendance-file.js <filename> <title> <date> <description> <category>
 * 
 * Example:
 * node add-attendance-file.js "attendance-2024-03-15.html" "March 15 Meeting" "2024-03-15" "Weekly team meeting" "meeting"
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 5) {
    console.log('Usage: node add-attendance-file.js <filename> <title> <date> <description> <category>');
    console.log('');
    console.log('Example:');
    console.log('node add-attendance-file.js "attendance-2024-03-15.html" "March 15 Meeting" "2024-03-15" "Weekly team meeting" "meeting"');
    console.log('');
    console.log('Available categories: regular, workshop, meeting, training, orientation');
    process.exit(1);
}

const [filename, title, date, description, category] = args;

// Validate inputs
if (!filename.endsWith('.html')) {
    console.error('Error: Filename must end with .html');
    process.exit(1);
}

if (!filename.startsWith('attendance-')) {
    console.error('Error: Filename must start with "attendance-"');
    process.exit(1);
}

// Validate date format (YYYY-MM-DD)
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
if (!dateRegex.test(date)) {
    console.error('Error: Date must be in YYYY-MM-DD format');
    process.exit(1);
}

const validCategories = ['regular', 'workshop', 'meeting', 'training', 'orientation'];
if (!validCategories.includes(category)) {
    console.error(`Error: Category must be one of: ${validCategories.join(', ')}`);
    process.exit(1);
}

// Read existing manifest
const manifestPath = path.join(__dirname, 'attendance-manifest.json');
let manifest;

try {
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    manifest = JSON.parse(manifestContent);
} catch (error) {
    console.error('Error reading attendance-manifest.json:', error.message);
    process.exit(1);
}

// Check if file already exists in manifest
const existingFile = manifest.files.find(file => file.filename === filename);
if (existingFile) {
    console.error(`Error: File "${filename}" already exists in manifest`);
    process.exit(1);
}

// Create new file entry
const newFile = {
    filename,
    title,
    date,
    description,
    category
};

// Add to manifest
manifest.files.push(newFile);

// Sort files by date (newest first)
manifest.files.sort((a, b) => {
    if (a.date && b.date) {
        return new Date(b.date) - new Date(a.date);
    }
    return a.title.localeCompare(b.title);
});

// Update timestamp
manifest.lastUpdated = new Date().toISOString();

// Write back to file
try {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Successfully added "${filename}" to attendance manifest`);
    console.log(`📄 Title: ${title}`);
    console.log(`📅 Date: ${date}`);
    console.log(`📝 Description: ${description}`);
    console.log(`🏷️  Category: ${category}`);
    console.log('');
    console.log('Next steps:');
    console.log(`1. Create the HTML file: ${filename}`);
    console.log('2. Commit and push your changes');
    console.log('3. The file will automatically appear in the dropdown');
} catch (error) {
    console.error('Error writing to attendance-manifest.json:', error.message);
    process.exit(1);
}

// Check if the HTML file exists
const htmlPath = path.join(__dirname, filename);
if (!fs.existsSync(htmlPath)) {
    console.log('');
    console.log(`⚠️  Warning: HTML file "${filename}" does not exist yet.`);
    console.log('   Make sure to create this file for the entry to work properly.');
}
