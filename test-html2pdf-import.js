import { readFileSync } from 'fs';
const file = readFileSync('node_modules/html2pdf.js/dist/html2pdf.js', 'utf8');
console.log(file.substring(0, 500));
