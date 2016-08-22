export function dbgreq(dbg, req) {
  dbg('[%s]%s: params=%o, query=%o', req.method, req.path, req.params, req.query)
}

export function isSet(val) {
  return ['true', '1'].includes(val)
}
