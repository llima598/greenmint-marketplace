
import { test, expect, type Page } from '@playwright/test'

async function loginAndAddNft(page: Page) {
  await page.goto('/login')

  await page.getByLabel('E-mail').fill('demo@greenmint.com')
  await page.getByLabel('Senha').fill('123456')

  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page).toHaveURL(/\/$/)

  const firstNft = page.locator('a[href^="/nft/"]').first()

  await expect(firstNft).toBeVisible()
  await firstNft.click()

  await page.getByRole('button', {
    name: 'Adicionar ao carrinho',
  }).click()

  await page.getByRole('link', {
    name: 'Ir para o carrinho',
  }).click()

  await expect(
    page.getByRole('heading', { name: 'Meu carrinho' }),
  ).toBeVisible()

  await expect(
    page.locator('main').getByRole('heading', { level: 2 }).first(),
  ).toBeVisible()
}

test.describe('Fluxo de compra', () => {
  test('finaliza a compra quando o pagamento é aprovado', async ({
    page,
  }) => {
    await loginAndAddNft(page)

    await page.getByRole('link', {
      name: 'Continuar compra',
    }).click()

    await expect(
      page.getByRole('heading', { name: 'Finalizar compra' }),
    ).toBeVisible()

    await page.getByRole('button', {
      name: 'Confirmar compra',
    }).click()

    await expect(
      page.getByRole('heading', { name: 'Pedido confirmado!' }),
    ).toBeVisible()

    await expect(
      page.getByText('Número do pedido'),
    ).toBeVisible()

    await expect(
      page.getByText('Identificação do pagamento'),
    ).toBeVisible()

    await page.goto('/cart')

    await expect(
      page.getByText('Seu carrinho está vazio.'),
    ).toBeVisible()
  })

  test('preserva o carrinho quando o pagamento é recusado e permite tentar novamente', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'greenmint-payment-simulation',
        'rejected',
      )
    })

    await loginAndAddNft(page)

    await page.getByRole('link', {
      name: 'Continuar compra',
    }).click()

    await page.getByRole('button', {
      name: 'Confirmar compra',
    }).click()

    await expect(
      page.getByText(
        'Não foi possível processar o pagamento. Tente novamente.',
      ),
    ).toBeVisible()

    await expect(
      page.getByRole('heading', { name: 'Finalizar compra' }),
    ).toBeVisible()

    await page.evaluate(() => {
      localStorage.setItem(
        'greenmint-payment-simulation',
        'approved',
      )
    })

    await page.getByRole('button', {
      name: 'Confirmar compra',
    }).click()

    await expect(
      page.getByRole('heading', { name: 'Pedido confirmado!' }),
    ).toBeVisible()

    await page.goto('/cart')

    await expect(
      page.getByText('Seu carrinho está vazio.'),
    ).toBeVisible()
  })
})
