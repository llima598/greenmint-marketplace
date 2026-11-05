
import { test, expect } from '@playwright/test'

test.describe('Autenticação', () => {
  test('permite entrar com credenciais válidas', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('E-mail').fill('demo@greenmint.com')
    await page.getByLabel('Senha').fill('123456')

    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/\/$/)
  })

  test('mostra erro quando as credenciais são inválidas', async ({
    page,
  }) => {
    await page.goto('/login')

    await page.getByLabel('E-mail').fill('invalido@greenmint.com')
    await page.getByLabel('Senha').fill('senha-incorreta')

    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page.getByRole('alert')).toHaveText(
      'E-mail ou senha inválidos.',
    )
  })
})
