# provider-locations

## params

```
{
  firstName,
  lastName,
  npi,
  specialties: {multiValue: true},
  nearAddress,
  nearMiles: {default: 10},
  sort: {valid: ['firstName', 'lastName']}
}
```

## sample queries

1. `/provider-locations?nearAddress=NY 10021&nearMiles=3`
1. `/provider-locations?nearAddress=333 E 69th ST, New York NY 10021&nearMiles=3`
1. `/provider-locations?lastName=SMITH`
1. `/provider-locations?lastName=/^SMI`
1. `/provider-locations?lastName=/^smi/i`
1. `/provider-locations?lastName=/^SMI&firstName=/^J`
1. `/provider-locations?npi=12345`
1. `/provider-locations?specialties=abc&specialties=123`
1. `/provider-locations?nearAddress=NY 10021&nearMiles=3&specialties=abc`
1. `/provider-locations?lastName=/^Z&sort=firstName`
1. `/provider-locations?lastName=/^Z&sort=-firstName`
1. `/provider-locations?lastName=/^Z&sort=lastName&sort=-firstName`

## response

```
[
  {
    "_id": "5783ed60dfd7e6b6bff98a01",
    "npi": 1417954223,
    "firstName": "PHILIP",
    "middleName": null,
    "lastName": "ZWEIFACH",
    "specialties": [
      "207W00000X"
    ],
    "orgName": "PHILIP ZWEIFACH M.D. PC",
    "address": {
      "line1": "131 E 69TH ST",
      "city": "NEW YORK",
      "state": "NY",
      "zip": 100215158
    },
    "phone": "2125351508",
    "geoPoint": {
      "type": "Point",
      "coordinates": [
        -73.963333,
        40.768472
      ]
    },
    "distance": 0.02181918591505859
  },
  {
    "_id": "5783ed63dfd7e6b6bf026460",
    "npi": 1790897338,
    "firstName": "STEPHEN",
    "middleName": "E",
    "lastName": "KELLY",
    "specialties": [
      "207W00000X"
    ],
    "orgName": "CATARACT AND CORNEAL ASSOCIATES, P.C.",
    "address": {
      "line1": "154 E 71ST ST",
      "city": "NEW YORK",
      "state": "NY",
      "zip": 100215125
    },
    "phone": "2126282202",
    "geoPoint": {
      "type": "Point",
      "coordinates": [
        -73.962281,
        40.76931
      ]
    },
    "distance": 0.08434893908038903
  }
]
```

## notes

- when `geoAddress` is specified, response will be sorted by `distance` and other `sort` params will be ignored
- when `geoAddress` is not specified, `distance` field will not be present in response
- `nearAddress` does not support regular-expressions
- for `nearAddress` currently zip codes must be specified with state (e.g. `NY 10021`)
- `nearMiles` will be ignored if `nearAddress` is not specified
- multiple values for `specialties` can be specified and will be treated as an "OR" operator

## implied rules
- support for `skip` and `limit` are implied
- all params are optional
- support for regular-expressions on string type fields is implied
- regular-expressions must start with `/` character (e.g. `firstName=/^PH`)
- regular-expressions can include these [options](https://docs.mongodb.com/manual/reference/operator/query/regex/#op._S_options) placed after a trailing `/` (e.g. `firstName=/^ph/i`)
- to sort ascending, place a `-` in front of the field name (e.g. `sort=-lastName`)
