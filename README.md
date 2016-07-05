# express-mongo-provider-api

this is an [express-js](http://expressjs.com/) app intended to serve up data ingested via [this process](https://github.com/tony-kerz/mongo-provider-ingest).

## tech notes

this app is atypical in that it is using normalized collections and the [$lookup](https://docs.mongodb.com/manual/reference/operator/aggregation/lookup/) feature of mongo to "join" the data dynamically at runtime.
