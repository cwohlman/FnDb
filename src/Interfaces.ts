// deno-lint-ignore-file no-explicit-any

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
  readonly $boxed: true;
  readonly keySize: TKey["length"];

  iter<T>(
    iter: (key: TKey, value: TValue, memo: T) => IterationControl,
    memo: T
  ): Boxed<T>;

  slice(fromKey: TKey, toKey: TKey): LocalIterable<TKey, TValue>;

  get(...key: TKey): TValue | undefined;

  values(): TValue[];
  keys(): TKey[];
  pairs(): [TKey, TValue][];

  map(): DeepMap<TKey, TValue>;
  // TODO: toObject():
}
export interface RemoteIterable<TKey extends CollectionKey, TValue> {
  readonly $boxed: true;
  readonly $remote: true;
  readonly keySize: TKey["length"];

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
  readonly $boxed: true;

  append(value: T): number;
}
export interface RemoteAppendable<T> {
  readonly $boxed: true;
  readonly $remote: true;

  append(value: T): Promise<number>;

  save(): Promise<void>;
}

export type Mutable<Key extends CollectionKey, Value> =
  | LocalMutable<Key, Value>
  | RemoteMutable<Key, Value>;
export interface LocalMutable<TKey extends CollectionKey, TValue> {
  readonly $boxed: true;
  readonly keySize: number;

  mutate(key: TKey, value: TValue): true;
}
export interface RemoteMutable<TKey extends CollectionKey, TValue> {
  readonly $boxed: true;
  readonly $remote: true;
  readonly keySize: number;

  mutate(key: TKey, value: TValue): Promise<boolean>;

  save(): Promise<void>;
}

export type Redactable<Key extends CollectionKey> =
  | LocalRedactable<Key>
  | RemoteRedactable<Key>;
export interface LocalRedactable<TKey extends CollectionKey> {
  readonly $boxed: true;

  redact(key: PartialKey<TKey>): number;
}
export interface RemoteRedactable<TKey extends CollectionKey> {
  readonly $boxed: true;
  readonly $remote: true;

  redact(key: PartialKey<TKey>): Promise<number>;

  save(): Promise<void>;
}

export type Gettable<Value> = LocalGettable<Value> | RemoteGettable<Value>;
export type LocalGettable<Value> = { $boxed: true; get(): Value };
export type RemoteGettable<Value> = { $boxed: true; fetch(): Promise<Value> };

export type Putable<Value> = LocalPutable<Value> | RemotePutable<Value>;
export type LocalPutable<Value> = { $boxed: true; put(value: Value): void };
export type RemotePutable<Value> = {
  $boxed: true;
  put(value: Value): Promise<void>;
};

export type Remote<T> = T extends Iterable<infer Key, infer Value>
  ? RemoteIterable<Key, Value>
  : T extends Gettable<infer Value>
  ? RemoteGettable<Value>
  : RemoteGettable<T>;

export type Local<T> = T extends Iterable<infer Key, infer Value>
  ? LocalIterable<Key, Value>
  : T extends Gettable<infer Value>
  ? LocalGettable<Value>
  : LocalGettable<T>;

export type Boxed<T> = T extends
  | Iterable<any, any>
  | Mutable<any, any>
  | Appendable<any>
  | Redactable<any>
  | Gettable<any>
  | Putable<any>
  ? T
  : Gettable<T>;

export type Bucket<TKey extends CollectionKey, TValue> = Iterable<
  TKey,
  TValue
> &
  Mutable<TKey, TValue> &
  Redactable<TKey>;
export type Stream<TValue> = Iterable<[number], TValue> &
  Appendable<TValue> &
  Redactable<[number]>;
