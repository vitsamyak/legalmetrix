import fs from 'fs';

const filePath = 'src/pages/RulesPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// The stats block starts at `{[...].map((stat, i) => (`
content = content.replace(/\{\[\s*\{\s*label:\s*'Total Rules'[\s\S]*?\]\.map/m, `{[
          { label: 'Total Rules', value: loading ? '-' : rules.length.toString(), icon: Scale },
          { label: 'Active Rules', value: loading ? '-' : rules.length.toString(), icon: ShieldCheck },
          { label: 'Recently Updated', value: loading ? '-' : rules.length.toString(), icon: History, trend: '' },
          { label: 'Needs Review', value: '0', icon: Filter, color: 'text-warning' },
        ].map`);

fs.writeFileSync(filePath, content, 'utf8');
