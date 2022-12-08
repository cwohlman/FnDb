export class Bucket<Data> implements
  Sink<Data, Entry<Data>>,
  Iterable<Entry<Data>>,
  Indexed<number, Entry<Data>>
{
  insert(value: Data): Entry<Data> | Error {
    throw new Error("Not implemented");
  }
  cursor(): Cursor<Entry<Data>> {
    throw new Error("Not implemented");
  }
  fetch(key: number): Entry<Data> {
    throw new Error("Not implemented");
  }
  keys(): Iterable<number> {
    throw new Error("Not implemented");
  }
}

export class Query<TSource, TResult, TArgs extends any[]> {
  constructor(
    public readonly source: Iterable<TSource>,
    public readonly iterator: (item: TSource, memo: TResult, ...args: TArgs) => TResult,
    public readonly memo: TResult,
    public readonly args: TArgs,
  ) { }
}

interface Sink<Input, Output> {
  insert(value: Input): Output | Error
}

interface Entry<T> {
  id: number,
  value: T,
}

interface Iterable<Data> {
  cursor(): Cursor<Data>
}

interface Indexed<TKey extends string | number | boolean, Data> {
  fetch(key: TKey): Data
  keys(): Iterable<TKey>
}

interface Cursor<T> {
  next(): T
}



export function reduce<Element, Args extends any[], Result>(
  source: Set<Element> | Db<Element>,
  fn: (item: Element, ...args: Args) => Result,
  ...args: Args
):

  // TODO: convert this to the type "DeferedSet" or some such
  Result | null {
  let result: Result | null = null;
  if (source instanceof Set) {
    for (const element of source) {
      result = fn(element, ...args);
    }
  } else {
    // TODO: map over args and convert any Set or Map into a cached table etc.
    const cursor = source.getCursor();
    while (cursor.hasMore()) {
      result = fn(cursor.next(), ...args);
    }
  }
  return result;
}

export class Db<Element> {
  private documents: Element[] = []
  insert(document: Element) {
    this.documents.push(document);
  }
  getCursor() {
    let i = 0;
    return {
      next(): Element {
        const result = this.documents[i];
        i++;
        return result;
      },
      hasMore(): boolean {
        return i < this.documents.length;
      }
    }
  }
}