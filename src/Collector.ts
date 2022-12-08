import { Collection } from "./Collection.ts";

/**
 * Implements a mutable append-only collection
 */
export class Collector<
  TValue
> extends Collection<[number], TValue> {
  collect(value: TValue) {
    this.underlying.set(this.underlying.keys.length, value);
  }

  toCollection() {
    if (!this.keyLength)
    return new Collection<[number], TValue>(this.underlying, this.keyLength);
  }
}
