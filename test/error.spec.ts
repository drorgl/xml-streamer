
import fs from "fs";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";
describe.skip("Error Handling", () => {
	it("should properly return error if the xml file is corrupted.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/corrupted.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });
		let dataEventCount = 0;

		parser.on("data", (data) => {
			dataEventCount++;
		});

		parser.on("error", (err) => {
			// console.log(err)
			should(err.message).equal("mismatched tag at line no: 12");
			done();
		});

		xmlStream.pipe(parser);
	});

	it("should properly return error if the large xml file is corrupted.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/largeCorruptedFile.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });
		let dataEventCount = 0;

		parser.on("data", (data) => {
			dataEventCount++;
		});

		parser.on("error", (err) => {
			// console.log(err)
			should(err.message).equal("mismatched tag at line no: 8346");
			done();
		});

		xmlStream.pipe(parser);
	});
});
