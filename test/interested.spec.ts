import fs from "fs";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";

describe("interested Nodes", () => {
	it("should properly parse a simple file.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/item.xml");
		const parser = new XmlParser();

		const expectedData =
			[
				{ $: { sub: "TESTING SUB" }, _: "one" },
				{ $: { sub: "2" }, _: "two" },
				{
					$: { id: "1", test: "hello" },
					subitem: [{ $: { sub: "TESTING SUB" }, _: "one" },
					{ $: { sub: "2" }, _: "two" }]
				},
				{ _: "three" },
				{ _: "four" },
				{ _: "five" },
				{
					$: { id: "2" },
					subitem: [{ _: "three" }, { _: "four" }, { _: "five" }]
				}
			];

		const actualData: string[] = [];
		let dataEventCount = 0;
		const expectedItems = [
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
		const actualItems: string[] = [];
		const actualSubitems: string[] = [];
		const expectedSubitems = [
			{ $: { sub: "TESTING SUB" }, _: "one" },
			{ $: { sub: "2" }, _: "two" },
			{ _: "three" },
			{ _: "four" },
			{ _: "five" }
		];

		parser.on("data", (data) => {
			actualData.push(data);
			dataEventCount++;
		});

		parser.on("error", (err) => {
			should(err).not.be.ok();
			done(err);
		});

		parser.on("item", (item) => {
			actualItems.push(item);
		});

		parser.on("subitem", (subitem) => {
			actualSubitems.push(subitem);
		});

		parser.on("end", () => {
			// console.log('actualData=', JSON.stringify(actualData, null, 1))
			// console.log('dataEventCount=', dataEventCount)
			should(actualData).deepEqual(expectedData);
			should(actualItems).deepEqual(expectedItems);
			should(actualSubitems).deepEqual(expectedSubitems);
			should(actualSubitems.length).equal(5);
			should(actualItems.length).equal(2);
			should(dataEventCount).equal(7);
			done();
		});

		xmlStream.pipe(parser);
	});

	it("should properly parse a medium size file.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/medium.xml");
		const parser = new XmlParser();

		let dataEventCount = 0;
		let itemEventCount = 0;
		let subitemEventCount = 0;

		parser.on("data", (data) => {
			dataEventCount++;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("item", (item) => {
			itemEventCount++;
		});

		parser.on("subitem", (subitem) => {
			subitemEventCount++;
		});

		parser.on("end", () => {
			// console.log('dataEventCount=', dataEventCount)
			// console.log('itemEventCount=', itemEventCount)
			// console.log('subitemEventCount=', subitemEventCount)
			should(dataEventCount).equal(31);
			should(itemEventCount).equal(10);
			should(subitemEventCount).equal(21);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly parse a file containing many nodes.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/manyItems.xml");
		const parser = new XmlParser();

		let dataEventCount = 0;
		let itemEventCount = 0;
		let subitemEventCount = 0;

		parser.on("data", (data) => {
			dataEventCount++;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("item", (item) => {
			itemEventCount++;
		});

		parser.on("subitem", (subitem) => {
			subitemEventCount++;
		});

		parser.on("end", () => {
			// console.log('dataEventCount=', dataEventCount)
			// console.log('itemEventCount=', itemEventCount)
			// console.log('subitemEventCount=', subitemEventCount)
			should(itemEventCount).equal(296);
			should(subitemEventCount).equal(600);
			should(dataEventCount).equal(896);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly parse a xml simple file in which nodes contain text values randomly.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/randomText.xml");
		const parser = new XmlParser();
		const expectedData =
			[
				{ $: { sub: "TESTING SUB" }, _: "one" },
				{ $: { sub: "2" }, _: "two" },
				{
					$: { id: "1", test: "hello" }, _: " item  one  two",
					subitem: [{ $: { sub: "TESTING SUB" }, _: "one" },
					{ $: { sub: "2" }, _: "two" }]
				},
				{ _: "three" },
				{ _: "four" },
				{ _: "five" },
				{
					$: { id: "2" }, _: " item  one two three  four",
					subitem: [{ _: "three" }, { _: "four" }, { _: "five" }]
				}
			];
		const expectedItems = [
			{
				$: { id: "1", test: "hello" }, _: " item  one  two",
				subitem:
					[{ $: { sub: "TESTING SUB" }, _: "one" },
					{ $: { sub: "2" }, _: "two" }]
			},
			{
				$: { id: "2" }, _: " item  one two three  four",
				subitem: [{ _: "three" }, { _: "four" }, { _: "five" }]
			}];
		const actualItems: string[] = [];
		const actualSubitems: string[] = [];
		const expectedSubitems = [
			{ $: { sub: "TESTING SUB" }, _: "one" },
			{ $: { sub: "2" }, _: "two" },
			{ _: "three" },
			{ _: "four" },
			{ _: "five" }
		];
		const actualData: string[] = [];
		let dataEventCount = 0;
		let itemEventCount = 0;
		let subitemEventCount = 0;

		parser.on("data", (data) => {
			actualData.push(data);
			dataEventCount++;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("item", (item) => {
			itemEventCount++;
			actualItems.push(item);
		});

		parser.on("subitem", (subitem) => {
			subitemEventCount++;
			actualSubitems.push(subitem);
		});

		parser.on("end", () => {
			// console.log('actualData=', JSON.stringify(actualData, null, 1))
			// console.log('dataEventCount=', dataEventCount)
			// console.log('itemEventCount=', itemEventCount)
			// console.log('subitemEventCount=', subitemEventCount)
			should(actualData).deepEqual(expectedData);
			should(actualItems).deepEqual(expectedItems);
			should(actualSubitems).deepEqual(expectedSubitems);
			should(dataEventCount).equal(7);
			should(itemEventCount).equal(2);
			should(subitemEventCount).equal(5);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly parse a huge file.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/hugeFile.xml");
		const parser = new XmlParser();

		let dataEventCount = 0;
		let itemEventCount = 0;
		let subitemEventCount = 0;

		parser.on("data", (data) => {
			dataEventCount++;
		});

		parser.on("error", (err) => {
			done(err);
		});

		parser.on("item", (item) => {
			itemEventCount++;
		});

		parser.on("subitem", (subitem) => {
			subitemEventCount++;
		});

		parser.on("end", () => {
			// console.log('dataEventCount=', dataEventCount)
			// console.log('itemEventCount=', itemEventCount)
			// console.log('subitemEventCount=', subitemEventCount)
			should(dataEventCount).equal(6272);
			should(itemEventCount).equal(2072);
			should(subitemEventCount).equal(4200);
			done();
		});
		xmlStream.pipe(parser);
	});

	it("should properly parse a simple file and return when root element when listening on it.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/item.xml");
		const parser = new XmlParser();
		const expectedData =
			[{
				item: [{
					$: { id: "1", test: "hello" },
					subitem: [{ $: { sub: "TESTING SUB" }, _: "one" },
					{ $: { sub: "2" }, _: "two" }]
				},
				{
					$: { id: "2" }, subitem: [{ _: "three" }, { _: "four" },
					{ _: "five" }]
				}]
			}];

		const actualData: string[] = [];
		let dataEventCount = 0;
		let itemsEventCount = 0;

		parser.on("data", (data) => {
			actualData.push(data);
			dataEventCount++;
		});

		parser.on("error", (err) => {
			should(err).not.be.ok();
			done(err);
		});

		parser.on("items", (item) => {
			itemsEventCount++;
		});

		parser.on("end", () => {
			// console.log('actualData=', JSON.stringify(actualData, null, 1))
			// console.log('dataEventCount=', dataEventCount)
			// console.log('itemEventCount=', itemsEventCount)
			should(actualData).deepEqual(expectedData);
			should(itemsEventCount).equal(1);
			should(dataEventCount).equal(1);
			done();
		});
		xmlStream.pipe(parser);
	});
});
