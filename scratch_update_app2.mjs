import fs from 'fs';

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace("const AIProcessing = lazy(() => import('./pages/AIProcessing').then(m => ({ default: m.AIProcessing })));\n", "");
content = content.replace("                <Route path=\"/dashboard/process\" element={<AIProcessing />} />\n", "");

fs.writeFileSync(path, content);
console.log("Updated App.tsx");
