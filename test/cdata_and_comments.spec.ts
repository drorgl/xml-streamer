import fs from "fs";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";
describe("CData and comments in xml", () => {
	it("should properly parse a simple file.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/CData-comments.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });

		let dataEventCount = 0;

		parser.on("data", (data) => {
			dataEventCount++;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("end", () => {
			// console.log('dataEventCount=', dataEventCount)
			should(dataEventCount).equal(296);
			done();
		});
		xmlStream.pipe(parser);
	});
});
