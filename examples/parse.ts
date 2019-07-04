// By passing a string or buffer to parse function

import { XmlParser } from "../";

const opts = { resourcePath: "/items/item" }; // resourcePath is manditory when using parse method

const parser = new XmlParser(opts);

parser.parse(stringOrBuffer, (err, data) => {
	// consume data here
});
