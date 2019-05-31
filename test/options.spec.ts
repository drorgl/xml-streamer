import fs from "fs";
import "mocha";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";
describe("should respect the options passed", () => {
	it("should properly generate objects with $ as key for attrs and _ as key for text value of node.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/item.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });
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
		let dataEventCount = 0;

		parser.on("data", (data) => {
			actualData.push(data);
			dataEventCount++;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("end", () => {
			// console.log('actualData=', actualData)
			// console.log('dataEventCount=', dataEventCount)
			should(actualData).deepEqual(expectedData);
			should(dataEventCount).equal(2);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly generate objects with passed attrs and text keys in the options.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/item.xml");
		const parser = new XmlParser({ resourcePath: "/items/item", attrsKey: "attrs", textKey: "text" });
		const expectedData = [
			{
				attrs: { id: "1", test: "hello" },
				subitem:
					[{ attrs: { sub: "TESTING SUB" }, text: "one" },
					{ attrs: { sub: "2" }, text: "two" }]
			},
			{
				attrs: { id: "2" },
				subitem: [{ text: "three" }, { text: "four" }, { text: "five" }]
			}];
		const actualData: string[] = [];
		let dataEventCount = 0;

		parser.on("data", (data) => {
			actualData.push(data);
			dataEventCount++;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("end", () => {
			// console.log('actualData=', JSON.stringify(actualData, null, 1))
			// console.log('dataEventCount=', dataEventCount)
			should(actualData).deepEqual(expectedData);
			should(dataEventCount).equal(2);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly generate objects when special symbols are passed as attrs and text keys in the options.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/item.xml");
		const parser = new XmlParser({ resourcePath: "/items/item", attrsKey: "!", textKey: "%" });
		const expectedData = [
			{
				"!": { id: "1", test: "hello" },
				"subitem":
					[{ "!": { sub: "TESTING SUB" }, "%": "one" },
					{ "!": { sub: "2" }, "%": "two" }]
			},
			{
				"!": { id: "2" },
				"subitem": [{ "%": "three" }, { "%": "four" }, { "%": "five" }]
			}];
		const actualData: string[] = [];
		let dataEventCount = 0;

		parser.on("data", (data) => {
			actualData.push(data);
			dataEventCount++;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("end", () => {
			// console.log('actualData=', JSON.stringify(actualData, null, 1))
			// console.log('dataEventCount=', dataEventCount)
			should(actualData).deepEqual(expectedData);
			should(dataEventCount).equal(2);
			done();
		});
		xmlStream.pipe(parser);
	});
});
