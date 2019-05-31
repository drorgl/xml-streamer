// Type definitions for node-expat 2.3.x
// Project: http://nodejs.org/
// Definitions by: Microsoft TypeScript <http://typescriptlang.org>
//                 Oleksandr Fedorchuk <https://github.com/kol-93>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped


declare module "node-expat" {
    import { Stream } from "stream";
    import { EventEmitter } from "events";

    interface NameSpace<ValueType = any> {
        [key: string]: ValueType;
    }
    
    interface TypedEmitter<EventMapType extends NameSpace<any[]>> extends EventEmitter {
        addListener<Event extends keyof EventMapType>           (event: Event, listener: (...args: EventMapType[Event]) => void): this;
        on<Event extends keyof EventMapType>                    (event: Event, listener: (...args: EventMapType[Event]) => void): this;
        once<Event extends keyof EventMapType>                  (event: Event, listener: (...args: EventMapType[Event]) => void): this;
        prependListener<Event extends keyof EventMapType>       (event: Event, listener: (...args: EventMapType[Event]) => void): this;
        prependOnceListener<Event extends keyof EventMapType>   (event: Event, listener: (...args: EventMapType[Event]) => void): this;
        removeListener<Event extends keyof EventMapType>        (event: Event, listener: (...args: EventMapType[Event]) => void): this;
        emit<Event extends keyof EventMapType>                  (event: Event, ...args: EventMapType[Event]): boolean;
        
        addListener                                             (event: string | symbol, listener: (...args: any[]) => void): this;
        on                                                      (event: string | symbol, listener: (...args: any[]) => void): this;
      

        once                                                    (event: string | symbol, listener: (...args: any[]) => void): this;
        prependListener                                         (event: string | symbol, listener: (...args: any[]) => void): this;
        prependOnceListener                                     (event: string | symbol, listener: (...args: any[]) => void): this;
        removeListener                                          (event: string | symbol, listener: (...args: any[]) => void): this;
        emit                                                    (event: string | symbol, ...args: any[]): boolean;
    }
    
    interface ParserEventsMap extends NameSpace<any[]> {
        startElement: [string, NameSpace<string>];
        endElement: [string];
        text: [string];
        comment: [string];
        processingInstruction: [string, string];
        xmlDecl: [string | null, string | null, boolean];
        startCdata: [];
        endCdata: [];
        entityDecl: [string | null, boolean, string | null, string | null, string | null, string | null, string | null];
        end: [];
        close: [];
        error: [string | Error];
    }
    
    export class Parser extends Stream implements NodeJS.WritableStream, TypedEmitter<ParserEventsMap>
    {
        readonly writable: boolean;
        stop(): this;
        
        pause(): this;
        resume(): this;
        
        parse(buf: string | Buffer, isFinal?: boolean): boolean;
        setEncoding(value: string): this;
        /// @TODO setUnknownEncoding
        getError(): string | null;
        destroy(): this;
        destroySoon(): this;
        
        write(buffer: Buffer | string, cb?: Function): boolean;
        write(str: string, encoding?: string, cb?: Function): boolean;
        end(cb?: Function): boolean;
        end(chunk: Buffer, cb?: Function): boolean;
        end(chunk: string, cb?: Function): boolean;
        end(chunk: string, encding?: string, cb?: Function): boolean;
        reset(this: Parser): this;
        getCurrentLineNumber(this: Parser): number;
        getCurrentColumnNumber(this: Parser): number;
        getCurrentByteIndex(this: Parser): number;

        on                                                      (event: "startElement", listener:(name:string, attrs: any)=>void):this;
        on                                                      (event: "endElement", listener:(name:string)=>void):this;
        on                                                      (event: "text", listener:(text:string)=>void):this;
        on                                                      (event: "processingInstruction", listener:(target:any, data:any)=>void):this;
        on                                                      (event: "comment", listener:(s:string)=>void):this;
        on                                                      (event: "xmlDecl", listener:(version:string, encoding: string, standalone: boolean)=>void):this;
        on                                                      (event: "startCdata", listener:()=>void):this;
        on                                                      (event: "endCdata", listener:()=>void):this;
        on                                                      (event: "entityDecl", listener:(entityName:string, isParameterEntity:boolean, value:string, base:string, systemId:string, publicId:string, notationName:string)=>void):this;
        on                                                      (event: "error", listener:(e:Error)=>void):this;
        on                                                      (event: "close", listener:()=>void):this;
    }
    
    export function createParser(callback?: (name: string, attributes: NameSpace<string>) => void): Parser;
}
