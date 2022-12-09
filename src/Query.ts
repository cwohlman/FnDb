import { Iterable, CollectionKey } from "./Interfaces.ts";
import LocalBucket from "./LocalBucket.ts";

export function map<Key extends CollectionKey, Input, Output>(
  source: Iterable<Key, Input>,
  fn: (input: Input, key: Key) => Output
): Iterable<Key, Output> {
  return source.iter((key, value, memo) => {
    memo.put(key, fn(value, key));
  }, new LocalBucket([], source.keySize));
}
