
import fs from "fs";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";
describe.skip("performance testing", () => {
	it("should properly parse more than 500 MB of file.", function(done)  {
		const parser = new XmlParser({ resourcePath: "/items/item" });
		// var wsStream = fs.createWriteStream('./test/TestFiles/MB_and_GB_size_files/MBFile.xml')
		// var rsStream = fs.createReadStream('./test/TestFiles/MB_and_GB_size_files/MBFile.xml')
		let dataEventCount = 0;
		// var maxRSSMemoryTaken = 0
		// var rss
		const startTime = Date.now();
		const xmlStream = new stream.Readable();
		xmlStream._read = function noop() {
			// nop
		};
		let dataChunk;
		this.timeout(900000);
		const firstChunk = fs.readFileSync("./test/TestFiles/MB_and_GB_size_files/firstChunk.xml");
		xmlStream.push(firstChunk);
		for (let i = 0; i < 2200; i++) {
			dataChunk = fs.readFileSync("./test/TestFiles/MB_and_GB_size_files/repetitiveChunk.xml");
			xmlStream.push(dataChunk);
		}

		const endingChunk = fs.readFileSync("./test/TestFiles/MB_and_GB_size_files/endingChunk.xml");
		xmlStream.push(endingChunk);
		xmlStream.push(null);
		parser.on("data", (data) => {
			// rss = process.memoryUsage().rss
			// if (rss > maxRSSMemoryTaken) maxRSSMemoryTaken = rss
			dataEventCount++;
		});

		parser.on("error", (err) => {
			should(err).not.be.ok();
			done(err);
		});

		parser.on("end", () => {
			// console.log('dataEventCount=', dataEventCount)
			// console.log('RSS memory=', rss)
			const TimeTaken = Date.now() - startTime;
			// console.log('time taken=', TimeTaken)
			should(TimeTaken).be.belowOrEqual(300000);
			should(dataEventCount).equal(4558400);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly parse more than 1 GB of file.", function(done)  {
		const parser = new XmlParser({ resourcePath: "/items/item" });
		// var wsStream = fs.createWriteStream('./test/TestFiles/MB_and_GB_size_files/MBFile.xml')
		// var rsStream = fs.createReadStream('./test/TestFiles/MB_and_GB_size_files/MBFile.xml')
		let dataEventCount = 0;
		// var maxRSSMemoryTaken = 0
		// var rss
		const startTime = Date.now();
		const xmlStream = new stream.Readable();
		xmlStream._read = function noop() {
			// nop
		};
		let dataChunk;
		this.timeout(900000);
		const firstChunk = fs.readFileSync("./test/TestFiles/MB_and_GB_size_files/firstChunk.xml");
		xmlStream.push(firstChunk);
		for (let i = 0; i < 4400; i++) {
			dataChunk = fs.readFileSync("./test/TestFiles/MB_and_GB_size_files/repetitiveChunk.xml");
			xmlStream.push(dataChunk);
		}

		const endingChunk = fs.readFileSync("./test/TestFiles/MB_and_GB_size_files/endingChunk.xml");
		xmlStream.push(endingChunk);
		xmlStream.push(null);
		parser.on("data", (data) => {
			// rss = process.memoryUsage().rss
			// if (rss > maxRSSMemoryTaken) maxRSSMemoryTaken = rss
			dataEventCount++;
		});

		parser.on("error", (err) => {
			should(err).not.be.ok();
			done(err);
		});

		parser.on("end", () => {
			// console.log('dataEventCount=', dataEventCount)
			// console.log('RSS memory=', rss)
			const TimeTaken = Date.now() - startTime;
			// console.log('time taken=', TimeTaken)
			should(TimeTaken).be.belowOrEqual(700000);
			should(dataEventCount).equal(9116800);
			done();
		});
		xmlStream.pipe(parser);
	});
});
