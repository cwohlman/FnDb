import {
  LocalIterable,
  CollectionKey,
  Boxed,
  DeepMap,
  IterationControl,
  Scalar,
} from "./Interfaces.ts";
import { box, keyMatch } from "./utils.ts";

export default class LocalCollection<Key extends CollectionKey, Value>
  implements LocalIterable<Key, Value>
{
  constructor(
    protected underlying: [key: Key, value: Value][],
    public readonly keySize: Key["length"]
  ) {}
  $boxed: true = true;

  iter<T>(
    iter: (key: Key, value: Value, memo: T) => IterationControl,
    memo: T
  ): Boxed<T> {
    this.underlying.forEach(([key, value]) => {
      iter(key, value, memo);
    });
    return box(memo);
  }
  slice(fromKey: Key, toKey: Key): LocalIterable<Key, Value> {
    return new LocalCollection(
      this.underlying.slice(
        this.underlying.findIndex(([key]) => keyMatch(key, fromKey)),
        this.underlying.findIndex(([key]) => keyMatch(key, toKey))
      ),
      this.keySize
    );
  }
  get(...key: Key): Value | undefined {
    const pair = this.underlying.find(([entryKey]) => keyMatch(key, entryKey));

    return pair && pair[1];
  }
  values(): Value[] {
    return this.underlying.map(([_key, value]) => value);
  }
  keys(): Key[] {
    return this.underlying.map(([key]) => key);
  }
  pairs(): [Key, Value][] {
    return this.underlying.map((pair) => pair);
  }
  count(...key: Scalar[]): number {
    if (key.length == 0) return this.underlying.length;
    return this.underlying.filter(([entryKey]) =>
      keyMatch(entryKey.slice(0, key.length), key)
    ).length;
  }
  map(): DeepMap<Key, Value> {
    // return new Map(this.underlying);
    throw new Error("Not Implemented");
  }
  // obj(): DeepObj<Key, Value> {

  // }

  static from<Key extends CollectionKey, Value>(
    input: LocalIterable<Key, Value>
  ) {
    return new LocalCollection(input.pairs(), input.keySize);
  }
}
