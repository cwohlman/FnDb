export type Underlying<
  TKey extends (string | number)[],
  TValue
> = TKey extends []
  ? TValue
  : TKey extends [infer Key, ...infer Rest extends (string | number)[]]
  ? Map<Key, Underlying<Rest, TValue>>
  : never;
