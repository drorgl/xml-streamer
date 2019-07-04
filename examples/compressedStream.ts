// Compressed Stream Parsing

import { XmlParser } from "../";
import { StreamZip } from "node-stream-zip";

const zip = new StreamZip({
    file: archiveName,
    storeEntries: true
});


const opts = {}; // see `Available Constructor Options` section below.

const parser = new XmlParser(opts);

parser.on("item", (item) => {
	// consume the item object here
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
	// if you don't want to consume "data" on "data" events you can wait for readable event and consume data by calling parser.read()
});

zip.on("ready", () => {
    zip.stream('path/inside/zip.xml', (err, stm) => {
        stm.pipe(parser);
        stm.on('end', () => zip.close());
    });
});