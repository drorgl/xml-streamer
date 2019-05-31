import fs from "fs";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";
describe("pause and resume", () => {
	it("should properly parse a simple file.", function(done) {
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
		let isSetTimeoutHappened = true;
		this.timeout(4000);
		parser.on("data", (data) => {
			actualData.push(data);
			parser.pause();
			should(isSetTimeoutHappened).equal(true);
			setTimeout(() => {
				parser.resume();
				isSetTimeoutHappened = true;
			}, 1000);
			dataEventCount++;
			isSetTimeoutHappened = false;
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

	it("should emit data events with 1sec interval between each using pause and resume.", function(done) {
		const xmlStream = fs.createReadStream("./test/TestFiles/medium.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });

		let dataEventCount = 0;
		let isSetTimeoutHappened = true;
		this.timeout(20000);
		parser.on("data", (data) => {
			parser.pause();
			should(isSetTimeoutHappened).equal(true);
			setTimeout(() => {
				parser.resume();
				isSetTimeoutHappened = true;
			}, 1000);
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
		xmlStream.pipe(parser);
	});
});
