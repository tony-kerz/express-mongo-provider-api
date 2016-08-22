import debug from 'debug'
import mongodb from 'mongodb'
import config from 'config'

const dbg = debug('app:db')
const client = mongodb.MongoClient

export async function getDb() {
  const url = config.get('mongo.url')
  dbg('get-db: url=%o', url)
  return await client.connect(url)
}
