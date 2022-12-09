import {
  Iterable,
  CollectionKey,
  PartialKey,
  Boxed,
  RemoteGettable,
  Gettable,
} from "./Interfaces.ts";
import LocalBucket from "./LocalBucket.ts";
import LocalStream from "./LocalStream.ts";
import { mutableBox } from "./utils.ts";

export function map<Key extends CollectionKey, Input, Output>(
  source: Iterable<Key, Input>,
  fn: (input: Input, key: Key) => Output
): Iterable<Key, Output> {
  return source.iter((key, value, memo) => {
    memo.put(key, fn(value, key));
  }, new LocalBucket([], source.keySize));
}

export function filter<Key extends CollectionKey, Input>(
  source: Iterable<Key, Input>,
  fn: (input: Input, key: Key) => boolean
): Iterable<Key, Input> {
  return source.iter((key, value, memo) => {
    if (fn(value, key)) memo.put(key, value);
  }, new LocalBucket([], source.keySize));
}

export function take<Key extends CollectionKey, Input>(
  source: Iterable<Key, Input>,
  count: number,
  skip = 0
): Iterable<Key, Input> {
  return source
    .iter((key, value, memo) => {
      if (memo.count() >= skip + count) return "break";
      if (memo.count() >= skip) memo.append([key, value]);
      else memo.append(undefined);
    }, new LocalStream<[Key, Input] | undefined>([]))
    .iter((_key, _value, memo) => {
      if (_value === undefined) return;

      const [key, value] = _value;
      memo.put(key, value);
    }, new LocalBucket<Key, Input>([], source.keySize));
}

export function reduce<Key extends CollectionKey, Input, Output>(
  source: Iterable<Key, Input>,
  fn: (input: Input, memo: Output, inputKey: Key) => Output,
  memo: Output
): Gettable<Output> {
  return source.iter((key, value, memo) => {
    memo.put(fn(value, memo.get(), key));
  }, mutableBox(memo));
}

export function reduceGroup<
  Key extends CollectionKey,
  Input,
  OutputKey extends PartialKey<Key> & CollectionKey,
  Output
>(
  source: Iterable<Key, Input>,
  fn: (
    input: Input,
    memo: Output,
    outputKey: OutputKey,
    inputKey: Key
  ) => Output,
  memo: Output,
  keyLength: OutputKey["length"]
): Iterable<OutputKey, Output> {
  return source.iter((key, value, bucket) => {
    const partialKey = key.slice(0, keyLength) as OutputKey;

    let previousValue = bucket.get(...(partialKey as OutputKey));
    if (previousValue === undefined) previousValue = memo;

    bucket.put(partialKey, fn(value, previousValue, partialKey, key));
  }, new LocalBucket<OutputKey, Output>([], keyLength));
}
