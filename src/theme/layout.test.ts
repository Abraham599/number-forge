import assert from "node:assert/strict";
import { layoutFromSize } from "./layout-core.ts";

const phonePortrait = layoutFromSize(430, 932);
assert.equal(phonePortrait.compact, true);
assert.equal(phonePortrait.split, false);
assert.equal(phonePortrait.sideChrome, false);
assert.equal(phonePortrait.foldGutter, 0);

const phoneLandscape = layoutFromSize(932, 430);
assert.equal(phoneLandscape.landscape, true);
assert.equal(phoneLandscape.split, true);
assert.equal(phoneLandscape.sideChrome, true);
assert.equal(phoneLandscape.foldGutter > 0, true);

const innerPortrait = layoutFromSize(768, 1024);
assert.equal(innerPortrait.regular, true);
assert.equal(innerPortrait.columns, true);
assert.equal(innerPortrait.split, false);

console.log("layout ok");
