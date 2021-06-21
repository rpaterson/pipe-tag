'use strict';

const ChildProcess = require('child_process');
const split = require('split');

function pipe(fromProc, toProc) {
    // TODO propagate errors?
    fromProc.stdout.pipe(toProc.stdin);
    return toProc;
};

module.exports = function pipeTag(strings, ...args) {

    const spawnOptions = {
        shell: true,
        stdio: ['pipe', 'pipe', 'inherit'],
    };

    let proc = null;
    let command = '';

    const trimCommand = () => {
        command = command.trim();
        if (command.startsWith('|')) {
            command = command.slice(1);
        }
        if (command.endsWith('|')) {
            command = command.slice(0, -1);
        }
    }

    const pipeCommand = () => {
        const commandProc = ChildProcess.spawn(command, spawnOptions);
        proc = proc && pipe(proc, commandProc) || commandProc;
        command = '';
    };

    for (let i = 0; i < strings.length; i++) {

        command += strings[i];

        if (args.length <= i) {
            continue;
        }

        let arg = args[i];

        if (
            typeof arg === 'function' ||
            arg && arg.stdin && arg.stdout && typeof arg.stdout.pipe === 'function'
        ) {

            trimCommand();
            if (command) {
                pipeCommand();
            }

            if (typeof arg === 'function') {
                proc = { stdout: proc.stdout.pipe(split(line => arg(line) + '\n')) };
            } else {
                proc = pipe(proc, arg);
            }
            continue;
        }

        command += String(arg);
    }
    trimCommand();
    if (command) {
        pipeCommand();
    }

    proc.then = (cb) => {
        let buff = '';
        proc.stdout.on('data', data => buff += data);
        proc.stdout.on('end', () => cb(buff.trim().split('\n')));
    };

    return proc;
}