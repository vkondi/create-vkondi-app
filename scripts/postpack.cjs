const fs = require('fs');

// Restore the GitHub README and remove the temporary backup
fs.cpSync('README.github.md', 'README.md');
fs.rmSync('README.github.md');
