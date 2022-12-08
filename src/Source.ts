import { CollectionKey } from "./Collection.ts";


export interface Source<TKey extends CollectionKey, TValue> {
  iter<T>(
    iter: (
      key: TKey,
      value: TValue,
      memo: T
    ) => void | null | undefined | "break",
    memo: T
  ): T;
}
