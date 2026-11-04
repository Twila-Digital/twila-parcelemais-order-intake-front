export function validateChassi(chassi: string): string[] {
  const errors: string[] = []

  const validations = [
    {
      condition: () => chassi[0] === '0',
      message: 'O primeiro dígito do chassi não pode ser "0".',
    },
    {
      condition: () => /\s/.test(chassi),
      message: 'O chassi não pode conter espaços.',
    },
    {
      condition: () => {
        const chassiFrom4th = chassi.slice(3)
        return /(.)\1{6,}/.test(chassiFrom4th)
      },
      message:
        'O chassi não pode conter mais de seis repetições consecutivas do mesmo dígito a partir do 4º dígito.',
    },
    {
      condition: () => /[iIoOqQ]/.test(chassi),
      message:
        'O chassi não pode conter os caracteres "i", "I", "o", "O", "q", "Q".',
    },
    {
      condition: () => !/^\d{4}$/.test(chassi.slice(-4)),
      message: 'Os quatro últimos caracteres do chassi devem ser numéricos.',
    },
    {
      condition: () => !/^[A-Za-z0-9]{17}$/.test(chassi),
      message: 'O chassi deve conter exatamente 17 caracteres alfanuméricos.',
    },
  ]

  validations.forEach(({ condition, message }) => {
    if (condition()) {
      errors.push(message)
    }
  })

  return errors
}
