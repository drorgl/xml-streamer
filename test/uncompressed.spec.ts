import fs from "fs";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";

describe("should properly handle uncompressed files", () => {
	it("should properly parse a uncompressed xml file.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/medium.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });
		const gzip = zlib.createGzip();
		const gunzip = zlib.createGunzip();
		let dataEventCount = 0;

		parser.on("data", (data) => {
			dataEventCount++;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("end", () => {
			// console.log('dataEventCount=', dataEventCount)
			should(dataEventCount).equal(10);
			done();
		});
		xmlStream.pipe(gzip).pipe(gunzip).pipe(parser);
	});

	it("should properly parse uncompressed file and go fine with pause and resume.", function(done) {
		const xmlStream = fs.createReadStream("./test/TestFiles/medium.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });
		const gzip = zlib.createGzip();
		const gunzip = zlib.createGunzip();

		let dataEventCount = 0;
		let isSetTimeoutHappened = true;
		this.timeout(20000);
		parser.on("data", (data) => {
			parser.pause();
			should(isSetTimeoutHappened).equal(true);
			setTimeout(() => {
				parser.resume();
				isSetTimeoutHappened = true;
			}, 2000);
			dataEventCount++;
			isSetTimeoutHappened = false;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("end", () => {
			// console.log('dataEventCount=', dataEventCount)
			should(dataEventCount).equal(10);
			done();
		});
		xmlStream.pipe(gzip).pipe(gunzip).pipe(parser);
	});
});
