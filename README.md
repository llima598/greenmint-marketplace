# GreenMint Marketplace

Marketplace de NFTs desenvolvido com **React, TypeScript e Vite**, simulando uma experiência completa de compra e gerenciamento de ativos digitais.

O projeto reúne funcionalidades de navegação por catálogo, autenticação, filtros, carrinho, checkout, histórico de pedidos e atualizações em tempo real, com foco em organização, experiência do usuário e arquitetura Front-End.

🔗 **[Acessar aplicação](https://greenmint-marketplace.vercel.app/)**

---

## Funcionalidades

### Exploração do marketplace
- Listagem de NFTs em catálogo.
- Busca por nome e filtros por categoria, blockchain e faixa de preço.
- Ordenação e paginação.
- Sincronização dos filtros e da busca com a URL.
- Página individual com detalhes de cada NFT.

### Autenticação e conta
- Cadastro, login e logout.
- Gerenciamento de sessão simulada por token.
- Rotas protegidas.
- Carrinho associado ao usuário autenticado.

### Carrinho e checkout
- Adição, remoção e atualização de quantidade dos itens.
- Persistência do carrinho.
- Aplicação de cupom de desconto (`GREENMINT10`).
- Cálculo de subtotal, desconto e valor total.
- Checkout com simulação de pagamentos aprovados, recusados ou pendentes.
- Histórico de pedidos.

### Atualizações em tempo real
- Integração simulada com Socket.IO.
- Eventos de atualização de NFTs e pedidos.
- Tratamento de eventos duplicados e controle de versões.
- Atualização de dados e sincronização do cache.
- Identificação de alterações de preço durante o processo de compra.

---

## Tecnologias utilizadas

| Tecnologia | Utilização |
|---|---|
| React 19 | Construção da interface |
| TypeScript | Tipagem estática |
| Vite | Ambiente de desenvolvimento e build |
| Tailwind CSS v4 | Estilização |
| shadcn/ui e Base UI | Componentes de interface |
| TanStack Router | Roteamento |
| TanStack Query | Gerenciamento de estado assíncrono e cache |
| Axios | Requisições HTTP |
| Socket.IO Client | Comunicação em tempo real |
| MSW | Simulação da API e dos eventos |
| Playwright | Testes end-to-end |
| Oxlint | Análise estática do código |

---

## Destaques técnicos

- **Gerenciamento de estado:** utilização do TanStack Query para cache, consultas e sincronização de dados.
- **Roteamento:** organização das páginas e rotas protegidas com TanStack Router.
- **Integração com API:** camada de serviços utilizando Axios.
- **Simulação de backend:** MSW para interceptação de requisições e simulação dos fluxos da aplicação.
- **Integridade de pedidos:** implementação de controle de idempotência para evitar duplicidade no processamento.
- **Validação de preços:** revalidação de valores antes da finalização da compra, com tratamento de alterações de preço.
- **Tempo real:** integração entre eventos simulados de Socket.IO e atualização dos dados da aplicação.
- **Organização:** separação de componentes, páginas, contextos, serviços e dados simulados.

---

## Testes e qualidade

O projeto conta com testes automatizados end-to-end utilizando Playwright.

**Última validação registrada:**
- 13 testes E2E aprovados.
- Testes de autenticação e fluxo de checkout.
- Testes de atualização de pedidos em tempo real.
- Testes de responsividade.

Os resultados acima correspondem à última execução registrada durante o desenvolvimento e podem variar após novas alterações.

### Responsividade

A interface foi desenvolvida e verificada em diferentes resoluções:

- 375px — dispositivos móveis.
- 768px — tablets.
- 1024px — notebooks.
- 1440px — desktops.

---

## Como executar o projeto

### Pré-requisitos

- Node.js 20.19+ ou 22.12+.
- npm.

### Instalação

```bash
git clone https://github.com/llima598/greenmint-marketplace.git

cd greenmint-marketplace

npm install
```

### Configuração

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_ENABLE_MOCKS=true
```

Os mocks são ativados automaticamente no ambiente de desenvolvimento. A variável permite habilitá-los também no build de produção, como na versão publicada.

### Executar localmente

```bash
npm run dev
```

### Outros comandos

```bash
# Build de produção
npm run build

# Análise estática
npm run lint

# Testes end-to-end
npm run test:e2e

# Instalar navegador do Playwright
npx playwright install chromium
```

---

## Acesso para demonstração

A aplicação disponibiliza uma conta de demonstração:

| Campo | Credencial |
|---|---|
| E-mail | demo@greenmint.com |
| Senha | 123456 |

Também é possível explorar o fluxo de cadastro e autenticação da aplicação.

---

## Escopo e limitações

O GreenMint é um projeto de portfólio com backend e serviços externos simulados.

- As requisições REST são simuladas pelo MSW.
- Os dados são armazenados localmente no navegador.
- Os eventos de Socket.IO são simulados.
- O checkout não realiza transações financeiras reais.
- Não existe integração real com carteiras, redes blockchain ou contratos inteligentes.

O objetivo é demonstrar a construção de uma aplicação Front-End com fluxos completos, integração entre diferentes tecnologias e tratamento de cenários comuns de uma aplicação comercial.

Para conhecer melhor a estrutura, os contratos simulados, os fluxos e as decisões arquiteturais, consulte o arquivo [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## Autor

**Lucas Lima**

Desenvolvedor Front-End Júnior | React · TypeScript · JavaScript

- [LinkedIn](https://www.linkedin.com/in/lucas-lima-231248191/)
- [GitHub](https://github.com/llima598)

