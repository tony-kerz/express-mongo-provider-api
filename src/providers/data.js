import {getDb} from '../db'
import debug from 'debug'

const dbg = debug('app:provider:data')

export async function index(opts={}) {
  dbg('index: opts=%o', opts)

  const db = await getDb()
  // return await db.collection('cmsProviderLocations')
  //   .find()
  //   .skip(opts.skip || 0)
  //   .limit(opts.limit || 10)
  //   .toArray()

  return await db.collection('cmsProviderLocations')
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
      {$unwind: '$provider'},
      {$unwind: '$location'},
      {
        $project: {
          npi: 1,
          address: 1,
          firstName: '$provider.firstName',
          lastName: '$provider.lastName',
          specialties: '$provider.specialties',
          orgName: '$location.orgName',
          phone: '$location.phone'
        }
      }
    ]
  )
  .skip(opts.skip || 0)
  .limit(opts.limit || 10)
  .toArray()
}
