FnDB
========


Goals
--------

A database that is as flexible as a set of arrays and hashes, but immutable.

Philosophy
--------

Imutable insertion, ephemeral views.

Primatives
--------

Immutable:
- OrderedList

Ephemeral:
- Fn (A function or function arguments pair)
- map(List<A>, Fn<A => B>, OrderedList) => List<B>
- group(List<A>, Fn<A => Key>) => Hash<Key, List<A>>
- aggregate(List<A>, B, Fn<(A, B) => B>) => B
- 

Realization: I need to write a programing language - maybe I should look into datalog 


Research and Planning
========
- I plan to use Deno
- I'll use this for the db initially and then write connectors for other dbs: https://deno.land/x/sqlite@v3.7.0
- Example of building connectors: https://github.com/eveningkid/denodb/tree/master/lib/connectors

Working through problems:
==========

Problem #1: Should buckets be applied pre or post insertion?

Pre: ensures we don't save invalid records & they are invalidated
Post: ensures that objects in the same (named) bucket can be retreived across multiple aggregation pipelines.

Answer: both - make the schema optional, when not included queries return all objects and inserts accept all objects - the generated bucketId will be for a schema of a => a

Notes
============


Mutations:
* MutationNumber (auto-increment)
* MutationId
* BucketId
* RecordId
* CommitId
* Mutation
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




