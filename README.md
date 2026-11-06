# GreenMint Marketplace

Marketplace de NFTs desenvolvido como desafio técnico para a **Jungle Gaming**, utilizando React, TypeScript e ferramentas modernas do ecossistema Front-end.

A aplicação permite explorar NFTs, pesquisar e filtrar produtos, visualizar detalhes, gerenciar um carrinho de compras, aplicar cupons de desconto, realizar um checkout com pagamento simulado e acompanhar pedidos.

**[Acessar aplicação](https://greenmint-marketplace.vercel.app/)** · **[Repositório GitHub](https://github.com/llima598/greenmint-marketplace)**

## Tecnologias utilizadas

- **React 19** — construção da interface.
- **TypeScript** — tipagem estática.
- **Vite** — ambiente de desenvolvimento e build.
- **Tailwind CSS v4** — estilização responsiva.
- **shadcn/ui** — biblioteca de componentes de interface, utilizando Base UI.
- **Lucide React** — biblioteca de ícones.
- **TanStack Router** — gerenciamento de rotas.
- **TanStack Query** — gerenciamento de requisições e cache.
- **Axios** — comunicação HTTP.
- **MSW (Mock Service Worker)** — simulação de API REST.
- **Socket.IO Client** — comunicação em tempo real.
- **@mswjs/socket.io-binding** — integração da simulação de eventos Socket.IO com MSW.
- **Playwright** — testes automatizados End-to-End.
- **Oxlint** — análise estática e qualidade do código.

## Interface e componentes

A interface utiliza componentes do shadcn/ui para padronizar elementos visuais e facilitar a reutilização.

Os componentes implementados incluem:

- **Button** — botões de ações e navegação.
- **Input** — campos de busca e filtros de preço.
- **Checkbox** — seleção de categorias e redes blockchain.
- **Select** — ordenação dos NFTs.
- **Badge** — identificação visual da quantidade de filtros ativos.
- **Skeleton** — estados de carregamento.

Os componentes foram integrados à identidade visual do GreenMint, mantendo a paleta de cores e o padrão visual da aplicação.

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
├── components/
│   ├── ui/           # Componentes reutilizáveis do shadcn/ui
│   └── ...           # Demais componentes da aplicação
├── context/          # Contextos e gerenciamento de estado
├── data/             # Dados e tipos dos NFTs
├── lib/              # Funções utilitárias
├── mocks/            # Handlers REST e simulação de eventos
├── pages/            # Páginas da aplicação
├── services/         # Configuração de API e Socket.IO
├── App.tsx
├── main.tsx
└── router.tsx

e2e/
└── ...                # Testes automatizados com Playwright

public/
├── images/            # Imagens utilizadas no marketplace
└── robots.txt
```

Para mais detalhes sobre as decisões técnicas e a comunicação entre as camadas, consulte [ARCHITECTURE.md](./ARCHITECTURE.md).

## Como executar o projeto

### Pré-requisitos

- **Node.js 20.19+ ou 22.12+**.
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

### Variáveis de ambiente

| Variável | Valor | Descrição |
|---|---|---|
| `VITE_ENABLE_MOCKS` | `true` | Ativa o MSW no build de produção e na versão publicada. Em desenvolvimento (`npm run dev`) os mocks são sempre ativados. |

O arquivo `.env.example` traz o valor para uso local. Na Vercel, a variável deve estar definida nas configurações do projeto.

### Credenciais fictícias

| Usuário | E-mail | Senha |
|---|---|---|
| Demo | `demo@greenmint.com` | `123456` |

Novas contas podem ser criadas na tela de cadastro. As senhas são guardadas apenas como hash SHA-256 no armazenamento local do navegador (veja as limitações em [ARCHITECTURE.md](ARCHITECTURE.md)).

### Cenários e reset dos dados simulados

Os dados simulados (usuários, sessões, pedidos e NFTs) ficam no `localStorage`, em chaves com o prefixo `greenmint-`.

- **Pagamento aprovado (padrão):** `localStorage.setItem('greenmint-payment-simulation', 'approved')`
- **Pagamento recusado:** `localStorage.setItem('greenmint-payment-simulation', 'rejected')`. O pedido fica como `rejected` (estado terminal) e a nova tentativa usa uma nova chave de idempotência.
- **Pagamento pendente:** `localStorage.setItem('greenmint-payment-simulation', 'pending')`. O pedido permanece `pending`, e reenviar a compra recupera o mesmo pedido.
- **Alterar preço em tempo real:** envie `PATCH /api/nfts/:id` com `{ "price": 2.5 }` pelo console do navegador. O handler emite `nft.updated` pelo Socket.IO simulado, e o carrinho e o checkout exibem o aviso.

```js
// Exemplo: mudar o preço de um NFT com o carrinho aberto
fetch('/api/nfts/emerald-ape-042', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ price: 2.5 }),
})
```

Para restaurar o cenário inicial, remova todas as chaves do projeto e recarregue a página:

```js
Object.keys(localStorage)
  .filter((key) => key.startsWith('greenmint-'))
  .forEach((key) => localStorage.removeItem(key))
