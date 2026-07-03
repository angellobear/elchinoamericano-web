// Clave normalizada (minúsculas, espacios simples) → nombre canónico en BD
const ALIASES: Record<string, string> = {
  'dongfeng':      'DFSK',
  'dong feng':     'DFSK',
  'donfeng':       'DFSK',
  'don feng':      'DFSK',
  'dfsk':          'DFSK',
  'great wall':    'Great Wall',
  'greatwall':     'Great Wall',
  'chery':         'Chery',
  'cheery':        'Chery',
  'jac':           'JAC',
  'byd':           'BYD',
  'geely':         'Geely',
  'haval':         'Great Wall',
  'mg':            'MG',
  'morris garages':'MG',
  'faw':           'FAW',
}

/** Devuelve el nombre canónico de la marca, sin importar mayúsculas/minúsculas o espacios extra. */
export function normalizeVehicleBrand(name: string): string {
  const key = name.trim().toLowerCase().replace(/\s+/g, ' ')
  return ALIASES[key] ?? name.trim()
}
