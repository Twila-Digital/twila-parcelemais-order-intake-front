export function toIsoDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getAgeInYears(birthDate: Date, today = new Date()) {
  const age = today.getFullYear() - birthDate.getFullYear()
  const hadBirthday =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() >= birthDate.getDate())
  return hadBirthday ? age : age - 1
}

function subtractYears(date: Date, years: number) {
  const year = date.getFullYear() - years
  const lastDayOfMonth = new Date(year, date.getMonth() + 1, 0).getDate()
  return new Date(
    year,
    date.getMonth(),
    Math.min(date.getDate(), lastDayOfMonth),
  )
}

export function getBirthDateRange(
  minAge: number,
  maxAge: number,
  today = new Date(),
) {
  const minDate = subtractYears(today, maxAge + 1)
  minDate.setDate(minDate.getDate() + 1)
  return { minDate, maxDate: subtractYears(today, minAge) }
}

const BRAZIL_TIME_ZONE = 'America/Sao_Paulo'
const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/

export function formatBrazilianDate(value: string | null | undefined) {
  if (!value) return null

  const dateOnly = DATE_ONLY.exec(value)
  if (dateOnly) {
    const [, year, month, day] = dateOnly
    return `${day}/${month}/${year}`
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRAZIL_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export function formatBrazilianDateTime(value: string | null | undefined) {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  const parts = new Intl.DateTimeFormat('pt-BR', {
    timeZone: BRAZIL_TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ''

  return `${part('day')}/${part('month')}/${part('year')} ${part('hour')}:${part('minute')}`
}
