import {getDb} from '../db'
import debug from 'debug'
import Timer from '../timer'

const dbg = debug('app:provider:data')

export async function lookup(query={}, opts={}) {
  dbg('lookup: query=%o, opts=%o', query, opts)

  const db = await getDb()

  const timer = new Timer('provider-lookup')

  const result = await db.collection('cmsProviderLocations')
  .aggregate(
    [
      {
        $lookup: {
          from: 'cmsProviders',
          localField: 'providerId',
          foreignField: '_id',
          as: 'provider'
        }
      },
      {
        $lookup: {
          from: 'cmsLocations',
          localField: 'locationId',
          foreignField: '_id',
          as: 'location'
        }
      },
      {$match: {'provider.lastName': 'LOPEZ'}},
      {$unwind: '$provider'},
      {$unwind: '$location'},
      {
        $project: {
          npi: '$provider.npi',
          firstName: '$provider.firstName',
          middleName: '$provider.middleName',
          lastName: '$provider.lastName',
          specialties: '$provider.specialties',
          orgName: '$location.orgName',
          address: '$location.address',
          phone: '$location.phone'
        }
      }
    ]
  )
  .skip(opts.skip || 0)
  .limit(opts.limit || 10)
  .toArray()

  timer.stop()
  dbg('timer=%o', timer.toString())
  return result
}

export async function index(query={}, opts={}) {
  dbg('index2: query=%o, opts=%o', query, opts)

  const db = await getDb()

  const timer = new Timer('provider-index')

  const result = await db.collection('cmsDenormedProviderLocations')
  .find(query)
  .skip(opts.skip || 0)
  .limit(opts.limit || 10)
  .toArray()

  timer.stop()
  dbg('timer=%o', timer.toString())
  return result
}
