export type ControlMessage = void | "break";

export interface Database {
  bucket<T>(name: string, schema: (a: unknown) => T): Bucket<number, T>;

  // TODO: support for over several
  over<Key, Value, OutKey, OutValue>(
    source: Walkable<Key, Value>,
    fn: CollectFn<Key, Value, OutKey, OutValue>
  ): Walkable<Key, Value>;
}

export interface Bucket<VersionKey, Value> {
  push: (value: Value) => Promise<void>;
  /**
   * Gets the item in the in the bucket at the specified version, or
   * the latest version if no version is specified
   */
  get: (version?: VersionKey) => Promise<Value | undefined>;
  /**
   * Returns the most recent key which matches the specified prefix,
   * optionally filtered by versions after the specified version
   */
  versions(since?: VersionKey): Promise<VersionKey[]>;
}
export interface Collector<VersionKey, BucketKey, Value> {
  push: (bucketKey: BucketKey, value: Value) => void;
  /**
   * Gets the item in the in the bucket at the specified version, or
   * the latest version if no version is specified
   */
  get: (bucketKey: BucketKey, version?: VersionKey) => Value[];
  /**
   * Returns the most recent key which matches the specified prefix,
   * optionally filtered by versions after the specified version
   */
  versions(bucketKey: BucketKey, since?: VersionKey): VersionKey[];

  buckets(): BucketKey[];
}
export type CollectFn<Key, Value, OutKey, OutValue> = (
  key: Key,
  value: Value,
  collector: Collector<OutKey, Key, OutValue>
) => ControlMessage | Promise<ControlMessage>;

export type Walkable<Key, Value> =
  | LocalWalkable<Key, Value>
  | RemoteWalkable<Key, Value>;

export interface LocalWalkable<Key, Value> {
  walk(fn: (key: Key, value: Value) => ControlMessage): void;
}
export interface RemoteWalkable<Key, Value> {
  walk(
    fn: (key: Key, value: Value) => ControlMessage | Promise<ControlMessage>
  ): Promise<void>;
}
