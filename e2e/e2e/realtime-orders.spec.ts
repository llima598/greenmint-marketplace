import { test, expect, type Page } from '@playwright/test'

// A aplicação só renderiza depois que o MSW inicia, então a listagem
// visível indica que as chamadas /api já são interceptadas.
async function waitForMocks(page: Page) {
  await expect(page.locator('a[href^="/nft/"]').first()).toBeVisible()
}

async function login(page: Page) {
  await page.goto('/login')

  await page.getByLabel('E-mail').fill('demo@greenmint.com')
  await page.getByLabel('Senha').fill('123456')

  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page).toHaveURL(/\/$/)
}

async function addFirstNftToCart(page: Page) {
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
}

test.describe('Preço alterado em tempo real (Socket.IO)', () => {
  test('avisa a mudança, atualiza o resumo e bloqueia o checkout até o usuário revisar', async ({
    page,
  }) => {
    await login(page)
    await addFirstNftToCart(page)

    await page.getByRole('link', { name: 'Continuar compra' }).click()

    await expect(
      page.getByRole('heading', { name: 'Finalizar compra' }),
    ).toBeVisible()

    await expect(
      page.getByRole('button', { name: 'Confirmar compra' }),
    ).toBeEnabled()

    // Altera o preço pela API simulada. O handler REST emite `nft.updated`
    // pelo servidor Socket.IO do MSW e o cliente socket.io-client o recebe.
    const newPrice = await page.evaluate(async () => {
      // Existem carrinhos do visitante (vazio) e do usuário logado.
      const cart = Object.keys(localStorage)
        .filter((key) => key.startsWith('greenmint-cart-'))
        .flatMap(
          (key) =>
            JSON.parse(localStorage.getItem(key) ?? '[]') as {
              id: string
              price: number
            }[],
        )

      const target = cart[0]
      const updatedPrice = Number((target.price + 1).toFixed(2))

      await fetch(`/api/nfts/${target.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: updatedPrice }),
      })

      return updatedPrice
    })

    await expect(page.getByRole('alert').first()).toContainText(
      'o valor de itens do seu carrinho mudou',
    )

    await expect(
      page.getByRole('button', {
        name: 'Revise as alterações de preço',
      }),
    ).toBeDisabled()

    // O resumo já usa o preço novo.
    await expect(
      page.getByText(`${newPrice.toFixed(2)} ETH`).first(),
    ).toBeVisible()

    await page
      .getByRole('button', { name: 'Entendi, revisar pedido' })
      .click()

    await expect(
      page.getByRole('button', { name: 'Confirmar compra' }),
    ).toBeEnabled()

    await page.getByRole('button', { name: 'Confirmar compra' }).click()

    await expect(
      page.getByRole('heading', { name: 'Pedido confirmado!' }),
    ).toBeVisible()
  })
})

test.describe('Pedidos e idempotência (API simulada)', () => {
  test('rejeita a mesma chave de idempotência com conteúdo diferente e recupera o mesmo pedido com conteúdo igual', async ({
    page,
  }) => {
    await login(page)

    const result = await page.evaluate(async () => {
      const token = localStorage.getItem('greenmint-token')

      const nfts = (await (await fetch('/api/nfts')).json()) as {
        id: string
        name: string
        price: number
      }[]

      const nft = nfts[0]

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Idempotency-Key': 'teste-idempotencia-1',
      }

      const items = [
        { id: nft.id, name: nft.name, price: nft.price, quantity: 1 },
      ]

      const send = (total: number) =>
        fetch('/api/orders', {
          method: 'POST',
          headers,
          body: JSON.stringify({ items, total }),
        })

      const first = await send(nft.price)
      const firstBody = (await first.json()) as { id: string }

      const repeated = await send(nft.price)
      const repeatedBody = (await repeated.json()) as { id: string }

      const conflict = await send(nft.price + 1)

      return {
        firstStatus: first.status,
        repeatedStatus: repeated.status,
        sameOrder: firstBody.id === repeatedBody.id,
        conflictStatus: conflict.status,
      }
    })

    expect(result.firstStatus).toBe(201)
    expect(result.repeatedStatus).toBe(200)
    expect(result.sameOrder).toBe(true)
    expect(result.conflictStatus).toBe(409)
  })

  test('recusa a criação do pedido quando o preço enviado está desatualizado', async ({
    page,
  }) => {
    await login(page)

    const status = await page.evaluate(async () => {
      const token = localStorage.getItem('greenmint-token')

      const nfts = (await (await fetch('/api/nfts')).json()) as {
        id: string
        name: string
        price: number
      }[]

      const nft = nfts[0]
      const stalePrice = nft.price + 5

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'Idempotency-Key': 'teste-preco-desatualizado',
        },
        body: JSON.stringify({
          items: [
            {
              id: nft.id,
              name: nft.name,
              price: stalePrice,
              quantity: 1,
            },
          ],
          total: stalePrice,
        }),
      })

      return response.status
    })

    expect(status).toBe(409)
  })
})

test.describe('Cadastro', () => {
  test('não armazena a senha em texto puro', async ({ page }) => {
    await page.goto('/')
    await waitForMocks(page)

    const stored = await page.evaluate(async () => {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Teste Senha',
          email: 'senha@greenmint.com',
          password: 'segredo-super-unico-987',
        }),
      })

      return localStorage.getItem('greenmint-users') ?? ''
    })

    expect(stored).toContain('senha@greenmint.com')
    expect(stored).toContain('passwordHash')
    expect(stored).not.toContain('segredo-super-unico-987')
  })

  test('permite entrar com o usuário demo e com um usuário recém-cadastrado', async ({
    page,
  }) => {
    await page.goto('/')
    await waitForMocks(page)

    await page.evaluate(async () => {
      await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Segundo Usuário',
          email: 'segundo@greenmint.com',
          password: 'abcdef',
        }),
      })
    })

    await page.goto('/login')

    await page.getByLabel('E-mail').fill('segundo@greenmint.com')
    await page.getByLabel('Senha').fill('abcdef')

    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/\/$/)
  })
})
