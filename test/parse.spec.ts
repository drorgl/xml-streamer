import fs from "fs";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";
describe("Parse function should work properly", () => {
	it("should properly parse a simple file.", (done) => {
		const xml = fs.readFileSync("./test/TestFiles/item.xml");
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

		parser.parse(xml.toString(), (err, data) => {
			if (err) { done(err); }
			should(data).deepEqual(expectedData);
			done();
		});
	});

	it("should properly parse a medium size file.", (done) => {
		const xml = fs.readFileSync("./test/TestFiles/medium.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });

		parser.parse(xml, (err, data) => {
			if (err) { done(err); }
			should(data.length).equal(10);
			done();
		});
	});

	it("should properly parse a file containing many nodes.", (done) => {
		const xml = fs.readFileSync("./test/TestFiles/manyItems.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });

		parser.parse(xml, (err, data) => {
			if (err) { done(err); }
			should(data.length).equal(296);
			done();
		});
	});

	it("should properly parse a xml simple file in which nodes contain text values randomly.", (done) => {
		const xml = fs.readFileSync("./test/TestFiles/randomText.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });
		const expectedData = [{
			$: { id: "1", test: "hello" }, _: "item one two",
			subitem: [{ $: { sub: "TESTING SUB" }, _: "one" },
			{ $: { sub: "2" }, _: "two" }]
		},
		{
			$: { id: "2" }, _: "item one two three four",
			subitem: [{ _: "three" }, { _: "four" }, { _: "five" }]
		}
		];

		parser.parse(xml, (err, data) => {
			if (err) { done(err); }
			should(data).deepEqual(expectedData);
			should(data.length).equal(2);
			done();
		});
	});

	it("should properly parse a huge file.", (done) => {
		const xml = fs.readFileSync("./test/TestFiles/hugeFile.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });
		// console.log(parser)
		parser.parse(xml, (err, data) => {
			if (err) { done(err); }
			should(data.length).equal(2072);
			done();
		});
	});

	it("should properly return error if the xml file is corrupted.", (done) => {
		const xml = fs.readFileSync("./test/TestFiles/corrupted.xml");
		const parser = new XmlParser({ resourcePath: "/items/item" });

		parser.parse(xml, (err, data) => {
			// console.log(err)
			should(err.message).equal("mismatched tag at line no: 12");
			should(data).not.be.ok();
			done();
		});
	});
});
