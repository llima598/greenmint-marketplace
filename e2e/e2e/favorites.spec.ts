import { test, expect } from '@playwright/test'

test.describe('Favoritos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('E-mail').fill('demo@greenmint.com')
    await page.getByLabel('Senha').fill('123456')
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page).toHaveURL(/\/$/)
  })

  test('permite adicionar e remover um NFT dos favoritos', async ({ page }) => {
    const favoriteButton = page.getByRole('button', {
      name: 'Adicionar aos favoritos',
    }).first()

    await expect(favoriteButton).toBeVisible()
    await favoriteButton.click()

    await expect(
      page.getByRole('button', { name: 'Remover dos favoritos' }).first(),
    ).toHaveAttribute('aria-pressed', 'true')

    await page.getByRole('link', { name: 'Favoritos' }).click()
    await expect(
      page.getByRole('heading', { name: 'Meus favoritos' }),
    ).toBeVisible()

    const removeButton = page.getByRole('button', {
      name: 'Remover dos favoritos',
    }).first()

    await expect(removeButton).toBeVisible()
    await removeButton.click()

    await expect(
      page.getByText('Sua lista está vazia'),
    ).toBeVisible()
  })
})
