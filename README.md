Easily create a streaming pipeline of child processes using a tagged template literal, and mixin string processing in Javascript.

Full example:
```Javascript
const pipe = require('pipe-tag');

const psOptions = '--format cmd'

pipe`
    ps ${psOptions} |
    ${ line => line.toUpperCase() } |
    ${ pipe`sort` }
`.stdout.pipe(process.stdout);
```

# Usage

A simple template string tagged with `pipe` spawns a child process and returns it's [ChildProcess](https://nodejs.org/docs/latest/api/child_process.html#child_process_class_childprocess) object.
```Javascript
pipe`ps`.stdout.pipe(process.stdout);
```

For convenience the returned object can be `await`ed to buffer an array of Strings from it's stdout.
```Javascript
const commands = await pipe`ps`;
```

## Function Placeholders

Placeholder expressions that produce Functions are executed once for each line output by the preceding child process, and then the results are sent to the stdin of the next step of the pipeline.
```Javascript
pipe`ps | ${ line => line.toUpperCase() }`.stdout.pipe(process.stdout);
```

## Child Process Placeholders

Placeholder expressions that produce instances of [ChildProcess](https://nodejs.org/docs/latest/api/child_process.html#child_process_class_childprocess) (or similar) are added to the pipeline. The stdout of the preceding child process is piped to their stdin, and their stdout is piped to the stdin of the next step of the pipeline.

```Javascript
pipe`ps | ${ child_process.spawn('sort') }`.stdout.pipe(process.stdout);
```

The `pipe` template tag itself returns a ChildProcess object, so `pipe` template literals can be composed.
```Javascript
pipe`ps | ${ pipe`sort` }`.stdout.pipe(process.stdout);
```

## Other Placeholders

All other placeholders are stringified and appended to the child process command (just like "normal" un-tagged template literals).
```Javascript
const psOptions = '--format cmd';
pipe`ps ${ psOptions }`.stdout.pipe(process.stdout);
```
