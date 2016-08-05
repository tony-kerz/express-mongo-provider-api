# practitioner-locations

## params

```
{
  client.id,
  networks.id,
  networks.tier.rank,
  name.first: {regex: true},
  name.last: {regex: true},
  identifiers.extension: {regex: true},
  specialties: {multiValue: true},
  nearAddress,
  nearLat: {type: float},
  nearLong: {type: float},
  nearMiles: {default: 10},
  includeOutOfNetwork,
  includeCount,
  sort: {valid: ['name.first', 'name.last']}
}
```

## response

```
[
  {
    id: '5783ed60dfd7e6b6bff98a01',
    client: {
      id: '1',
      text: 'Banner'
    },
    networks: [
      {
        id: '1',
        text: 'network-1',
        tier: {
          id: '1',
          text: 'a-team',
          rank: 3
        }
      }
    ],
    name: {
      first: 'PHILIP',
      middle: null,
      last: 'ZWEIFACH',
      prefix: null,
      suffix: null
    },
    identifiers: [
      {
        authority: 'CMS',
        oid: '2.16.840.1.113883.4.6',
        extension: '1417954223'
      }
    ],
    specialties: [
      {
        code: '207W00000X',
        text: 'Ophthalmology',
        system: '2.16.840.1.113883.6.101'
      }
    ]
    orgName: 'PHILIP ZWEIFACH M.D. PC',
    address: {
      line1: '131 E 69TH ST',
      city: 'NEW YORK',
      state: 'NY',
      zip: '100215158'
    },
    phone: '2125351508',
    geoPoint: {
      type: 'Point',
      coordinates: [-73.963333, 40.768472]
    },
    distance: 0.02181918591505859
  }
]
```
## sample queries

1. `/practitioner-locations?nearAddress=NY 10021&nearMiles=3`
1. `/practitioner-locations?nearAddress=333 E 69th ST, New York NY 10021&nearMiles=3`
1. `/practitioner-locations?name.last=SMITH`
1. `/practitioner-locations?name.last=/^SMI`
1. `/practitioner-locations?name.last=/^smi/i`
1. `/practitioner-locations?name.last=/^SMI&name.first=/^J`
1. `/practitioner-locations?identifiers.extension=12345`
1. `/practitioner-locations?specialties.code=abc&specialties.code=123`
1. `/practitioner-locations?nearAddress=NY 10021&nearMiles=3&specialties.code=abc`
1. `/practitioner-locations?nearLon=-73.963654&nearLat=40.768673&nearMiles=3&specialties.code=abc`
1. `/practitioner-locations?name.last=/^Z&sort=name.first`
1. `/practitioner-locations?name.last=/^Z&sort=-name.first`
1. `/practitioner-locations?name.last=/^Z&sort=name.last&sort=-name.first`
1. `/practitioner-locations?client.id=1&networks.id=1&specialties.code=123`
1. `/practitioner-locations?client.id=1&networks.id=1&specialties.code=123&includeOutOfNetwork`
1. `/practitioner-locations?client.id=1&networks.id=1&specialties.code=123&includeCount`
1. `/practitioner-locations?client.id=1&networks.id=1&networks.tier.rank=2&specialties.code=123&includeCount`

## notes

- geo-searches can be specified using either `nearAddress` string or both of `nearLat` and `nearLon` floats
- `nearLat` and `nearLon` will "trump" `nearAddress` if all are present
- for geo-searches, response will be sorted by `distance` and other `sort` params will be ignored
- the `distance` field will only be present in the response for geo-searches
- `nearAddress` does not support regular-expressions
- for `nearAddress` currently zip codes must be specified with state (e.g. `NY 10021`)
- `nearMiles` will be only be considered for geo-searches
- multiple values for `specialties.code` can be specified and will be treated as an "OR" operator
- if `client.id` is not specified, service will only return records with an unspecified `clientId`
- use the `includeOutOfNetwork` flag (in combination with `client.id`) to include "out-of-network" providers in the response
- use the `includeCount` flag to include the `x-total-count` header on response
- `networks.tier.rank` will indicate the "minimum tier" to be included in the result (i.e. if a network has three tiers, `good`, `better`, and `best`, in ascending order of desirability, and the rank of `better` is specified as a filter, then the result will include practitioners in the `better` __and__ `best` tiers)

> - `nearAddress` will incur a performance hit to geocode on the back-end, using the `nearLat`/`nearLon` parameter pair will avoid this

<!-- -->

> - `includeCount` will incur a performance hit, please avoid if not required for paging
