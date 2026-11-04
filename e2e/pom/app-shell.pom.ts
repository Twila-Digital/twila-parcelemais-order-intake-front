import type { Locator, Page } from '@playwright/test'

export class AppShellPom {
  readonly page: Page
  readonly logo: Locator
  readonly footer: Locator

  constructor(page: Page) {
    this.page = page
    this.logo = page.getByRole('img', { name: 'Credicarro' })
    this.footer = page.getByRole('contentinfo')
  }

  async goto(path = '/') {
    await this.page.goto(path)
  }
}
