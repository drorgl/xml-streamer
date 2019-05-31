import fs from "fs";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";
describe("emitOnNodeName", () => {
	it("should properly emit events on node names.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/item.xml");
		const parser = new XmlParser({ resourcePath: "/items/item", emitOnNodeName: true });
		const expectedData = [
			{
				$: { id: "1", test: "hello" },
				subitem:
					[{ $: { sub: "TESTING SUB" }, _: "one" },
					{ $: { sub: "2" }, _: "two" }]
			},
			{
				$: { id: "2" },
				subitem: [{ _: "three" }, { _: "four" }, { _: "five" }]
			}];
		const actualData: string[] = [];
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
			should(actualData).deepEqual(expectedData);
			should(dataEventCount).equal(2);
			should(itemData).deepEqual(expectedData);
			should(itemCount).equal(2);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly emit events on node names while parsing a medium size file.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/medium.xml");
		const parser = new XmlParser({ resourcePath: "/items/item", emitOnNodeName: true });

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
			should(dataEventCount).equal(10);
			should(itemCount).equal(10);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly parse a file containing many nodes.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/manyItems.xml");
		const parser = new XmlParser({ resourcePath: "/items/item", emitOnNodeName: true });

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
			should(dataEventCount).equal(296);
			should(itemCount).equal(296);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly parse a huge file.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/hugeFile.xml");
		const parser = new XmlParser({ resourcePath: "/items/item", emitOnNodeName: true });

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
			should(dataEventCount).equal(2072);
			should(itemCount).equal(2072);
			done();
		});
		xmlStream.pipe(parser);
	});
});
