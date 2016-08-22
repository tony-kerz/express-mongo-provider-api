import _ from 'lodash'
import getRouter from '../shared/get-router'
import {isSet} from '../shared/express-helper'

export default function({collectionName, groupId}) {
  return getRouter({
    collectionName,
    steps: [
      {$sort: {'client.id': 1}},
      {
        $group: {
          _id: groupId,
          doc: {$last: '$$ROOT'}
        }
      }
    ],
    docField: 'doc', // corresponds to 'doc' field above
    optsHook: (opts) => {
      const clientId = _.get(opts, 'client.id')
      // important: if client.id is not set, only return public data (where client.id = null)
      opts['client.id'] = clientId ? (isSet(opts.includeOutOfNetwork) ? [clientId, null] : clientId) : null
      // pull includeOutOfNetwork as mongo doesn't know about that
      return _.omit(opts, ['includeOutOfNetwork'])
    }
  })
}
