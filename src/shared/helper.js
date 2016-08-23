const zip5Re = /^\d{5}$/
const zipRe = /^\d{5}(\d{4})?$/

export function isZip5(s) {
  return zip5Re.test(s)
}

export function isZip(s) {
  return zipRe.test(s)
}
