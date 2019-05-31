import fs from "fs";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";
describe("should respect explicitArray constructor option", () => {
	it("should properly parse a simple file with explicitArray set to false.", (done) => {
		const xml = fs.readFileSync("./test/TestFiles/item.xml");
		const parser = new XmlParser({ resourcePath: "/items/item", explicitArray: false });
		const expectedData = [
			{
				$: { id: "1", test: "hello" },
				subitem: { $: { sub: "2" }, _: "two" }
			},
			{
				$: { id: "2" },
				subitem: { _: "five" }
			}];

		parser.parse(xml.toString(), (err, data) => {
			if (err) { done(err); }
			// console.log('data=', JSON.stringify(data))
			should(data).deepEqual(expectedData);
			done();
		});
	});

	it("should properly parse a medium size file with explicitArray set to false.", (done) => {
		const xml = fs.readFileSync("./test/TestFiles/medium.xml");
		const parser = new XmlParser({ resourcePath: "/items/item", explicitArray: false });
		const expectedData = [
			{
				$: {
					id: "1",
					test: "hello"
				},
				subitem: {
					$: {
						sub: "2"
					},
					_: "two"
				}
			},
			{
				$: {
					id: "2"
				},
				subitem: {
					_: "five"
				}
			},
			{
				$: {
					id: "3",
					test: "hello"
				},
				subitem: {
					$: {
						sub: "2"
					},
					_: "two"
				}
			},
			{
				$: {
					id: "4",
					test: "hello"
				},
				subitem: {
					$: {
						sub: "2"
					},
					_: "two"
				}
			},
			{
				$: {
					id: "5",
					test: "hello"
				},
				subitem: {
					$: {
						sub: "2"
					},
					_: "two"
				}
			},
			{
				$: {
					id: "6",
					test: "hello"
				},
				subitem: {
					$: {
						sub: "2"
					},
					_: "two"
				}
			},
			{
				$: {
					id: "7",
					test: "hello"
				},
				subitem: {
					$: {
						sub: "2"
					},
					_: "two"
				}
			},
			{
				$: {
					id: "8",
					test: "hello"
				},
				subitem: {
					$: {
						sub: "2"
					},
					_: "two"
				}
			},
			{
				$: {
					id: "9",
					test: "hello"
				},
				subitem: {
					$: {
						sub: "2"
					},
					_: "two"
				}
			},
			{
				$: {
					id: "10",
					test: "hello"
				},
				subitem: {
					$: {
						sub: "2"
					},
					_: "two"
				}
			}
		];
		parser.parse(xml, (err, data) => {
			if (err) { done(err); }

			should(data).deepEqual(expectedData);
			should(data.length).equal(10);
			done();
		});
	});

	it("should properly parse a file containing many nodes when explicitArray set to false.", (done) => {
		const xml = fs.readFileSync("./test/TestFiles/manyItems.xml");
		const parser = new XmlParser({ resourcePath: "/items/item", explicitArray: false });

		parser.parse(xml, (err, data) => {
			if (err) { done(err); }

			should(data.length).equal(296);
			done();
		});
	});

	it("should properly parse a xml simple file in which nodes contain text values randomly when explicitArray set to false.", (done) => {
		const xml = fs.readFileSync("./test/TestFiles/randomText.xml");
		const parser = new XmlParser({ resourcePath: "/items/item", explicitArray: false });
		const expectedData = [{
			$: { id: "1", test: "hello" }, _: "item one two",
			subitem: { $: { sub: "2" }, _: "two" }
		},
		{
			$: { id: "2" }, _: "item one two three four",
			subitem: { _: "five" }
		}
		];

		parser.parse(xml, (err, data) => {
			if (err) { done(err); }

			should(data).deepEqual(expectedData);
			should(data.length).equal(2);
			done();
		});
	});

	it("should properly parse a huge file with explicitArray set to false.", (done) => {
		const xml = fs.readFileSync("./test/TestFiles/hugeFile.xml");
		const parser = new XmlParser({ resourcePath: "/items/item", explicitArray: false });
		// console.log(parser)
		parser.parse(xml, (err, data) => {
			if (err) { done(err); }
			should(data.length).equal(2072);
			done();
		});
	});

	it("should properly return error if the xml file is corrupted.", (done) => {
		const xml = fs.readFileSync("./test/TestFiles/corrupted.xml");
		const parser = new XmlParser({ resourcePath: "/items/item", explicitArray: false });

		parser.parse(xml, (err, data) => {
			// console.log(err)
			should(err.message).equal("mismatched tag at line no: 12");
			should(data).not.be.ok();
			done();
		});
	});

	it("should properly generate objects when special symbols are passed as attrs and text keys and explicitArray is false in the options.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/item.xml");
		const parser = new XmlParser({ resourcePath: "/items/item", attrsKey: "!", textKey: "%", explicitArray: false });
		const expectedData = [
			{
				"!": { id: "1", test: "hello" },
				"subitem": { "!": { sub: "2" }, "%": "two" }
			},
			{
				"!": { id: "2" },
				"subitem": { "%": "five" }
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
