const zipRe = /^\d{5}(\d{4})?$/

export function isZip(s) {
  return zipRe.test(s)
}
