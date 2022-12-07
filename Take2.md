Take 2
=============

- Bucket
    Num
    Branch
    Value
    (metadata)
- Branch
    TODO
- Cache
    Fn + Args // Args includes things like branch, or previous computed?
    Version
    Key
    Value

db.execute(fn, 'foo')

fn = (db, branch) => db.branch(branch).group('category').reduce((m, a) => m + a.price)

|------------------------------------------------------------|
| fn      | source        | version    | key     | value       |
|---------|-------------|------------|---------|-------------|
| db =>   | branch='foo'       | 100        | null    | 100         |
|---------|-------------|------------|---------|-------------|
| fn      | args        | version    | key     | value       |
|---------|-------------|------------|---------|-------------|
| fn      | args        | version    | key     | value       |
|---------|-------------|------------|---------|-------------|