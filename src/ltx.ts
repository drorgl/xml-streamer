// Source: https://github.com/xmppjs/ltx/blob/master/lib/parsers/ltx.js
import events from "events";
import { unescapeXML } from "./unescape";

const STATE_TEXT = 0;
const STATE_IGNORE_COMMENT = 1;
const STATE_IGNORE_INSTRUCTION = 2;
const STATE_TAG_NAME = 3;
const STATE_TAG = 4;
const STATE_ATTR_NAME = 5;
const STATE_ATTR_EQ = 6;
const STATE_ATTR_QUOT = 7;
const STATE_ATTR_VALUE = 8;
const STATE_CDATA = 9;

const lineCounterRegExp = new RegExp("\n", "g");

export class SaxLtx extends events.EventEmitter {
	public remainder: string;
	public tagName: string;
	public attrs: any;
	public endTag: boolean;
	public selfClosing: boolean;
	public attrQuote: number;
	public attrQuoteChar: string;
	public recordStart = 0;
	public attrName: string;
	public state = STATE_TEXT;

	public currentLineNumber = 0;

	constructor() {
		super();

	}

	public getCurrentLineNumber() {
		return this.currentLineNumber + 1;
	}

	public end(data?: Buffer) {
		if (data) {
			this.write(data);
		}

		this.removeAllListeners();
	}
	public write(data: Buffer | string) {
		if (typeof data !== "string") {
			data = data.toString();
		}

		let pos = 0;
		const self = this;

		/* Anything from previous write()? */
		if (self.remainder) {
			data = self.remainder + data;
			pos += self.remainder.length;
			self.remainder = null;
		}

		function endRecording() {
			if (typeof self.recordStart === "number") {
				const recorded = (data as string).substring(self.recordStart, pos);
				self.recordStart = undefined;
				return recorded;
			}
		}

		let prevPos = pos;

		for (; pos < data.length; pos++) {

			if (self.state === STATE_TEXT) {
				// if we're looping through text, fast-forward using indexOf to
				// the next '<' character
				const lt = data.indexOf("<", pos);
				if (lt !== -1 && pos !== lt) {
					pos = lt;
				}
			} else if (self.state === STATE_ATTR_VALUE) {
				// if we're looping through an attribute, fast-forward using
				// indexOf to the next end quote character
				const quot = data.indexOf(self.attrQuoteChar, pos);
				if (quot !== -1) {
					pos = quot;
				}
			} else if (self.state === STATE_IGNORE_COMMENT) {
				// if we're looping through a comment, fast-forward using
				// indexOf to the first end-comment character
				const endcomment = data.indexOf("-->", pos);
				if (endcomment !== -1) {
					pos = endcomment + 2; // target the '>' character
				}
			}

			const newLines = (data.substring(prevPos, pos + 1).match(lineCounterRegExp) || []).length;
			self.currentLineNumber += newLines;
			prevPos = pos;

			const c = data.charCodeAt(pos);
			switch (self.state) {
				case STATE_TEXT:
					if (c === 60 /* < */) {
						const text = endRecording();
						if (text) {
							self.emit("text", unescapeXML(text));
						}
						self.state = STATE_TAG_NAME;
						self.recordStart = pos + 1;
						self.attrs = {};
					}
					break;
				case STATE_CDATA:
					if (c === 93 /* ] */ && data.substr(pos + 1, 2) === "]>") {
						const cData = endRecording();
						if (cData) {
							self.emit("text", cData);
						}
						self.state = STATE_IGNORE_COMMENT;
					}
					break;
				case STATE_TAG_NAME:
					if (c === 47 /* / */ && self.recordStart === pos) {
						self.recordStart = pos + 1;
						self.endTag = true;
					} else if (c === 33 /* ! */) {
						if (data.substr(pos + 1, 7) === "[CDATA[") {
							self.recordStart = pos + 8;
							self.state = STATE_CDATA;
						} else if (data.substr(pos + 1, 7) === "DOCTYPE") {
							self.recordStart = pos + 8;
							self.state = STATE_TEXT;
						} else {
							self.recordStart = undefined;
							self.state = STATE_IGNORE_COMMENT;
						}
					} else if (c === 63 /* ? */) {
						self.recordStart = undefined;
						self.state = STATE_IGNORE_INSTRUCTION;
					} else if (c <= 32 || c === 47 /* / */ || c === 62 /* > */) {
						self.tagName = endRecording();
						pos--;
						self.state = STATE_TAG;
					}
					break;
				case STATE_IGNORE_COMMENT:
					if (c === 62 /* > */) {
						const prevFirst = data.charCodeAt(pos - 1);
						const prevSecond = data.charCodeAt(pos - 2);
						if ((prevFirst === 45 /* - */ && prevSecond === 45 /* - */) ||
							(prevFirst === 93 /* ] */ && prevSecond === 93 /* ] */)) {
								self.state = STATE_TEXT;
						}
					}
					break;
				case STATE_IGNORE_INSTRUCTION:
					if (c === 62 /* > */) {
						const prev = data.charCodeAt(pos - 1);
						if (prev === 63 /* ? */) {
							self.state = STATE_TEXT;
						}
					}
					break;
				case STATE_TAG:
					if (c === 62 /* > */) {
						self._handleTagOpening(self.endTag, self.tagName, self.attrs);
						self.tagName = undefined;
						self.attrs = undefined;
						self.endTag = undefined;
						self.selfClosing = undefined;
						self.state = STATE_TEXT;
						self.recordStart = pos + 1;
					} else if (c === 47 /* / */) {
						self.selfClosing = true;
					} else if (c > 32) {
						self.recordStart = pos;
						self.state = STATE_ATTR_NAME;
					}
					break;
				case STATE_ATTR_NAME:
					if (c <= 32 || c === 61 /* = */) {
						self.attrName = endRecording();
						pos--;
						self.state = STATE_ATTR_EQ;
					}
					break;
				case STATE_ATTR_EQ:
					if (c === 61 /* = */) {
						self.state = STATE_ATTR_QUOT;
					}
					break;
				case STATE_ATTR_QUOT:
					if (c === 34 /* " */ || c === 39 /* ' */) {
						self.attrQuote = c;
						self.attrQuoteChar = c === 34 ? '"' : "'";
						self.state = STATE_ATTR_VALUE;
						self.recordStart = pos + 1;
					}
					break;
				case STATE_ATTR_VALUE:
					if (c === self.attrQuote) {
						const value = unescapeXML(endRecording());
						self.attrs[self.attrName] = value;
						self.attrName = undefined;
						self.state = STATE_TAG;
					}
					break;
			}
		}

		if (typeof self.recordStart === "number" &&
			self.recordStart <= data.length) {
			self.remainder = data.slice(self.recordStart);
			self.recordStart = 0;
		}
	}
	private _handleTagOpening(endTag: boolean, tagName: string, attrs: string) {
		if (!endTag) {
			this.emit("startElement", tagName, attrs);
			if (this.selfClosing) {
				this.emit("endElement", tagName);
			}
		} else {
			this.emit("endElement", tagName);
		}
	}
}
