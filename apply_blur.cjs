const fs = require('fs');

let content = fs.readFileSync('src/pages/HomePage.tsx', 'utf8');

// We will use a regular expression to match <h2> tags and their content.
// The regex needs to handle the fact that the content is on the next line.
const h2Regex = /<h2([^>]*)>\s*([^<]+)\s*<\/h2>/g;

content = content.replace(h2Regex, (match, attrs, text) => {
    // Determine if it needs justify-center. We'll just look at the text or context if possible.
    // Instead of regex guessing context, let's just use flex-wrap with justify-center if it's centered,
    // or maybe it's safer to just let BlurText handle it. Wait, `display: flex` defaults to flex-start.
    // Let's replace the h2 content with BlurText.
    // A trick is to use className="justify-center sm:justify-start" or just look at the string to decide.
    // Let's use a mapping for the text to decide.
    
    const centeredTexts = [
        "Compliance Inspection, Reimagined",
        "From Product Image to Compliance Insight",
        "AI That Works With Evidence",
        "Every Finding Has Evidence",
        "Turn Inspection Data into Actionable Intelligence",
        "Trusted by Forward-Thinking Compliance Departments",
        "Meet the Team",
        "Frequently Asked Questions",
        "Ready to Modernize Your Compliance Enforcement?"
    ];

    const isCentered = centeredTexts.some(t => text.includes(t));
    const blurClass = isCentered ? 'className="justify-center"' : '';

    return `<h2${attrs}>
              <BlurText text="${text.trim()}" delay={50} direction="bottom" ${blurClass} />
            </h2>`;
});

fs.writeFileSync('src/pages/HomePage.tsx', content);
console.log('Updated HomePage.tsx with BlurText');
