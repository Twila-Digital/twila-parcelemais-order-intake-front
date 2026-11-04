export function validateRenavam(renavam: string): boolean {
  if (!renavam || renavam.trim() === '') {
    return false
  }

  renavam = renavam.trim().padStart(11, '0')

  if (renavam.length !== 11 || !/^\d{11}$/.test(renavam)) {
    return false
  }

  const numbers = renavam.split('').map(Number)
  const multipliers = [3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  let sum = 0
  for (let i = 0; i < 10; i++) {
    sum += numbers[i] * multipliers[i]
  }

  const remainder = sum % 11
  const checkDigit = remainder < 2 ? 0 : 11 - remainder

  return numbers[10] === checkDigit
}
