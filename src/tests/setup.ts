import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

const isDom = typeof window !== 'undefined'

if (isDom) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  globalThis.ResizeObserver ??= ResizeObserverStub

  Element.prototype.hasPointerCapture ??= () => false
  Element.prototype.setPointerCapture ??= () => {}
  Element.prototype.releasePointerCapture ??= () => {}
  Element.prototype.scrollIntoView ??= () => {}
  Element.prototype.scrollTo ??= () => {}
  document.elementFromPoint ??= () => null

  globalThis.matchMedia ??= (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList
}

vi.mock('@/modules/intake/hooks/use-advance-intake-step', async () => {
  const { advanceIntakeStep } = await import('./intake-step-mocks')
  return {
    useAdvanceIntakeStep: () => ({
      advance: advanceIntakeStep,
      isAdvancing: false,
    }),
  }
})

afterEach(() => {
  if (isDom) cleanup()
  vi.clearAllMocks()
})
