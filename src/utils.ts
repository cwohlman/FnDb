import {
  Boxed,
  CollectionKey,
  Gettable,
  Iterable,
  LocalIterable,
  RemoteGettable,
  Scalar,
} from "./Interfaces.ts";

export async function load<Key extends CollectionKey, Value>(
  collection: Iterable<Key, Value>
): Promise<LocalIterable<Key, Value>> {
  if ("$remote" in collection) {
    return await collection.load();
  } else {
    return collection;
  }
}

export async function unwrap<Value>(
  box: Gettable<Value> | RemoteGettable<Value>
): Promise<Value> {
  if ("fetch" in box) {
    return await box.fetch();
  }
  return box.get();
}

export function box<Value>(value: Value): Boxed<Value> {
  if ("$boxed" in value) return value as Boxed<Value>;

  return {
    get() {
      return value;
    },
  } as Boxed<Value>;
}

export function keyMatch<Key extends Scalar[]>(left: Key, right: Key) {
  if (left.length != right.length) return false;

  return left.every((entry, i) => entry == right[i]);
}
