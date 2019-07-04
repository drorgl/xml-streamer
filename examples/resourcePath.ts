// By passing a resource path.

import { XmlParser } from "../";

const opts = { resourcePath: "/items/item" };

const parser = new XmlParser(opts);

parser.on("data", (data) => {
	// consume the data object here
});

parser.on("end", () => {
	// parsing ended no more data events will be raised
});

parser.on("error", (error) => {
	// error occurred
	// NOTE: when error event emitted no end event will be emitted
	console.error(error);
});

xmlStream.pipe(parser); // pipe your input xmlStream to parser.
// readable
parser.on("readable", () => {
	// if you don't want to consume "data" on "data" events you
	// can wait for readable event and consume data by calling parser.read()
});
