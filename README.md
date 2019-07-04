# xml-streamer

## IMPORTANT

This is a modified version of xml-streamer, the parser + tests stayed mostly the same but the core xml parser was replaced with [SaxLtx xml parser](https://github.com/xmppjs/ltx) due to reliability/stability issues with node-expat, both this library and ltx were converted to typescript.
Please note that ltx parser is about 20% slower than node-expat.

## Install

```
npm install xml-streamer
```

## Basic Usage

`xml-streamer can be used in four ways`

```typescript
// 1. By passing the resourcePath and reading data by calling `read` method instead listening for data events.

import {XmlParser} from "@drorgl/xml-streamer";

const opts = { resourcePath: "/items/item" };

const parser = new XmlParser(opts);

parser.on("end", () => {
	// parsing ended no more data events will be raised
});

parser.on("error", (error) => {
	// error occurred
	// NOTE: when error event emitted no end event will be emitted
	console.error(error);
});

xmlStream.pipe(parser); // pipe your input xmlStream to parser.
// readable
parser.on("readable", () => {
  // if you don't want to consume "data" on "data" events you can wait 
  // for readable event and consume data by calling parser.read()
});
// after readable event occured you can call read method and get data.
parser.read(); // will return one object at a time.


// 2. By listening for interested nodes.

import { XmlParser } from "@drorgl/xml-streamer";

const opts = {}; // see `Available Constructor Options` section below.

const parser = new XmlParser(opts);

parser.on("item", (item) => {
	// consume the item object here
});

parser.on("end", () => {
	// parsing ended no more data events will be raised
});

parser.on("error", (error) => {
	// error occurred
	// NOTE: when error event emitted no end event will be emitted
	console.error(error);
});

xmlStream.pipe(parser); // pipe your input xmlStream to parser.
// readable
parser.on("readable", () => {
  // if you don't want to consume "data" on "data" events you can wait 
  //for readable event and consume data by calling parser.read()
});


// 3. By passing a resource path.

import { XmlParser } from "@drorgl/xml-streamer";

const opts = { resourcePath: "/items/item" };

const parser = new XmlParser(opts);

parser.on("data", (data) => {
	// consume the data object here
});

parser.on("end", () => {
	// parsing ended no more data events will be raised
});

parser.on("error", (error) => {
	// error occurred
	// NOTE: when error event emitted no end event will be emitted
	console.error(error);
});

xmlStream.pipe(parser); // pipe your input xmlStream to parser.
// readable
parser.on("readable", () => {
	// if you don't want to consume "data" on "data" events you
	// can wait for readable event and consume data by calling parser.read()
});


// 4. By passing a string or buffer to parse function

import { XmlParser } from "@drorgl/xml-streamer";

const opts = { resourcePath: "/items/item" }; // resourcePath is manditory when using parse method

const parser = new XmlParser(opts);

parser.parse(stringOrBuffer, (err, data) => {
	// consume data here
});

// 5. Compressed Stream Parsing

import { XmlParser } from "@drorgl/xml-streamer";
import { StreamZip } from "node-stream-zip";

const zip = new StreamZip({
    file: archiveName,
    storeEntries: true
});


const opts = {}; // see `Available Constructor Options` section below.

const parser = new XmlParser(opts);

parser.on("item", (item) => {
	// consume the item object here
});

parser.on("end", () => {
	// parsing ended no more data events will be raised
});

parser.on("error", (error) => {
	// error occurred
	// NOTE: when error event emitted no end event will be emitted
	console.error(error);
});

xmlStream.pipe(parser); // pipe your input xmlStream to parser.
// readable
parser.on("readable", () => {
	// if you don't want to consume "data" on "data" events you can wait for readable event and consume data by calling parser.read()
});

zip.on("ready", () => {
    zip.stream('path/inside/zip.xml', (err, stm) => {
        stm.pipe(parser);
        stm.on('end', () => zip.close());
    });
});

```

## API

* `#on('readable' function () {})`
* `#on('end' function () {})` `Note: No end event will be emmited when error is emitted`
* `#on('error' function (err) {})` 
* `#on('nodeName' function (err) {})` //if you are interested to listen on the "nodeName" instead of "data"
* `#stop()` pauses
* `#resume()` resumes
* `#read()` returns object if stream is readable


## Available Constructor Options

* `resourcePath`: `Type: String` Optional field. Used to extract the XML nodes that you are interested in. 

            // Ex: let the XML be
                ```xml
                    <?xml version="1.0" encoding="utf-8"?>
                    <items>
                        <item id="1" test= 'hello'>
                            <subitem sub= "TESTING SUB">one</subitem>
                            <subitem sub= "2">two</subitem>
                        </item>
                        <item id="2">
                            <subitem>three</subitem>
                            <subitem>four</subitem>
                            <subitem>five</subitem>
                        </item>
                    </items>
                ```
           if you are interested in `item` nodes then resourcePath would be: `/items/item`
           if you are interested in `subitem` nodes then resourcePath would be: `/items/item/subitem`
           if you are interested in `items` nodes then resourcePath would be: `/items`



* `emitOnNodeName`: `Type: Boolean` Optional field. Set this to true if you want to listen on node names instead of data event. `default: false`
            
            // Ex: consider the above XML snippet
             ```javascript
                if you are interested in `item` nodes. You can listen for `data` event by default to get those nodes in JS object form
                        
                          parser.on('data', function (data) {
                             // item nodes as javascipt objects
                          })

                or else you can set `emitOnNodeName: true` and listen on node names like

                          parser.on('item', function (data) {
                             // item nodes as javascipt objects
                          })
             ```

                `NOTE:` when you set `emitOnNodeName:true` "data" events are emitted normally. So make sure you don't listen for both the events.



* `attrsKey`: `Type: String` Optional field. pass the value with which you want to reference attributes of a node in its object form. `default: '$'`
                  
* `textKey`: `Type: String` Optional field. pass the value with which you want to reference node value in its object form. `default: '_'`
                   
                   // In the above XML snippet `subitem` node will look like this after converted to javascript object
                  ```javascript
                          {
                              "$": {
                                  "sub": "TESTING SUB"
                              }
                              "_": "one"
                          }
                          // if you want like this
                          {
                              "attrs": {
                                  "sub": "TESTING SUB"
                              },
                              "text": "one"
                          }
                  ```
                     // Then set `attrsKey= "attrs"` and `textKey= "text"`


* `explicitArray`: `Type: Boolean` Optional field. `Default value is true`. All children nodes will come in an array when this option is true.

            // Ex: For example let the XML be
                ```xml
                    <?xml version="1.0" encoding="utf-8"?>
                    <items>
                        <item id="1" test= 'hello'>
                            <subitem sub= "2">two</subitem>
                        </item>
                    </items>
                ```
            // if explicitArray is true and resourcePath is /items/item. 
            // Output for above xml will be
                ```javascript
                        [
                           { '$': { id: '1', test: 'hello' },
                             subitem: { '$': { sub: '2' }, _: 'two' } },
                        ]
                ```
        `caution:` When explicitArray set to false and if there are multiple children nodes with same name then last node will override all preceding nodes. 

* `verbatimText`: `Type: Boolean` Optional field. `Default value is false`. When set, text attribute will include all blanks found in xml. When unset, blanks are removed as long as they come in one expat single block (blank lines, newlines and entities).

            // Ex: For example let the XML be
                ```xml
                    <?xml version="1.0" encoding="utf-8"?>
                    <items>
                        <item>
                This is
                a test
                        </item>
                    </items>
                ```
            // if verbatimText is true and resourcePath is /items/item.
            // Output for above xml will be
                ```javascript
                        [
                           { '_' : "\nThis is\na test\n            "}
                        ]
                ```

            // if verbatimText is false and resourcePath is /items/item.
            // Output for above xml will be
                ```javascript
                        [
                           { '_' : "This isa test"}
                        ]
                ```


## Namespace handling

A word about special parsing of *xmlns:* Note that "resourcePath" in the options is not an XPATH.
So the value given to the resourcePath is treated as simple value and no expression evaluations are done.

## Testing

```
npm test
```

## Coverage
```
npm coverage

=============================== Coverage summary ===============================
Statements   : 90.91% ( 340/374 )
Branches     : 81.66% ( 187/229 )
Functions    : 78.13% ( 25/32 )
Lines        : 90.86% ( 318/350 )
================================================================================
```

## Documentation
```
npm doc
```