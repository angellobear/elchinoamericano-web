// ponytail: "hoy" en la zona de Ecuador, no la del server ni la de MySQL, para que
// un host en UTC no adelante 5h el inicio/fin de vigencia de un anuncio.
export function todayInEcuador() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Guayaquil' }).format(new Date())
}
