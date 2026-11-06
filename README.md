# GreenMint Marketplace

Marketplace de NFTs desenvolvido como desafio técnico para a **Jungle Gaming**, utilizando React, TypeScript e ferramentas modernas do ecossistema Front-end.

A aplicação permite explorar NFTs, pesquisar e filtrar produtos, visualizar detalhes, gerenciar um carrinho de compras, aplicar cupons de desconto, realizar um checkout com pagamento simulado e acompanhar pedidos.

**[Acessar aplicação](https://greenmint-marketplace.vercel.app/)** · **[Repositório GitHub](https://github.com/llima598/greenmint-marketplace)**

## Tecnologias utilizadas

- **React 19** — construção da interface.
- **TypeScript** — tipagem estática.
- **Vite** — ambiente de desenvolvimento e build.
- **Tailwind CSS v4** — estilização responsiva.
- **TanStack Router** — gerenciamento de rotas.
- **TanStack Query** — gerenciamento de requisições e cache.
- **Axios** — comunicação HTTP.
- **MSW (Mock Service Worker)** — simulação de API REST.
- **Socket.IO Client** — comunicação em tempo real.
- **@mswjs/socket.io-binding** — integração da simulação de eventos Socket.IO com MSW.
- **Playwright** — testes automatizados End-to-End.
- **Oxlint** — análise estática e qualidade do código.

## Funcionalidades

### Marketplace

- Listagem de NFTs.
- Busca por nome.
- Filtros por categorias e redes blockchain.
- Filtro por faixa de preço.
- Ordenação por diferentes critérios.
- Paginação.
- Estado dos filtros e da busca sincronizado com a URL.
- Visualização individual dos detalhes dos NFTs.

### Autenticação

- Cadastro de usuários.
- Login e logout.
- Recuperação de sessão por token.
- Proteção de rotas.
- Separação dos dados do carrinho por usuário.

### Carrinho e compras

- Adição e remoção de NFTs.
- Controle de quantidade dos itens.
- Persistência local do carrinho.
- Carrinho independente por usuário.
- Validação de cupons de desconto.
- Cupom de demonstração: `GREENMINT10` (10% de desconto).
- Cálculo automático de subtotal, desconto e total.
- Checkout com pagamento simulado.
- Simulação de aprovação, recusa e processamento pendente de pagamento.
- Reaproveitamento de chave de idempotência em novas tentativas da mesma compra.
- Criação e histórico de pedidos.
- Confirmação da compra.

### Atualizações em tempo real

- Integração com Socket.IO Client.
- Eventos `nft.updated` e `order.updated`.
- Atualização de informações por eventos.
- Controle de duplicidade e versões de eventos.
- Identificação de sessão.
- Reconexão automática.

## Arquitetura e organização

O projeto utiliza uma organização por responsabilidades, separando componentes visuais, páginas, contextos, serviços, dados e simulações.

```text
src/
├── components/   # Componentes reutilizáveis
├── context/      # Contextos e gerenciamento de estado
├── data/         # Dados e tipos dos NFTs
├── mocks/        # Handlers REST e simulação de eventos
├── pages/        # Páginas da aplicação
├── services/     # Configuração de API e Socket.IO
├── App.tsx
├── main.tsx
└── router.tsx

e2e/
└── e2e/          # Testes automatizados com Playwright

public/
└── images/       # Imagens utilizadas no marketplace
```

Para mais detalhes sobre as decisões técnicas e a comunicação entre as camadas, consulte [ARCHITECTURE.md](./ARCHITECTURE.md).

## Como executar o projeto

### Pré-requisitos

- Node.js compatível com a versão do Vite utilizada.
- npm.

### Instalação

Clone o repositório:

```bash
git clone https://github.com/llima598/greenmint-marketplace.git
```

Entre na pasta:

```bash
cd greenmint-marketplace
```

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível no endereço informado pelo Vite, normalmente:

```text
http://localhost:5173
```

O MSW é utilizado para simular as operações da API e os serviços necessários à aplicação, sem depender de um backend externo.

## Testes e validações

### Análise estática

```bash
npm run lint
```

### Build de produção

```bash
npm run build
```

### Testes End-to-End

Instale o navegador do Playwright, caso ainda não esteja disponível:

```bash
npx playwright install chromium
```

Execute os testes:

```bash
npm run test:e2e
```

Os testes automatizados cobrem os fluxos de autenticação, checkout e comportamento responsivo em diferentes resoluções.

## Cenários de demonstração

- Crie uma conta pela tela de cadastro ou utilize uma conta já cadastrada no armazenamento local.
- Explore o marketplace e acesse os detalhes de um NFT.
- Adicione itens ao carrinho e altere suas quantidades.
- Aplique o cupom `GREENMINT10` para testar o desconto de 10%.
- Continue para o checkout e confirme uma compra.
- Consulte o histórico de pedidos na área correspondente.

Os pagamentos e as operações de backend são simulados. Nenhuma transação real de criptomoeda é realizada.

## Responsividade

A interface foi desenvolvida e validada em diferentes larguras de tela:

- **375 px** — celular.
- **768 px** — tablet.
- **1024 px** — notebook pequeno.
- **1440 px** — desktop, seguindo a referência do Figma.

## Auditoria de performance e qualidade

As páginas principais do marketplace foram avaliadas com Lighthouse na versão publicada da aplicação, considerando os modos desktop e mobile.

**Ambiente avaliado:** [GreenMint Marketplace](https://greenmint-marketplace.vercel.app/)

### Resultados

| Página | Dispositivo | Performance | Acessibilidade | Boas práticas | SEO |
|---|---|---:|---:|---:|---:|
| Home | Desktop | 99 | 96 | 100 | 100 |
| Home | Mobile | 96 | 96 | 100 | 100 |
| Detalhes do NFT | Desktop | 100 | 100 | 100 | 100 |
| Detalhes do NFT | Mobile | 98 | 100 | 100 | 100 |

### Layout Shift (CLS)

Valores registrados nas auditorias:

- Home — Desktop: `0.054`
- Detalhes do NFT — Mobile: `0`

Ambos ficaram abaixo do limite recomendado de `0.1`, indicando boa estabilidade visual nas condições avaliadas.

### Relatórios Lighthouse

Os relatórios HTML foram gerados localmente na pasta `reports/`:

- `home-desktop-after.html`
- `home-mobile.html`
- `nft-detail-desktop.html`
- `nft-detail-mobile.html`

### Melhorias realizadas

- Inclusão de dimensões explícitas (`width` e `height`) nas imagens para reduzir deslocamentos de layout.
- Otimização da estabilidade visual da página inicial e das imagens de conteúdo.
- Inclusão de metadados para SEO.
- Configuração do arquivo `robots.txt`.

As auditorias foram realizadas nas páginas inicial (`/`) e de detalhes de NFT (`/nft/emerald-ape-042`), utilizando a versão publicada no Vercel.

## Observações

Este projeto utiliza dados e serviços simulados para demonstrar a integração entre interface, gerenciamento de estado, API REST e comunicação em tempo real.

Não há integração com uma blockchain ou processamento real de pagamentos. As operações de autenticação, pedidos, pagamentos e atualizações são executadas no ambiente simulado.

## Autor

Desenvolvido como desafio técnico para o processo seletivo da **Jungle Gaming**.

**GitHub:** [llima598](https://github.com/llima598)</Writing