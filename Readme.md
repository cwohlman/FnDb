#FnDB

Research and Planning
- I plan to use Deno
- I'll use this for the db initially and then write connectors for other dbs: https://deno.land/x/sqlite@v3.7.0
- Example of building connectors: https://github.com/eveningkid/denodb/tree/master/lib/connectors

-- Notes --


Mutations:
* MutationNumber (auto-increment)
* MutationId
* BucketId
* RecordId
* CommitId
* Mutation

Metadata:
* MutationId
* Metadata

Commits:
* CommitNumber
* CommitId
* Message

CommitParents
* ChildId
* ParentId

Branches:
* BranchName
* CommitId (tip)

Buckets:
* BucketNumber
* BucketId
* BucketName
* SchemaId (FnId)

MutationIndex:
* MutationId
* FnId
* Arguments (hashed)
* Value

AggregateCache:
* BucketId
* RecordId
* CommitId
* FnId
* Arguments
* Version
* Value

QueryCache:
* FnId
* Arguments (hashed)
* CommitId
* Version (mutationId)
* Memo
* Value
(Also last used, total records aggregated)

Fns:
* FnNumber
* FnId
* Source


API:
.bucket(name, schema)
.insert(value, metadata)

.map(fn, args)
.with(name, fn, args)
.withMetadata()

.aggregate(fn, args)
.query(fn, args)

.filter(field, key)

.get()

.branch(name, source)
.merge(source, [target])

.snapshot()
.commit()
.redact()
.refuceDisk()




