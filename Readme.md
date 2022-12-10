## FnDB

Basic api:

- `db(connection, branch)`
- `db.bucket(name) => bucket => bucket<unknown>` - keep different kinds of data separate
- `bucket.schema(unknown => T) => bucket<T>` - ensure your data has the type you expect
- `bucket.withSchemas((unknown => T)[]) => view<T>` - ensure your data has the type you expect
- `(db | bucket | view).map((a, prev) => { key, b } | {key, b}[]) => view` - map over a set of objects to produce another set of objects, possibly referencing previous versions
- `(db | bucket | view).index(name, (a) => key) => view` - map over a set of objects to produce an index which can be used for filtering
- `(db | bucket | view).filter(key, Matcher) => view` - return only records where key matches the matcher
- `db.commit()` - bump the current commit version
- `db.merge(branch)` - merge branch into this branch

FnDB is a library of basic data types which can be backed by memory or a database for event sourcing or functional programming.

Basic idea:

create a function `reduce(set, fn, args)` the fn should convert any args which are collections into proxies for a collection.

Note: this needs to go along with a set of immutable collections because otherwise we can't be sure what is happening...
