import { Collection, CollectionKey } from "./Collection.ts";
import { Underlying } from "./Underlying.ts";

/**
 * Implements a mutable keyed collection
 */
export class Bucket<TKey extends CollectionKey, TValue> extends Collection<
  TKey,
  TValue
> {
  put(key: TKey, value: TValue) {
    this.ensureLength(key);

    const prefix = key.slice(0, -1);
    const last = key.slice(-1)[0];

    let underlying: Map<any, any> = this.underlying;

    for (const part of prefix) {
      if (!underlying.has(part)) underlying.set(part, new Map());
      underlying = underlying.get(part);
    }

    underlying.set(last, value);
  }

  toCollection() {
    return new Collection<TKey, TValue>(
      this.underlying as Underlying<TKey, TValue>,
      this.keyLength
    );
  }
}
