/**
 * Represent a map whose keys are arrays. The builtin Map class can
 * only be used with arrays as keys if the exact same array is used to
 * save and retrieve a value. This implementation doesn't have this
 * limitation: two equal arrays will work to save and retrieve the
 * same value.
 *
 * All keys used to save and retrieve values must have the same
 * length.
 *
 * @param {object[][]} [pairs] - All the elements that should be
 * initialized with the Maps. Each is an array containing a key and a
 * value - all keys being arrays of the same length
 */
export default class NestedMap {
  constructor({ pairs = [] } = {}) {
    // Maps the first element of a key to a NestedMap or to any
    // value if the key is of length 1:
    this._map = new Map();

    this._keyLength = undefined;

    pairs.forEach(([keys, value]) => this.set(keys, value));
  }

  get([firstKey, ...otherKeys]) {
    let firstMap = this._map.get(firstKey);

    if (!otherKeys.length) return firstMap;

    return firstMap && firstMap.get(otherKeys);
  }

  set(...rest) {
    let [[firstKey, ...otherKeys], value] = rest;

    if (!this._keyLength) {
      this._keyLength = rest[0].length;
    } else if (this._keyLength !== rest[0].length) {
      throw new Error(
        `The key length shouldn't change. Current key length is ${this._keyLength} but new one is ${rest[0].length}`,
      );
    }

    if (!otherKeys.length) {
      this._map.set(firstKey, value);
      return;
    }

    let firstMap = this._map.get(firstKey);

    if (!firstMap) {
      firstMap = new this.constructor();
      this._map.set(firstKey, firstMap);
    }

    firstMap.set(otherKeys, value);
  }

  *keys({ length = Infinity } = {}) {
    if (this._keyLength <= 1) {
      for (let key of this._map.keys()) {
        yield [key];
      }
      return;
    }

    for (let [firstKey, nestedMap] of this._map) {
      if (length === 1) {
        yield [firstKey];
        continue;
      }

      for (let otherKeys of nestedMap.keys({ length: length - 1 })) {
        yield [firstKey, ...otherKeys];
      }
    }
  }

  *values() {
    if (this._keyLength <= 1) {
      yield* this._map.values();
      return;
    }

    for (let nestedMap of this._map.values()) {
      yield* nestedMap.values();
    }
  }

  *[Symbol.iterator]() {
    for (let key of this.keys()) {
      yield [key, this.get(key)];
    }
  }
}
