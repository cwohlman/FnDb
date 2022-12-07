FnDB
-------------


FnDB is a library of basic data types which can be backed by memory or a database for event sourcing or functional programming.

Basic idea:

create a function `reduce(set, fn, args)` the fn should convert any args which are collections into proxies for a collection.

Note: this needs to go along with a set of immutable collections because otherwise we can't be sure what is happening...