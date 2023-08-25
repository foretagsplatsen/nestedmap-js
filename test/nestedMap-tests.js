import { describe, it } from "node:test";
import NestedMap from "../src/NestedMap.js";
import assert from "node:assert/strict";

describe("NestedMap", () => {
  describe("the constructor", () => {
    it("accept pairs as argument", () => {
      let key1 = makeKey("key1");
      let key2 = makeKey("key2");
      let value1 = makeValue("value1");
      let value2 = makeValue("value2");

      let pairs = [
        [[key1, key2], value1],
        [[key2, key1], value2],
      ];

      let map = new NestedMap({ pairs });

      assert.equal(map.get([key1, key2]), value1);
      assert.equal(map.get([key2, key1]), value2);
    });
  });

  describe("get()", () => {
    it("accepts keys of length 1", () => {
      let map = new NestedMap();
      let key = makeKey();
      let value = makeValue();
      let keys = [key];

      map.set(keys, value);

      let result = map.get(keys);

      assert(result === value);
    });

    it("accepts keys of length 2", () => {
      let map = new NestedMap();
      let key1 = makeKey("key1");
      let key2 = makeKey("key2");
      let value = makeValue();
      let keys = [key1, key2];

      map.set(keys, value);

      let result = map.get(keys);

      assert(result === value);
    });

    it("considers equal 2 keys with same elements in same order", () => {
      let map = new NestedMap();
      let key1 = makeKey("key1");
      let key2 = makeKey("key2");
      let value = makeValue();

      map.set([key1, key2], value);

      let result = map.get([key1, key2]);

      assert(result === value);
    });

    it("considers different 2 keys with same elements in different order", () => {
      let map = new NestedMap();
      let key1 = makeKey("key1");
      let key2 = makeKey("key2");
      let value = makeValue();

      map.set([key1, key2], value);

      let result = map.get([key2, key1]);

      assert.equal(result, undefined);
    });

    it("passing a prefix key returns a partial view", () => {
      let map = new NestedMap();

      let key1 = makeKey("key1");
      let key2 = makeKey("key2");
      let key1_1 = makeKey("key1_1");
      let key1_2 = makeKey("key1_2");
      let key2_1 = makeKey("key2_1");
      let value1_1 = makeValue("value1_1");
      let value1_2 = makeValue("value1_2");
      let value2 = makeValue("value2");

      map.set([key1, key1_1], value1_1);
      map.set([key1, key1_2], value1_2);
      map.set([key2, key2_1], value2);

      let result = map.get([key1]);

      assert.equal([...result.keys()].length, 2);
      assert(result.get([key1_1]) === value1_1);
      assert(result.get([key1_2]) === value1_2);
    });
  });

  describe("set()", () => {
    it("prevents keys of different lengths", () => {
      let map = new NestedMap();
      let key1 = makeKey("key1");
      let key2 = makeKey("key2");
      let key2_1 = makeKey("key2_1");

      map.set([key1], "value");

      assert.throws(
        () => map.set([key2, key2_1], "value"),
        /The key length shouldn't change. Current key length is 1 but new one is 2/,
      );
    });
  });

  describe("keys() returns an iterator of every key", () => {
    it("when empty", () => {
      let map = new NestedMap();

      let result = map.keys();

      assert(result.next);
      console.error("result", result);
      assert.equal([...result].length, 0);
    });

    it("when using keys of length 1", () => {
      let map = new NestedMap();
      let key1 = makeKey("key1");
      let key2 = makeKey("key2");

      map.set([key1], makeValue("value1"));
      map.set([key2], makeValue("value2"));

      let result = [...map.keys()];

      assert.deepEqual(result, [[key1], [key2]]);
    });

    it("when using keys of length 2", () => {
      let map = new NestedMap();
      let key1 = makeKey("key1");
      let key21 = makeKey("key21");
      let key22 = makeKey("key22");

      map.set([key1, key21], makeValue("value21"));
      map.set([key1, key22], makeValue("value22"));

      let result = [...map.keys()];

      assert.deepEqual(result, [
        [key1, key21],
        [key1, key22],
      ]);
    });

    it("with only the prefix of each key when passed a length", () => {
      let map = new NestedMap();
      let key1 = makeKey("key1");
      let key2 = makeKey("key2");
      let key1_1 = makeKey("key1_1");
      let key2_1 = makeKey("key2_1");

      map.set([key1, key1_1], makeValue("value1_1"));
      map.set([key2, key2_1], makeValue("value2_1"));

      let result = [...map.keys({ length: 1 })];

      assert.deepEqual(result, [[key1], [key2]]);
    });
  });

  describe("values() returns an iterator of every value", () => {
    it("when empty", () => {
      let map = new NestedMap();

      let result = [...map.values()];

      assert.equal(result.length, 0);
    });

    it("when using keys of length 1", () => {
      let map = new NestedMap();
      let value1 = makeValue("value1");
      let value2 = makeValue("value2");

      map.set([makeKey("key1")], value1);
      map.set([makeKey("key2")], value2);

      let result = [...map.values()];

      assert.deepEqual(result, [value1, value2]);
    });

    it("when using keys of length 2", () => {
      let map = new NestedMap();
      let key1 = makeKey("key1");
      let key21 = makeKey("key21");
      let key22 = makeKey("key22");
      let value1_21 = makeValue("value1_21");
      let value1_22 = makeValue("value2_22");

      map.set([key1, key21], value1_21);
      map.set([key1, key22], value1_22);

      let result = [...map.values()];

      assert.deepEqual(result, [value1_21, value1_22]);
    });
  });

  describe("is iterable", () => {
    it("when empty", () => {
      let map = new NestedMap();

      let result = [...map];

      assert.equal(result.length, 0);
    });

    it("when using keys of length 1", () => {
      let map = new NestedMap();
      let key1 = makeKey("key1");
      let key2 = makeKey("key2");
      let value1 = makeValue("value1");
      let value2 = makeValue("value2");

      map.set([key1], value1);
      map.set([key2], value2);

      let result = [...map];

      assert.deepEqual(result, [
        [[key1], value1],
        [[key2], value2],
      ]);
    });

    it("when using keys of length 2", () => {
      let map = new NestedMap();
      let key1 = makeKey("key1");
      let key21 = makeKey("key21");
      let key22 = makeKey("key22");
      let value1_21 = makeValue("value1_21");
      let value1_22 = makeValue("value2_22");

      map.set([key1, key21], value1_21);
      map.set([key1, key22], value1_22);

      let result = [...map];

      assert.deepEqual(result, [
        [[key1, key21], value1_21],
        [[key1, key22], value1_22],
      ]);
    });
  });
});

function makeKey(name = "key") {
  return [name];
}

function makeValue(name = "value") {
  return [name];
}
