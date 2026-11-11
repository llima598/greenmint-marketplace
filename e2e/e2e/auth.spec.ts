
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
  test('encerra a sessão no backend e redireciona para login', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill('demo@greenmint.com')
    await page.getByLabel('Senha').fill('123456')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/\/$/)
    await page.getByRole('button', { name: 'Sair' }).click()
    await expect(page).toHaveURL(/\/login$/)

    const storedSessions = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('greenmint-sessions') ?? '[]'),
    )
    expect(storedSessions).toHaveLength(0)
    expect(await page.evaluate(() => localStorage.getItem('greenmint-token'))).toBeNull()
  })

  test('redireciona para login quando a sessão está expirada', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('greenmint-token', 'expired-session-token')
      localStorage.setItem('greenmint-sessions', JSON.stringify([{
        token: 'expired-session-token',
        userId: 'user-demo',
        expiresAt: new Date(Date.now() - 60_000).toISOString(),
      }]))
    })

    await page.goto('/profile')
    await expect(page).toHaveURL(/\/login$/)
    await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeVisible()
    expect(await page.evaluate(() => localStorage.getItem('greenmint-token'))).toBeNull()
  })
})
