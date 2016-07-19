# express-mongo-provider-api

this is an [express-js](http://expressjs.com/) app intended to serve up data ingested via [this data flow](https://github.com/tony-kerz/mongo-provider-ingest).

## api

this application supports the following api specifications

- [/practitioner-locations](doc/practitioner-locations/index.md)

## data detail

currently this app is going after this [materialized-view](https://github.com/tony-kerz/mongo-provider-ingest#provider-locations-1) which represents a many-to-many relationship between individual providers and locations.

> there should be indexes on the following fields:
- `name.first`
- `name.last`
- `identifiers.extension`
- `specialties.code`
- `geoPoint`

## tech notes

an initial exercise was performed comparing the following two access paths:

1. normalized collections and the [$lookup](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/) feature of mongo to "join" the data dynamically at runtime

1. denormalized collection generated against normalized collections via aggregation pipeline using $lookup and [$out](https://docs.mongodb.com/manual/reference/operator/aggregation/out/)

> - anecdotal observations with mongo 3.2.7 and a 1.5m record dataset are that denormalized collections are __way__ more performant (e.g. ~10ms v ~1500ms)
> - query on joined collection involved a many-to-many (two calls to $lookup) and single field match on one of the joined collections
> - mongo 3.3.6 introduces [performance improvement](https://jira.mongodb.org/browse/SERVER-21612), but that still only reduced the call to ~800ms
