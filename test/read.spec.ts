import fs from "fs";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";

describe("read method", () => {
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
		let obj;
		let Timeout: any;

		parser.on("readable", () => {
			Timeout = setInterval(() => {
				obj = parser.read();
				if (obj) {
					actualData.push(obj);
				}
				obj = null;
			}, 50);
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("end", () => {
			// console.log('actualData=', actualData)
			// console.log('dataEventCount=', dataEventCount)
			clearInterval(Timeout);
			should(actualData).deepEqual(expectedData);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly parse a file containing many nodes.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/manyItems.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });
		let objCount = 0;
		const endEventOcurred = false;

		parser.on("readable", () => {
			read();
		});

		function read() {
			while (parser.read()) { objCount++; }
			if (!endEventOcurred) { setTimeout(read, 50); }
		}

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("end", () => {
			// console.log(objCount)
			should(objCount).deepEqual(296);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly parse a huge.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/hugeFile.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });
		let objCount = 0;
		const endEventOcurred = false;

		parser.on("readable", () => {
			read();
		});

		function read() {
			while (parser.read()) { objCount++; }
			if (!endEventOcurred) { setTimeout(read, 50); }
		}

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("end", () => {
			// console.log(objCount)
			should(objCount).deepEqual(2072);
			done();
		});
		xmlStream.pipe(parser);
	});
});
