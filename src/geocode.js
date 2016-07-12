import axios from 'axios'
import debug from 'debug'
import Timer from './timer'

const dbg = debug('app:geocode')

export default async function(address, opts={}) {
  const params = {
    api_key: opts.apiKey || 'search-ND7BVJ',
    ['boundary.country']: 'USA',
    size: 1,
    text: address,
    timeout: 2000
  }

  const timer = new Timer('geocode')
  const geoResult = await axios.get('https://search.mapzen.com/v1/search', {params})
  timer.stop()

  const {coordinates} = geoResult.data.features[0].geometry
  dbg('geocode: address=%s, geo-point=%o, timer=%o', address, coordinates, timer.toString())

  return coordinates
}
