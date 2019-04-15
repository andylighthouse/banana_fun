const fs = require('fs');

function readCsv(filename) {
    return fs.readFileSync(filename, 'utf-8');
}