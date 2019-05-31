const { sep } = require(`path`)

// Removes all user paths
const cleanPaths = (str, separator = sep) => {
  const stack = process.cwd().split(separator)

  // Since the error is JSON.stringified the `\` is escaped so we need to take that in to account
  //if (separator === `\\`) {
  //  separator = `\\\\`
  //}
  while (stack.length > 1) {
    const currentPath = stack.join(separator)
    const currentRegex = new RegExp(
      currentPath.replace(/[-[/{}()*+?.\\^$|]/g, `\\$&`),
      `g`
    )
    str = str.replace(currentRegex, `$SNIP`)

    const currentPath2 = stack.join(separator + separator)
    const currentRegex2 = new RegExp(
      currentPath2.replace(/[-[/{}()*+?.\\^$|]/g, `\\$&`),
      `g`
    )
    str = str.replace(currentRegex2, `$SNIP`)
    stack.pop()
  }
  return str
}

const ensureArray = value => [].concat(value)

// Takes an Error and returns a sanitized JSON String
const sanitizeError = (error, pathSeparator = sep) => {
  // Convert Buffers to Strings
  if (error.stderr) error.stderr = String(error.stderr)
  if (error.stdout)
    error.stdout = String(error.stdout)

    // Remove sensitive and useless keys
  ;[`envPairs`, `options`, `output`].forEach(key => delete error[key])

  // Hack because Node
  error = JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error)))

  const errorString = JSON.stringify(error)

  // Removes all user paths
  return cleanPaths(errorString, pathSeparator)
}

// error could be Error or [Error]
const sanitizeErrors = error => {
  const errors = ensureArray(error)
  return errors.map(error => sanitizeError(error))
}

module.exports = {
  sanitizeError,
  sanitizeErrors,
  cleanPaths,
}
