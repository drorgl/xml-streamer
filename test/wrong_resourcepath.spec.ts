import fs from "fs";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";

describe("wrong resourcePath", () => {
	it("should be able to detect the wrong resourcePath at root level.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/item.xml");
		const parser = new XmlParser({ resourcePath: "/wrong/noNodes", emitOnNodeName: true });

		const actualData : string[] = [];
		const itemData : string[] = [];
		let dataEventCount = 0;
		let itemCount = 0;

		parser.on("data", (data) => {
			actualData.push(data);
			dataEventCount++;
		});

		parser.on("item", (item) => {
			itemData.push(item);
			itemCount++;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("end", () => {
			// console.log('actualData=', actualData)
			// console.log('dataEventCount=', dataEventCount)
			should(actualData.length).equal(0);
			should(dataEventCount).equal(0);
			should(itemData.length).equal(0);
			should(itemCount).equal(0);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should be able to detect wrong resourcePath while parsing xml", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/manyItems.xml");
		const parser = new XmlParser({ resourcePath: "/wrong/noNodes", emitOnNodeName: true });

		let dataEventCount = 0;
		let itemCount = 0;
		parser.on("data", (data) => {
			dataEventCount++;
		});

		parser.on("item", (data) => {
			itemCount++;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("end", () => {
			// console.log('dataEventCount=', dataEventCount)
			should(dataEventCount).equal(0);
			should(itemCount).equal(0);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly parse a huge file.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/hugeFile.xml");
		const parser = new XmlParser({ resourcePath: "/wrong/path", emitOnNodeName: true });

		let dataEventCount = 0;
		let itemCount = 0;

		parser.on("data", (data) => {
			dataEventCount++;
		});

		parser.on("item", (item) => {
			itemCount++;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("end", () => {
			// console.log('dataEventCount=', dataEventCount)
			should(dataEventCount).equal(0);
			should(itemCount).equal(0);
			done();
		});
		xmlStream.pipe(parser);
	});
});
