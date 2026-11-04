import IMask from 'imask'

export const PLATE_REGEX = /^[a-zA-Z]{3}-\d{4}$|^[a-zA-Z]{3}\d[a-zA-Z]\d{2}$/

export const PLATE_INVALID_MESSAGE = 'A placa não é válida'

export const createPlateMask = () =>
  IMask.createMask({
    mask: ['aaa0a00', 'aaa-0000'],
    prepare: (str: string) => str.toUpperCase(),
  })
