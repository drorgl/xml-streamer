import _ from "lodash";
import stream from "stream";
import util from "util";

import { SaxLtx } from "./ltx";
import { ParserState } from "./parserState";
const defaults = {
	resourcePath: "",
	emitOnNodeName: false,
	attrsKey: "$",
	textKey: "_",
	explicitArray: true,
	verbatimText: false,
	preserveWhitespace: false
};

export interface IXmlParserOptions {
	resourcePath?: string;
	emitOnNodeName?: boolean;
	attrsKey?: string;
	textKey?: string;
	explicitArray?: boolean;
	verbatimText?: boolean;
	preserveWhitespace?: boolean;
}

export class XmlParser extends stream.Transform {
	public parserState: ParserState;
	private opts: IXmlParserOptions;
	private _readableState: { objectMode: true, buffer: any };
	private parser: SaxLtx;
	constructor(opts?: IXmlParserOptions) {
		super();
		this.opts = _.defaults(opts, defaults);
		this.parserState = new ParserState();
		this.parser = new SaxLtx();
		this._readableState.objectMode = true;
	}

	public checkForInterestedNodeListeners() {
		const ignore = ["end", "prefinish", "data", "error"];
		const eventNames = Object.keys((this as any)._events);

		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < eventNames.length; i++) {
			if (_.includes(ignore, eventNames[i], 0)) { continue; }
			this.parserState.interestedNodes.push(eventNames[i]);
		}
	}

	public _transform(chunk: Buffer | string, encoding: string, callback: () => void) {
		if (encoding !== "buffer") { this.emit("error", new Error("unsupported encoding")); }

		this.processChunk(chunk);
		callback();
	}

	public processChunk(chunk: string | Buffer) {
		const parser = this.parser;
		const state = this.parserState;

		if (state.isRootNode) {
			this.checkForInterestedNodeListeners();
			registerEvents.call(this);
		}

		parser.write(chunk);
	}

	public parse(chunk: Buffer | string, cb: (error: Error, data?: Buffer) => void) {
		const parser = this.parser;
		const state = this.parserState;
		let error;

		if (state.isRootNode) {
			this.checkForInterestedNodeListeners();
			registerEvents.call(this);
		}

		this.on("error", (err) => {
			error = err;
		});

		if (chunk.length === 0) {
			parser.end();
			this.emit("end");
			this.removeAllListeners();
		}

		parser.write(chunk);

		if (error) { return cb(error); }

		const result = [];
		while (this._readableState.buffer.length > 0) {
			result.push(this._readableState.buffer.consume());
		}
		return cb(null, result as any);
	}

	public _flush(callback: () => void) {
		this.processChunk("");
		callback();
	}

}

