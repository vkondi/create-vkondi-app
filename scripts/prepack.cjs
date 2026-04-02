const fs = require('fs');

// Back up the GitHub README and replace it with the npm-specific README for publishing
fs.cpSync('README.md', 'README.github.md');
fs.cpSync('README.npm.md', 'README.md');
