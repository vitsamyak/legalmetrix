import fs from 'fs';
import path from 'path';

const dir = 'src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const replacements = [
  { from: /"\/dashboard\/inspection\//g, to: '"/inspections/' },
  { from: /`\/dashboard\/inspection\//g, to: '`/inspections/' },
  { from: /'\/dashboard\/inspection\//g, to: "'/inspections/" },
  
  { from: /"\/dashboard\/history\//g, to: '"/inspections/' },
  { from: /`\/dashboard\/history\//g, to: '`/inspections/' },
  { from: /'\/dashboard\/history\//g, to: "'/inspections/" },
  
  { from: /"\/dashboard\/history"/g, to: '"/inspections"' },
  { from: /'\/dashboard\/history'/g, to: "'/inspections'" },
  { from: /`\/dashboard\/history`/g, to: '`/inspections`' },
  
  { from: /"\/dashboard\/report\//g, to: '"/reports/' },
  { from: /`\/dashboard\/report\//g, to: '`/reports/' },
  { from: /'\/dashboard\/report\//g, to: "'/reports/" },
  
  { from: /"\/dashboard\/reports\//g, to: '"/reports/' },
  { from: /`\/dashboard\/reports\//g, to: '`/reports/' },
  { from: /'\/dashboard\/reports\//g, to: "'/reports/" },
  
  { from: /"\/dashboard\/reports"/g, to: '"/reports"' },
  { from: /'\/dashboard\/reports'/g, to: "'/reports'" },
  { from: /`\/dashboard\/reports`/g, to: '`/reports`' },
  
  { from: /"\/dashboard\/products\//g, to: '"/products/' },
  { from: /`\/dashboard\/products\//g, to: '`/products/' },
  { from: /'\/dashboard\/products\//g, to: "'/products/" },
  
  { from: /"\/dashboard\/products"/g, to: '"/products"' },
  { from: /'\/dashboard\/products'/g, to: "'/products'" },
  { from: /`\/dashboard\/products`/g, to: '`/products`' },

  { from: /"\/dashboard\/evidence"/g, to: '"/evidence"' },
  { from: /'\/dashboard\/evidence'/g, to: "'/evidence'" },
  
  { from: /"\/dashboard\/inspect"/g, to: '"/new-inspection"' },
  { from: /'\/dashboard\/inspect'/g, to: "'/new-inspection'" },
];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let newContent = content;
  
  for (const repl of replacements) {
    newContent = newContent.replace(repl.from, repl.to);
  }
  
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent);
    console.log(`Updated ${file}`);
  }
}
