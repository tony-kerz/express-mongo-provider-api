export function dbgreq(dbg, req) {
  dbg('[%s]%s: params=%o, query=%o', req.method, req.path, req.params, req.query)
}

// used to determine if param is set to value 1 (anything but 1 will return false)
export function isSet(key) {
  return parseInt(key) == 1
}