location.reload()
```

## Testes e validações

### Análise estática

```bash
npm run lint
```

A execução atual do Oxlint apresentou **0 erros e 2 avisos** relacionados à regra `react/only-export-components` nos componentes de interface `button` e `badge`.

### Build de produção

```bash
npm run build
```

O comando executa a verificação de tipos do TypeScript e a compilação de produção pelo Vite.

A última validação foi concluída com sucesso. O Vite apresentou um aviso sobre o tamanho do bundle JavaScript principal, sem impedir a geração da versão de produção.

### Testes End-to-End

Instale o navegador do Playwright, caso ainda não esteja disponível:

```bash
npx playwright install chromium
```

Execute os testes:

```bash
npm run test:e2e
```

Os testes automatizados cobrem:

- Autenticação com credenciais válidas.
- Autenticação com credenciais inválidas.
- Checkout com pagamento aprovado.
- Checkout com pagamento recusado e nova tentativa.
- Alteração de preço via Socket.IO durante o checkout: aviso, resumo atualizado e compra bloqueada até a revisão.
- Idempotência de pedidos: mesma chave recupera o mesmo pedido, e conteúdo diferente retorna `409`.
- Criação de pedido com preço desatualizado rejeitada com `409`.
- Cadastro sem armazenar a senha em texto puro e login com o novo usuário.
- Comportamento responsivo em 375 px, 768 px, 1024 px e 1440 px.

**Última validação executada: 13 de 13 testes aprovados.**

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

Os relatórios HTML foram gerados localmente na pasta `reports/`, utilizada para armazenar os resultados das auditorias e excluída do versionamento pelo `.gitignore`.

### Melhorias realizadas

- Inclusão de dimensões explícitas (`width` e `height`) nas imagens para reduzir deslocamentos de layout.
- Otimização da estabilidade visual da página inicial e das imagens de conteúdo.
- Inclusão de metadados para SEO.
- Configuração do arquivo `robots.txt`.

As auditorias foram realizadas nas páginas inicial (`/`) e de detalhes de NFT (`/nft/emerald-ape-042`), utilizando a versão publicada no Vercel.

## Escopo implementado e limitações

O desafio pede um escopo maior do que esta entrega cobre. Para evitar ambiguidade, segue o que está e o que não está implementado.

**Implementado**

- Catálogo com busca, filtros combinados, ordenação e paginação sincronizados com a URL.
- Detalhe do NFT, carrinho com quantidades, cupom e persistência por usuário e visitante.
- Cadastro, login, recuperação de sessão, proteção de rotas e logout.
- Checkout com pedido idempotente, pagamento simulado (aprovado, recusado e pendente) e confirmação.
- Revalidação de preço no servidor simulado antes de criar o pedido (`409 PRICE_CHANGED`).
- Tempo real com Socket.IO sobre MSW: `nft.updated` e `order.updated`, com proteção contra eventos duplicados e antigos, identificação da sessão e reconciliação após reconexão.
- Aviso de alteração de preço no carrinho e no checkout, com a compra bloqueada até o usuário revisar.
- Testes E2E com Playwright e auditoria Lighthouse manual.

**Não implementado nesta entrega**

- Favoritos.
- Cadastro e edição de carteiras, e seleção de carteira e rede no checkout.
- Edição de perfil, avatar e alteração de senha.
- Endpoint de cotação com taxa de rede. Os cálculos são feitos no cliente com `number` (o enunciado pede strings decimais).
- Busca, filtros, ordenação e paginação processados pela API: a listagem `GET /api/nfts` devolve todos os NFTs e a filtragem acontece no cliente.
- Atualização otimista com rollback.
- Expiração de sessão e cenários configuráveis de latência, timeout e falhas HTTP.
- Disponibilidade por edição (só o preço é revalidado).
- Regressão visual, testes de reconexão do socket, configuração e scripts do Lighthouse versionados.

Os detalhes técnicos, as decisões e as limitações estão em [ARCHITECTURE.md](ARCHITECTURE.md).

## Observações

Este projeto utiliza dados e serviços simulados para demonstrar a integração entre interface, gerenciamento de estado, API REST e comunicação em tempo real.

Não há integração com uma blockchain ou processamento real de pagamentos. As operações de autenticação, pedidos, pagamentos e atualizações são executadas no ambiente simulado.

## Autor

Desenvolvido como desafio técnico para o processo seletivo da **Jungle Gaming**.

**GitHub:** [llima598](https://github.com/llima598)
