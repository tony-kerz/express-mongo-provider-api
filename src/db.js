import debug from 'debug'
import mongodb from 'mongodb'

const dbg = debug('app:db')
const client = mongodb.MongoClient

export async function getDb() {
  dbg('get-db')
  // don't hardcode url :(
  return await client.connect('mongodb://localhost:27017/test')
}
