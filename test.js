/**
 * Usage examples for the debug library
 * Following the patterns shown in README.md
 */

const debug = require('./src/index.js');

// Example 1: Basic usage (from README app.js example)
console.log('\n=== Example 1: Basic HTTP debugging ===');
var httpDebug = require('./src/index.js')('http');
var name = 'My App';

// Enable http namespace
debug.enable('error,info');
httpDebug('booting %o', name);

// Simulate HTTP server logging
httpDebug('GET /api/users');
httpDebug('POST /api/login');
httpDebug('listening');

// Example 2: Worker example (from README worker.js)
console.log('\n=== Example 2: Multiple worker debuggers ===');
var a = require('./src/index.js')('worker:a');
var b = require('./src/index.js')('worker:b');

debug.enable('worker:*');
a('doing lots of uninteresting work');
b('doing some work');
a('still working...');
b('almost done');

// Example 3: Extend functionality
console.log('\n=== Example 3: Extending debuggers ===');
var log = require('./src/index.js')('auth');

debug.enable('auth:*');
log('hello'); // auth hello

// Create extended debug instances
const logSign = log.extend('sign');
const logLogin = log.extend('login');

logSign('hello'); // auth:sign hello
logLogin('hello'); // auth:login hello

// Example 4: Set dynamically
console.log('\n=== Example 4: Dynamic enable/disable ===');
let debugLib = require('./src/index.js');

console.log('1. enabled("test"):', debugLib.enabled('test'));

debugLib.enable('test');
console.log('2. enabled("test"):', debugLib.enabled('test'));

debugLib.disable();
console.log('3. enabled("test"):', debugLib.enabled('test'));

// Example 5: Wildcards
console.log('\n=== Example 5: Wildcard matching ===');
debug.enable('connect:*');
const bodyParser = require('./src/index.js')('connect:bodyParser');
const compress = require('./src/index.js')('connect:compress');
const session = require('./src/index.js')('connect:session');

bodyParser('parsing body');
compress('compressing response');
session('creating session');

// Example 6: Exclude with wildcards
console.log('\n=== Example 6: Excluding namespaces ===');
debug.enable('*,-connect:*');
const testDebug = require('./src/index.js')('test');
const appDebug = require('./src/index.js')('app');

testDebug('this will show');
appDebug('this will show');
bodyParser('this will NOT show (excluded)');

// Example 7: Output streams (custom log)
console.log('\n=== Example 7: Custom output streams ===');
var error = require('./src/index.js')('app:error');
var log = require('./src/index.js')('app:log');

debug.enable('app:*');

// by default stderr is used
error('goes to stderr!');

// set this namespace to log via console.log
log.log = console.log.bind(console);
log('goes to stdout');

error('still goes to stderr!');

// Example 8: Custom formatters
console.log('\n=== Example 8: Custom formatters ===');
const createDebug = require('./src/index.js');

// Add custom hex formatter
createDebug.formatters.h = (v) => {
	if (Buffer.isBuffer(v)) {
		return v.toString('hex');
	}
	return String(v);
};

debug.enable('foo');
const fooDebug = createDebug('foo');
const buf = Buffer.from('hello world');
fooDebug('this is hex: %h', buf);

// Example 9: Formatters
console.log('\n=== Example 9: Built-in formatters ===');
debug.enable('formatters');
const fmt = require('./src/index.js')('formatters');

const obj = { name: 'test', value: 123, nested: { deep: true } };
fmt('object single line: %o', obj);
fmt('object multiline: %O', obj);
fmt('json: %j', obj);
fmt('string: %s', 'hello');
fmt('number: %d', 42);
fmt('percent sign: %%');

// Example 10: Checking enabled property
console.log('\n=== Example 10: Checking enabled property ===');
const http = require('./src/index.js')('http');

debug.enable('http');
if (http.enabled) {
	console.log('HTTP debugging is enabled');
	http('server started');
}

// Manually toggle
http.enabled = false;
if (!http.enabled) {
	console.log('HTTP debugging manually disabled');
}

// Example 11: Multiple namespaces
console.log('\n=== Example 11: Multiple namespaces ===');
debug.enable('app,worker');
const app = require('./src/index.js')('app');
const worker = require('./src/index.js')('worker');
const other = require('./src/index.js')('other');

app('app message');
worker('worker message');
other('other message (disabled)');

// Example 12: Library-style namespacing
console.log('\n=== Example 12: Library-style namespacing ===');
debug.enable('connect:*');
const bodyParser2 = require('./src/index.js')('connect:bodyParser');
const compress2 = require('./src/index.js')('connect:compress');
const session2 = require('./src/index.js')('connect:session');

bodyParser2('parsing request body');
compress2('compressing response');
session2('managing session');

console.log('\n=== All examples completed ===');
