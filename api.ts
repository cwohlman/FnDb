export interface Database extends MutationCursor<unknown, {}>, Bucket {
  bucket<T = unknown>(name: string, schema?: Schema<T>): Bucket & MutationCursor<T, {}>
}

export type MutationWithIndex<T, Index> = Mutation<T> & Index;
export type FilteredValues<Thing, Key extends keyof Thing, Value> = Thing & { [key in Key]: Value }

export interface Cursor<Value> {
  count(): Promise<number>
  next(): Promise<Value>
}

export interface MutationCursor<Data, Index> extends Cursor<Mutation<Data> & Index> {
  afterVersion(
    version: number
  ): MutationCursor<Data, Index>
  uptoVersion(
    version: number
  ): MutationCursor<Data, Index>

  filter<TKey extends keyof MutationWithIndex<Data, Index>, TValue>(
    key: TKey,
    value: TValue
  ): FilteredValues<MutationWithIndex<Data, Index>, TKey, TValue>

  // TODO: other comparison operators

  map<TArgs extends any[], TValue>(
    fn: MapFn<MutationWithIndex<Data, Index>, TArgs, TValue>,
    args: TArgs,
  ): MutationCursor<TValue, Index>

  with<TArgs extends any[], TKey extends string, TValue>(
    key: TKey,
    fn: MapFn<MutationWithIndex<Data, Index>, TArgs, TValue>,
    args: TArgs,
  ): MutationCursor<Data, Index & { [key in TKey]: TValue }>

  drop<TKey extends keyof Index>(key: TKey): MutationCursor<Data, Omit<Index, TKey>>

  records<TArgs extends any[], TRecord>(
    fn: ReduceFn<MutationWithIndex<Data, Index>, TArgs, TRecord>,
    args: TArgs
  ): RecordCursor<TRecord>

  reduce<TArgs extends any[], TRecord>(
    fn: ReduceFn<MutationWithIndex<Data, Index>, TArgs, TRecord>,
    args: TArgs
  ): Cursor<TRecord>

  pick<TKey extends keyof MutationWithIndex<Data, Index>>(keys: TKey[]): Cursor<Pick<MutationWithIndex<Data, Index>, TKey>>
  values(): Cursor<Data>
  metadata(): Cursor<Index>

  // sugar
  mergeIndex(): MutationCursor<Data & Index, Index>
  query<TArgs extends any[], TValue>(
    fn: MapFn<MutationWithIndex<Data, Index>, TArgs, TValue>,
    value: TValue,
    args: TArgs,
  ): MutationCursor<Data, Index>
  filterValue<TKey extends keyof Data, TValue extends Data[TKey]>(
    key: TKey,
    value: TValue,
  ): MutationCursor<FilteredValues<Data, TKey, TValue>, Index>
}

export interface RecordCursor<T> {

}

export interface Bucket {
  insert(value: unknown): InsertResult
}

export type InsertResult = {
  success: true,
  mutationNumber: number
  mutationId: string
} | { success: false, error: Error }

export interface Mutation<T> {
  mutationNumber: number
  mutationId: string
  bucketId: string
  recordId: string
  commitId: string
  value: T
  metadata: { [key: string]: unknown }
}

export interface Record<T> {
  recordId: string
  value: T
}

export type Schema<T> = (input: unknown) => T // or error
export type ReduceFn<TValue, TArgs, TMemo> = (memo: TMemo | null, value: TValue, args: TArgs) => TMemo // or error
export type MapFn<TValue, TArgs, TResult> = (value: TValue, args: TArgs) => TResult // or error