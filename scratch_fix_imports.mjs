import fs from 'fs';
import path from 'path';

let content = fs.readFileSync('src/pages/NewInspection.tsx', 'utf-8');
if (!content.includes("import { BrandedLoader }")) {
    const importStatement = "import { BrandedLoader } from '../components/BrandedLoader';\n";
    const lastImportIndex = content.lastIndexOf('import ');
    const newlineAfterImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, newlineAfterImport + 1) + importStatement + content.slice(newlineAfterImport + 1);
    fs.writeFileSync('src/pages/NewInspection.tsx', content);
    console.log("Added BrandedLoader import to NewInspection.tsx");
}

let profileContent = fs.readFileSync('src/pages/ProfilePage.tsx', 'utf-8');
if (profileContent.includes("Loading...")) {
    console.log("ProfilePage has 'Loading...'");
} else {
    console.log("ProfilePage doesn't have 'Loading...'");
}
