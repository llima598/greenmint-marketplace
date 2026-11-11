import { test, expect } from '@playwright/test'

async function signIn(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('demo@greenmint.com')
  await page.getByLabel('Senha').fill('123456')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page).toHaveURL(/\/$/)
}

test.describe('Perfil do usuário', () => {
  test('permite atualizar nome e e-mail e mantém os dados após recarregar', async ({
    page,
  }) => {
    await signIn(page)
    await page.goto('/profile')

    await page.getByLabel('Nome completo').fill('Usuário Demo Atualizado')
    await page.getByLabel('E-mail').fill('demo.atualizado@greenmint.com')
    await page.getByRole('button', { name: 'Salvar alterações' }).click()

    await expect(page.getByRole('status')).toHaveText(
      'Seus dados foram atualizados com sucesso.',
    )

    await page.reload()

    await expect(page.getByLabel('Nome completo')).toHaveValue(
      'Usuário Demo Atualizado',
    )
    await expect(page.getByLabel('E-mail')).toHaveValue(
      'demo.atualizado@greenmint.com',
    )
  })

  test('não permite salvar e-mail que já pertence a outra conta', async ({
    page,
  }) => {
    await page.goto('/register')
    await page.getByLabel('Nome completo').fill('Outra Conta')
    await page.getByLabel('E-mail').fill('outro@greenmint.com')
    await page.getByLabel('Senha', { exact: true }).fill('senha123')
    await page.getByLabel('Confirmar senha').fill('senha123')
    await page.getByRole('button', { name: 'Criar minha conta' }).click()
    await expect(page).toHaveURL(/\/$/)

    await signIn(page)
    await page.goto('/profile')

    await page.getByLabel('E-mail').fill('outro@greenmint.com')
    await page.getByRole('button', { name: 'Salvar alterações' }).click()

    await expect(page.getByRole('alert')).toHaveText(
      'Este e-mail já está sendo utilizado por outra conta.',
    )
  })

  test('permite alterar a senha e entrar com a nova credencial', async ({
    page,
  }) => {
    await signIn(page)
    await page.goto('/profile')

    await page.getByLabel('Senha atual').fill('123456')
    await page.getByLabel('Nova senha', { exact: true }).fill('novaSenha789')
    await page.getByLabel('Confirmar nova senha').fill('novaSenha789')
    await page.getByRole('button', { name: 'Alterar senha' }).click()

    await expect(page.getByRole('status')).toHaveText(
      'Sua senha foi alterada com sucesso.',
    )

    await page.goto('/login')
    await page.getByLabel('E-mail').fill('demo@greenmint.com')
    await page.getByLabel('Senha').fill('novaSenha789')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/\/$/)
  })
})


test.describe('Carteira digital', () => {
  test('permite vincular e desconectar uma carteira Ethereum', async ({ page }) => {
    await signIn(page)
    await page.goto('/profile')

    await page.getByLabel('Rede').selectOption('Ethereum')
    await page.getByLabel('Endereço público').fill('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')
    await page.getByRole('button', { name: 'Vincular carteira' }).click()

    await expect(page.getByText('Carteira vinculada com sucesso.')).toBeVisible()
    await expect(page.getByText('Ethereum', { exact: true })).toBeVisible()
    await expect(page.getByText('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBeVisible()

    await page.getByRole('button', { name: 'Desconectar carteira' }).click()
    await expect(page.getByText('Carteira desconectada.')).toBeVisible()
    await expect(page.getByLabel('Endereço público')).toBeVisible()
  })

  test('valida o endereço conforme a rede selecionada', async ({ page }) => {
    await signIn(page)
    await page.goto('/profile')

    await page.getByLabel('Rede').selectOption('Polygon')
    await page.getByLabel('Endereço público').fill('endereco-invalido')
    await page.getByRole('button', { name: 'Vincular carteira' }).click()

    await expect(page.getByRole('alert')).toHaveText(
      'Informe um endereço público válido para a rede selecionada.',
    )
  })
})
