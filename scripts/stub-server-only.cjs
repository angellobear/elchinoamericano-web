// `server-only` solo existe dentro del build de Next. Para correr scripts de verificación
// que tocan lib/db/** con tsx, se resuelve a este mismo archivo (un módulo vacío).
// eslint-disable-next-line @typescript-eslint/no-require-imports -- precarga CommonJS (`tsx -r`)
const Module = require('module')

const resolveFilename = Module._resolveFilename
Module._resolveFilename = function (request, ...rest) {
  return request === 'server-only' ? __filename : resolveFilename.call(this, request, ...rest)
}
