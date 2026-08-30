const fs = require('fs');

let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// Replacements map
const replacements = [
    [/text-xs/g, 'text-sm'],
    [/text-sm/g, 'text-base'],
    [/text-base/g, 'text-lg'],
    [/text-lg/g, 'text-xl'],
    [/text-xl/g, 'text-2xl'],
    [/text-2xl/g, 'text-3xl'],
    [/text-3xl/g, 'text-4xl'],
    [/text-4xl/g, 'text-5xl'],
    [/text-5xl/g, 'text-6xl'],
    [/text-6xl/g, 'text-7xl'],
    [/text-7xl/g, 'text-8xl'],
    [/text-8xl/g, 'text-9xl'],
    [/text-\[10px\]/g, 'text-xs'],
    [/text-\[11px\]/g, 'text-sm'],
];

// Apply replacements from top to bottom but wait, if I replace text-lg to text-xl, 
// then the next replacement text-xl to text-2xl will bump it AGAIN.
// So I need a way to do it correctly.

let words = content.split(/(\btext-[a-z0-9\[\]]+)/g);

const bumpMap = {
    'text-[10px]': 'text-xs',
    'text-[11px]': 'text-sm',
    'text-xs': 'text-sm',
    'text-sm': 'text-base',
    'text-base': 'text-lg',
    'text-lg': 'text-xl',
    'text-xl': 'text-2xl',
    'text-2xl': 'text-3xl',
    'text-3xl': 'text-4xl',
    'text-4xl': 'text-5xl',
    'text-5xl': 'text-6xl',
    'text-6xl': 'text-7xl',
    'text-7xl': 'text-8xl',
    'text-8xl': 'text-9xl'
};

for (let i = 0; i < words.length; i++) {
    if (bumpMap[words[i]]) {
        words[i] = bumpMap[words[i]];
    }
}

fs.writeFileSync('src/pages/HomePage.tsx', words.join(''));
console.log('Font sizes bumped in HomePage.tsx');
