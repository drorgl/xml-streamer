import fs from "fs";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";

describe("Basic behavior", () => {
	it("should properly parse a simple file.", (done) => {
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
			should(err).not.be.ok();
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

	it("should properly parse a medium size file.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/medium.xml");
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
			should(dataEventCount).equal(10);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly parse a file containing many nodes.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/manyItems.xml");
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

	it("should properly parse a xml simple file in which nodes contain text values randomly.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/randomText.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });
		const expectedData = [{
			$: { id: "1", test: "hello" }, _: " item  one  two",
			subitem: [{ $: { sub: "TESTING SUB" }, _: "one" },
			{ $: { sub: "2" }, _: "two" }]
		},
		{
			$: { id: "2" }, _: " item  one two three  four",
			subitem: [{ _: "three" }, { _: "four" }, { _: "five" }]
		}
		];
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

	it("should properly parse a huge file.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/hugeFile.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });
		// console.log(parser)
		let dataEventCount = 0;
		parser.on("data", (data) => {
			dataEventCount++;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("end", () => {
			// console.log('dataEventCount=', dataEventCount)
			should(dataEventCount).equal(2072);
			done();
		});
		xmlStream.pipe(parser);
	});
});
