import { expect, test } from '@playwright/test'
import { AppShellPom } from '../../pom/app-shell.pom'

test.describe('home', () => {
  test('renders the app shell with the parcelemais brand', async ({ page }) => {
    const shell = new AppShellPom(page)
    await shell.goto()

    await expect(page).toHaveTitle('Proposta | Parcele Mais')
    await expect(shell.logo).toBeVisible()
    await expect(shell.footer).toContainText('Feito por')
  })
})
