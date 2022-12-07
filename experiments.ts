class DB {
  mutations: Mutation[] = []
  insert(mutation: Mutation) {
    this.mutations.push(mutation);
  }

  query(): Queryable<Mutation> {
    return new Query<Mutation>(() => this.cursor());
  }

  cursor(): Cursor<Mutation> {
    let i = 0;
    let next = () => {
      if (i >= this.mutations.length) return null;

      const result = this.mutations[i];
      i++;

      return result;
    }
    return {
      next,
    }
  }
}

class Mutation<T = unknown> {
  constructor(public value: T) { }
}

interface Queryable<Data = unknown> {

}

class Query<Data = unknown> implements Queryable {
  constructor(
    private source: () => Cursor<Data>
  ) { }

  filter(matcher: Matcher<Data>) {
    return new FilteredQuery(this.source, matcher);
  }

  cursor() {
    return this.source();
  }
}

class FilteredQuery<Data> extends Query<Data> {
  constructor(
    source: () => Cursor<Data>,
    private matcher: Matcher<Data>
  ) { super(source); }

  // Private because it would be misleading to expose this function which
  // only matches against the current matchers and not others.
  private match(value: Data): boolean {
    const left = this.getLeft(value);
    const right = this.getRight(value);

    return this.compare(left, right);
  }
  private getLeft(value: Data): unknown {
    if (typeof this.matcher.left == 'function') return this.matcher.left(value);

    return this.matcher.left;
  }
  private getRight(value: Data): unknown {
    if (typeof this.matcher.right == 'function') return this.matcher.right(value);

    return this.matcher.right;
  }
  private compare(left: any, right: any): boolean {
    switch (this.matcher.op) {
      case "eq": return left == right;
      case "gt": return left > right;
      case "lt": return left < right;
    }
  }

  cursor(): Cursor<Data> {
    const sourceCursor = super.cursor();

    return {
      next: () => {
        let result = sourceCursor.next();

        while (result != null && !this.match(result)) {
          result = sourceCursor.next();
        }

        return result;
      }
    }
  }
}

type Comparer = "eq" | "gt" | "lt"
type Matcher<Data> = { left: Getter<Data>, op: Comparer, right: Getter<Data> }
type Getter<Data> =
  | ((data: Data) => boolean | string | number | null)
  | null
  | boolean
  | string
  | number


interface Cursor<T> {
  next(): T | null
}




interface Scalar<Data> {
  map<Result>(fn: (data: Data) => Result): Scalar<Result>
  exec<Result, Args extends any[]>(fn: (data: Data, ...args: Args) => Result, ...args: Args): Result
}
interface List<Entry> {
  map<Result>(fn: (item: Entry) => Result): List<Result>
  filter(fn: (item: Entry) => boolean | Scalar<boolean>): List<Entry>
  group<Key>(fn: (item: Entry) => Key | Scalar<Key>): List<Group<Key, Entry>>
  rollup<Result>(fn: (memo: Result | null, item: Entry) => Result): Result
  merge<Result>(fn: (left: Result | Entry, right: Result | Entry) => Result): Result

  union(other: List<Entry>): List<Entry>

  // sugar
  join() // this.group().union(other.group).merge()
}
interface Group<Key, Entry> {
  key(): Scalar<Key>
  entries(): List<Entry>
}

const foo: List<Scalar<string>> = null as any;
function scalar<T>(foo: T): Scalar<T> {
  throw new Error("Not implemented")
}
const x = foo.merge((left: Scalar<string>, right: Scalar<string>) => {
  return left.exec((a, b) => {
    return scalar(b.exec((a, b) => a + b, a))
  }, right)
})
