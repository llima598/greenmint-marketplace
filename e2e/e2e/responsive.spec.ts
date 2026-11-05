
import { test, expect } from '@playwright/test'

const viewports = [
  { name: 'Celular', width: 375, height: 900 },
  { name: 'Tablet', width: 768, height: 900 },
  { name: 'Notebook pequeno', width: 1024, height: 900 },
  { name: 'Desktop Figma', width: 1440, height: 900 },
]

for (const viewport of viewports) {
  test(`Responsividade: ${viewport.name} (${viewport.width}px)`, async ({
    page,
  }) => {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    })

    await page.goto('/')

    await expect(
      page.getByRole('heading', { name: 'Explore NFTs' }),
    ).toBeVisible()

    // Verifica se existe rolagem horizontal indesejada.
    const hasHorizontalOverflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      )
    })

    expect(
      hasHorizontalOverflow,
      `Existe rolagem horizontal em ${viewport.width}px`,
    ).toBe(false)

    const filters = page.locator('#marketplace-filters')

    if (viewport.width < 1024) {
      const filterButton = page.getByRole('button', {
        name: /Filtros/,
      })

      await expect(filterButton).toBeVisible()
      await expect(filters).toBeHidden()

      await filterButton.click()

      await expect(filters).toBeVisible()
    } else {
      await expect(filters).toBeVisible()

      await expect(
        page.getByRole('button', { name: /Filtros/ }),
      ).toBeHidden()
    }
  })
}
