import fs from 'fs';

const path = 'src/App.tsx';
let content = fs.readFileSync(path, 'utf-8');

content = content.replace("import { AIProcessing } from './pages/AIProcessing';\n", "");
content = content.replace("          <Route path=\"processing\" element={<AIProcessing />} />\n", "");

fs.writeFileSync(path, content);
console.log("Updated App.tsx");
