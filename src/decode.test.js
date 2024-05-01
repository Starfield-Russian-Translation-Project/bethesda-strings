import { expect, test, describe, beforeAll } from "bun:test";
import { decode } from "./decode";
import { parseHeader } from "./util";

let dlStringsBuffer;
let stringsBuffer;

beforeAll(async () => {
  const dlStringsFile = Bun.file('.mock/starfield_en.dlstrings');
  const stringsFile = Bun.file('.mock/starfield_en.strings');

  dlStringsBuffer = await dlStringsFile.arrayBuffer();
  stringsBuffer = await stringsFile.arrayBuffer();
});

describe('Decoding *.strings', () => {
  test('Should decode *.strings file without errors', () => {
    expect(() => decode(stringsBuffer, 'string', 'en')).not.toThrow();
  });

  test('Elements count should be equal to count in *.strings file header' , () => {
    const view = new DataView(stringsBuffer)
    const decodedStrings = decode(stringsBuffer, 'string', 'en');
    const {stringsCount: countFromHeader} = parseHeader(view);

    expect(decodedStrings.length).toEqual(countFromHeader);
  });

  test('Decoded *.strings shouldn\'t contain c-null', () => {
    const decodedStrings = decode(stringsBuffer, 'string', 'en');
    const encoder = new TextEncoder();
    let isNullFound = false;

    decodedStrings.forEach(({text}) => {
      const buffer = encoder.encode(text);
      
      if (~buffer.indexOf(0)) 
        isNullFound = true;
      
    });

    expect(isNullFound).toBe(false);
  });
});

describe('Decoding *.dlstrings/*.ilstrings', () => {
  test('Should decode *.dlstrings/*.ilstrings file without errors', () => {
    expect(() => decode(dlStringsBuffer, 'dlstring', 'en')).not.toThrow();
  });

  test('Elements count should be equal to count in *.dlstrings/*.ilstrings file header' , () => {
    const view = new DataView(dlStringsBuffer);
    const decodedStrings = decode(dlStringsBuffer, 'dlstring', 'en');
    const {stringsCount: countFromHeader} = parseHeader(view);

    expect(decodedStrings.length).toEqual(countFromHeader);
  });

  test('Decoded *.dlstrings/*.ilstrings shouldn\'t contain c-null', () => {
    const decodedStrings = decode(dlStringsBuffer, 'dlstring', 'en');
    const encoder = new TextEncoder();
    let isNullFound = false;

    decodedStrings.forEach(({text}) => {
      const buffer = encoder.encode(text);
      
      if (~buffer.indexOf(0)) 
        isNullFound = true;
      
    });

    expect(isNullFound).toBe(false);
  });
});

describe('Common cases with decoding', () => {
  test('Should parse headers in *.dlstrings/*.ilstrings without errors', () => {
    const view = new DataView(dlStringsBuffer);

    expect(() => parseHeader(view)).not.toThrow();
  });

  test('Should parse headers in *.strings without errors', () => {
    const view = new DataView(stringsBuffer);

    expect(() => parseHeader(view)).not.toThrow();
  });

  test('Should throw an error when give wrong string type', () => {
    expect(() => decode((new ArrayBuffer(10)), 'wrong-type', 'en')).toThrowError();
  })
});
