import { cnpj } from 'cpf-cnpj-validator'
import { format, formatDate, isValid, parseISO } from 'date-fns'

function formatCPF(cpf: number | string): string {
  const cpfString = String(cpf).padStart(11, '0')
  return cpfString.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

function formatCNPJ(value: number | string): string {
  const padded = String(value).padStart(14, '0')
  return cnpj.format(padded)
}

function formatCNPJInput(value: string): string {
  const cleaned = cnpj.strip(value).slice(0, 14)

  return cleaned
    .replace(/^(.{2})(.)/, '$1.$2')
    .replace(/^(.{2})\.(.{3})(.)/, '$1.$2.$3')
    .replace(/^(.{2})\.(.{3})\.(.{3})(.)/, '$1.$2.$3/$4')
    .replace(/^(.{2})\.(.{3})\.(.{3})\/(.{4})(.)/, '$1.$2.$3/$4-$5')
}

function formatCurrencyBRL(
  value: number,
  opts?: { showCents?: boolean },
): string {
  const { showCents = true } = opts || {}
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(value)

  return formattedValue
}

function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

interface FormatPercentOptions {
  fractionDigits?: number
}

function formatPercent(
  percentValue: number,
  options: FormatPercentOptions = { fractionDigits: 2 },
) {
  const percent = percentValue / 100

  return Intl.NumberFormat('pt-BR', {
    maximumFractionDigits: options.fractionDigits,
    minimumFractionDigits: options.fractionDigits,
    style: 'percent',
  }).format(percent)
}

function formatBRDateToUTC(date: string) {
  const [day, month, year] = date.split('/')

  const utcDate = new Date(+year, +month - 1, +day)

  return utcDate
}

const formatDateToShort = (date: Date): string => {
  return formatDate(date, 'dd/MM/yyyy')
}

const formatDateDayAndMonth = (date: Date): string => {
  return formatDate(date, 'dd/MM')
}

const formatDateHour = (dateString: string): string => {
  const date = new Date(dateString)
  return formatDate(date, 'dd/MM/yy - HH:mm')
}

const formatHour = (date: Date): string => {
  return formatDate(date, 'HH:mm')
}

const convertRealMonthToJSMonth = (month: number) => {
  const monthAdjustFactor = 1
  const jsMonth = month - monthAdjustFactor
  return jsMonth
}

function formatPhone(phone: string): string {
  if (phone) {
    const phoneString = phone.replace(/\D/g, '')
    const ddd = phoneString.slice(2, 4)
    const number = phoneString.slice(4)
    const firstGroup = number.slice(1, 5)
    const lastGroup = number.slice(5)

    return `(${ddd}) 9${firstGroup}-${lastGroup}`
  } else {
    return ''
  }
}

const formatNameToTitleCase = (name: string): string => {
  return name
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatZipCodeDigits = (zipCode: string): string => {
  const zipCodeDigits = zipCode.replace('.', '')
  return zipCodeDigits
}

const formatISODateToBR = (isoDate: string): string => {
  if (!isoDate) return ''

  if (isoDate.includes('/')) return isoDate

  if (isoDate.includes('-')) {
    const date = parseISO(isoDate)
    if (isValid(date)) {
      return format(date, 'dd/MM/yyyy')
    }
  }
  return isoDate
}

function formatState(value: string): string {
  const cleaned = value.replace(/[^a-zA-Z]/g, '').toUpperCase()
  return cleaned.slice(0, 2)
}

function formatDateForm(date: Date | string | undefined | null): string {
  if (!date) return ''
  const value = typeof date === 'string' ? date : date.toISOString()
  return formatISODateToBR(value)
}

export const formatter = {
  formatCPF,
  formatCNPJ,
  formatCNPJInput,
  formatCurrencyBRL,
  formatCompactNumber,
  formatPercent,
  formatDateToShort,
  formatDateDayAndMonth,
  convertRealMonthToJSMonth,
  formatDateHour,
  formatHour,
  formatPhone,
  formatZipCodeDigits,
  formatBRDateToUTC,
  formatNameToTitleCase,
  formatISODateToBR,
  formatState,
  formatDateForm,
}
