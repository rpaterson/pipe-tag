const child_process = require('child_process');
const pipe = require('.');

const psOptions = '--format cmd'

pipe`
    ps ${psOptions} |
    ${line => line.toUpperCase()} |
    ${ pipe`sort` }
`.stdout.pipe(process.stdout);