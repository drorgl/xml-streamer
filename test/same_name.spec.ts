import fs from "fs";
import "mocha";
import should from "should";
import stream from "stream";
import zlib from "zlib";

import { XmlParser } from "../src/parser";

describe("nodes with same names", () => {
	it("should properly parse a simple file containing nodes with same names.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/nodesWithSameNames.xml");
		const parser = new XmlParser();

		const actualData: string[] = [];
		const actualItems: string[] = [];
		let dataEventCount = 0;

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

		parser.on("end", () => {
			should(actualItems.length).equal(18);
			should(dataEventCount).equal(18);
			done();
		});

		xmlStream.pipe(parser);
	});

	it("should properly parse a simple file containing nodes with same names and emit events on multiple nodes.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/nodesWithSameNames.xml");
		const parser = new XmlParser();

		let dataEventCount = 0;
		let itemEventCount = 0;
		let subitemEventCount = 0;

		parser.on("data", (data) => {
			dataEventCount++;
		});

		parser.on("error", (err) => {
			should(err).not.be.ok();
			done(err);
		});

		parser.on("item", (item) => {
			itemEventCount++;
		});

		parser.on("subitem", (subitem) => {
			subitemEventCount++;
		});

		parser.on("end", () => {
			should(itemEventCount).equal(18);
			should(subitemEventCount).equal(13);
			should(dataEventCount).equal(31);
			done();
		});

		xmlStream.pipe(parser);
	});

	it("should properly parse a medium size file with same names randomly.", (done) => {
		const xmlStream = fs.createReadStream("./test/TestFiles/nodesWithSameNamesRandomly.xml");
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
			should(dataEventCount).equal(32);
			should(itemEventCount).equal(19);
			should(subitemEventCount).equal(13);
			done();
		});
		xmlStream.pipe(parser);
	});
});
