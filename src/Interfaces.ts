export type Scalar =
  | boolean
  | number
  | BigInt
  | string
  | Scalar[]
  | { [key: string]: Scalar };
export type CollectionKey = [Scalar, ...Scalar[]];
export type PartialKey<TKey extends Scalar[]> = TKey extends [
  infer Head,
  ...infer Tail extends Scalar[]
]
  ? [] | [Head] | [Head, ...PartialKey<Tail>]
  : [];
export type DeepMap<TKey extends Scalar[], TValue> = TKey extends []
  ? TValue
  : TKey extends [infer Key, ...infer Rest extends Scalar[]]
  ? Map<Key, DeepMap<Rest, TValue>>
  : never;
export type IterationControl = void | null | undefined | "break";

export type Iterable<Key extends CollectionKey, Value> =
  | LocalIterable<Key, Value>
  | RemoteIterable<Key, Value>;
export interface LocalIterable<TKey extends CollectionKey, TValue> {
  iter<T>(
    iter: (key: TKey, value: TValue, memo: T) => IterationControl,
    memo: T
  ): T;

  slice(fromKey: TKey, toKey: TKey): LocalIterable<TKey, TValue>;

  get(key: TKey): TValue | undefined;

  values(): TValue[];
  keys(): TKey[];
  pairs(): [TKey, TValue][];

  toMap(): DeepMap<TKey, TValue>;
  // TODO: toObject():
}
export interface RemoteIterable<TKey extends CollectionKey, TValue> {
  iter<T>(
    iter: (
      key: TKey,
      value: TValue,
      memo: T
    ) => IterationControl | Promise<IterationControl>,
    memo: T
  ): Remote<T>;

  slice(fromKey: TKey, toKey: TKey): RemoteIterable<TKey, TValue>;

  load(): Promise<LocalIterable<TKey, TValue>>;
}

export type Appendable<T> = LocalAppendable<T> | RemoteAppendable<T>;
export interface LocalAppendable<T> {
  append(value: T): number;
}
export interface RemoteAppendable<T> {
  append(value: T): Promise<number>;

  save(): Promise<void>;
}

export type Mutable<Key extends CollectionKey, Value> =
  | LocalMutable<Key, Value>
  | RemoteMutable<Key, Value>;
export interface LocalMutable<TKey extends CollectionKey, TValue> {
  mutate(key: TKey, value: TValue): true;
}
export interface RemoteMutable<TKey extends CollectionKey, TValue> {
  mutate(key: TKey, value: TValue): Promise<boolean>;

  save(): Promise<void>;
}

export type Redactable<Key extends CollectionKey> =
  | LocalRedactable<Key>
  | RemoteRedactable<Key>;
export interface LocalRedactable<TKey extends CollectionKey> {
  redact(key: PartialKey<TKey>): true;
}
export interface RemoteRedactable<TKey extends CollectionKey> {
  redact(key: PartialKey<TKey>): Promise<boolean>;

  save(): Promise<void>;
}

export type Gettable<Value> = LocalGettable<Value> | RemoteGettable<Value>;
export type LocalGettable<Value> = { get(): Value };
export type RemoteGettable<Value> = { get(): Promise<Value> };

export type Putable<Value> = LocalPutable<Value> | RemotePutable<Value>;
export type LocalPutable<Value> = { put(value: Value): void };
export type RemotePutable<Value> = { put(value: Value): Promise<void> };

// Wow! What a complicated type!
// export type Remote<T> = T extends Iterable<infer Key, infer Value>
//   ? RemoteIterable<Key, Value> &
//       (T extends Mutable<Key, Value> ? RemoteMutable<Key, Value> : unknown) &
//       (T extends Appendable<Value> ? RemoteAppendable<Value> : unknown) &
//       (T extends Redactable<Key> ? RemoteRedactable<Key> : unknown)
//   : T extends Mutable<infer Key, infer Value>
//   ? RemoteMutable<Key, Value> &
//       (T extends Appendable<Value> ? RemoteAppendable<Value> : unknown) &
//       (T extends Redactable<Key> ? RemoteRedactable<Key> : unknown)
//   : T extends Appendable<infer Value>
//   ? RemoteAppendable<Value> &
//       (T extends Redactable<infer Key> ? RemoteRedactable<Key> : unknown)
//   : T extends Redactable<infer Key>
//   ? RemoteRedactable<Key>
//   : T extends Box<infer Value>
//   ? RemoteBox<Value>
//   : RemoteBox<T>;

export type Remote<T> = T extends Iterable<infer Key, infer Value>
  ? RemoteIterable<Key, Value>
  : T extends Gettable<infer Value>
  ? RemoteGettable<Value>
  : RemoteGettable<T>;
