// Runs via jest's "setupFiles" (before the test framework and before
// jest.setup.js). jsdom doesn't provide TextEncoder/TextDecoder, which
// enzyme pulls in transitively via cheerio -> undici.
const { TextEncoder, TextDecoder } = require("util");
const { ReadableStream, WritableStream, TransformStream } = require("stream/web");
const { MessageChannel, MessagePort } = require("worker_threads");

if (typeof global.TextEncoder === "undefined") global.TextEncoder = TextEncoder;
if (typeof global.TextDecoder === "undefined") global.TextDecoder = TextDecoder;
if (typeof global.ReadableStream === "undefined") global.ReadableStream = ReadableStream;
if (typeof global.WritableStream === "undefined") global.WritableStream = WritableStream;
if (typeof global.TransformStream === "undefined") global.TransformStream = TransformStream;
if (typeof global.MessageChannel === "undefined") global.MessageChannel = MessageChannel;
if (typeof global.MessagePort === "undefined") global.MessagePort = MessagePort;
