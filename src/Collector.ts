import { Collection } from "./Collection.ts";

/**
 * Implements a mutable append only collection
 */
export class Collector<
  TKey extends (string | number)[],
  TValue
> extends Collection<TKey, TValue> {
  collect(key: TKey, value: TValue) {
    this.ensureLength(key);

    if (key.length == 0) {
      this.value = value;
    } else {
      const prefix = key.slice(0, -1);
      const last = key.slice(-1)[0];

      let underlying = this.underlying;

      for (const part of prefix) {
        if (!underlying.has(part)) underlying.set(part, new Map());
        underlying = underlying.get(part);
      }

      if (underlying.has(last)) {
        throw new Error("Collection is append only!");
      }

      underlying.set(last, value);
    }
  }

  toCollection() {
    if (!this.keyLength)
      return new Collection<TKey, TValue>(this.value as any, 0);
    return new Collection<TKey, TValue>(this.underlying as any, this.keyLength);
  }
}