function registerEvents() {
	const scope = this;
	const parser: SaxLtx = this.parser;
	const state: ParserState = this.parserState;
	let lastIndex;
	const resourcePath = this.opts.resourcePath;
	const attrsKey = this.opts.attrsKey;
	const textKey = this.opts.textKey;
	const interestedNodes = state.interestedNodes;
	const explicitArray = this.opts.explicitArray;
	const verbatimText = this.opts.verbatimText;
	const preserveWhitespace = this.opts.preserveWhitespace;

	parser.on("startElement", (name, attrs) => {
		if (state.isRootNode) { state.isRootNode = false; }
		state.currentPath = state.currentPath + "/" + name;
		checkForResourcePath(name);
		if (state.isPathfound) { processStartElement(name, attrs); }
	});

	parser.on("endElement", (name) => {
		state.lastEndedNode = name;
		lastIndex = state.currentPath.lastIndexOf("/" + name);
		if (state.currentPath.substring(lastIndex + 1).indexOf("/") !== -1) {
			processError.call(this, `mismatched tag`);
		}
		state.currentPath = state.currentPath.substring(0, lastIndex);
		if (state.isPathfound) { processEndElement(name); }
		checkForResourcePath(name);
	});

	parser.on("text", (text) => {
		if (state.isPathfound) { processText(text); }
	});

	parser.on("error", function(err) {
		processError.call(this, err);
	});

	function processStartElement(name: string, attrs: any) {
		if (!name) { return; }

		const obj: any = {};
		if (attrs && !_.isEmpty(attrs)) { obj[attrsKey] = attrs; }
		let tempObj = state.object;
		const path = getRelativePath(/*name*/);
		if (!path) {
			if (attrs && !_.isEmpty(attrs)) { state.object[attrsKey] = attrs; }
			return;
		}
		const tokens = path.split(".");

		for (let i = 0; i < tokens.length; i++) {
			if (tempObj[tokens[i]] && !(explicitArray === false && i === tokens.length - 1)) {
				tempObj = tempObj[tokens[i]];
			} else {
				// if explicitArray is true then create each node as array
				// irrespective of how many nodes are there with same name.
				tempObj[tokens[i]] = explicitArray ? [] : obj;
				tempObj = tempObj[tokens[i]];
			}
			if (Array.isArray(tempObj) && i !== tokens.length - 1) { tempObj = tempObj[tempObj.length - 1]; }
		}

		if (Array.isArray(tempObj)) {
			tempObj.push(obj);
		}
	}

	function processEndElement(name: string) {
		if (resourcePath) {
			const index = resourcePath.lastIndexOf("/");
			const rpath = resourcePath.substring(0, index);

			if (rpath === state.currentPath) {
				scope.push(state.object);
				if (scope.opts.emitOnNodeName) { scope.emit(name, state.object); }
				state.object = {};
			}
		} else {
			if (_.includes(interestedNodes, name, 0)) {
				emitInterestedNode(name);
				if (state.firstFoundNode === name) {
					state.object = {};
					state.firstFoundNode = "";
					state.isPathfound = false;
				}
			}
		}
	}

	function emitInterestedNode(name: string) {
		let index;
		let xpath;
		let pathTokens;

		xpath = state.currentPath.substring(1);
		pathTokens = xpath.split("/");
		pathTokens.push(name);
		index = pathTokens.indexOf(state.firstFoundNode);
		pathTokens = _.drop(pathTokens, index + 1);
		let tempObj = state.object;
		// tslint:disable-next-line:prefer-for-of
		for (let i = 0; i < pathTokens.length; i++) {
			tempObj = tempObj[pathTokens[i] as any];
		}
		if (Array.isArray(tempObj)) { tempObj = tempObj[tempObj.length - 1]; }

		scope.emit(name, tempObj);
		scope.push(tempObj);
	}

	function processText(text: string) {
		if ((!text) || ((!verbatimText) && !/\S/.test(text))) {
			return;
		}

		const path = getRelativePath();
		let tempObj = state.object;
		if (!path) {
			if (!state.object[textKey]) { state.object[textKey] = ""; }
			state.object[textKey] = state.object[textKey] + text;
			if ((!preserveWhitespace)) {
				state.object[textKey] = state.object[textKey].replace(/\s+/g, " ").trim();
			}
			return;
		}
		const tokens = path.split(".");
		for (let i = 0; i < tokens.length; i++) {
			if (tempObj[tokens[i]]) {
				tempObj = tempObj[tokens[i]];
			} else {
				tempObj[tokens[i]] = explicitArray ? [] : {};
				tempObj = tempObj[tokens[i]];
			}
			if (Array.isArray(tempObj) && i !== tokens.length - 1) { tempObj = tempObj[tempObj.length - 1]; }
		}

		if (Array.isArray(tempObj)) {
			const obj = tempObj[tempObj.length - 1];
			if (!obj[textKey]) { obj[textKey] = ""; }
			obj[textKey] = obj[textKey] + text;

			if ((!preserveWhitespace)) {
				obj[textKey] = obj[textKey].replace(/\s+/g, " ").trim();
			}

		} else {
			if (!tempObj[textKey]) { tempObj[textKey] = ""; }
			tempObj[textKey] = tempObj[textKey] + text;

			if ((!preserveWhitespace)) {
				tempObj[textKey] = tempObj[textKey].replace(/\s+/g, " ").trim();
			}
		}

	}

	function checkForResourcePath(name: string) {
		if (resourcePath) {
			if (state.currentPath.indexOf(resourcePath) === 0) {
				state.isPathfound = true;
			} else {
				state.isPathfound = false;
			}
		} else {
			if (_.includes(interestedNodes, name, 0)) {
				state.isPathfound = true;
				if (!state.firstFoundNode) {
					state.firstFoundNode = name;
				}
			}
		}
	}

	function getRelativePath() {
		let tokens;
		let jsonPath;
		let index;

		if (resourcePath) {
			let xpath = state.currentPath.substring(resourcePath.length);

			if (!xpath) { return; }
			if (xpath[0] === "/") { xpath = xpath.substring(1); }
			tokens = xpath.split("/");
			jsonPath = tokens.join(".");
		} else {
			const xpath = state.currentPath.substring(1);
			tokens = xpath.split("/");
			index = tokens.indexOf(state.firstFoundNode);
			tokens = _.drop(tokens, index + 1);
			jsonPath = tokens.join(".");
		}
		return jsonPath;
	}
}

function processError(err: Error) {
	const parser = this.parser;
	let error: Error = null;

	if (err) {
		error = err;
	} else {
		error = parser.getError();
	}
	error = new Error(`${error} at line no: ${parser.getCurrentLineNumber()}`);
	this.emit("error", error);
	return error;
}
