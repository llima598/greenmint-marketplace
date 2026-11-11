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
    await page.getByLabel('Nova senha').fill('novaSenha789')
    await page.getByLabel('Confirmar nova senha').fill('novaSenha789')
    await page.getByRole('button', { name: 'Alterar senha' }).click()

    await expect(page.getByRole('status')).toHaveText(
      'Sua senha foi alterada com sucesso.',
    )

    await page.getByRole('button', { name: 'Sair' }).click()
    await page.goto('/login')
    await page.getByLabel('E-mail').fill('demo@greenmint.com')
    await page.getByLabel('Senha').fill('novaSenha789')
    await page.getByRole('button', { name: 'Entrar' }).click()

    await expect(page).toHaveURL(/\/$/)
  })
})
