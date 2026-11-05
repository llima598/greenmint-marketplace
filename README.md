# GreenMint Marketplace

Marketplace de NFTs desenvolvido como desafio técnico para a **Jungle Gaming**, utilizando React, TypeScript e ferramentas modernas do ecossistema Front-end.

A aplicação permite explorar NFTs, pesquisar e filtrar produtos, visualizar detalhes, gerenciar um carrinho de compras, realizar um checkout com pagamento simulado e acompanhar pedidos.

## Tecnologias utilizadas

- **React 19** — construção da interface.
- **TypeScript** — tipagem estática e segurança no desenvolvimento.
- **Vite** — ambiente de desenvolvimento e build.
- **Tailwind CSS v4** — estilização responsiva.
- **TanStack Router** — gerenciamento de rotas.
- **TanStack Query** — gerenciamento de requisições e cache.
- **Axios** — comunicação HTTP.
- **MSW (Mock Service Worker)** — simulação de API REST.
- **Socket.IO Client** — comunicação em tempo real.
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
- Separação do carrinho por usuário.

### Carrinho e compras

- Adição e remoção de NFTs.
- Persistência local do carrinho.
- Carrinho independente por usuário.
- Cálculo automático do total.
- Checkout.
- Simulação de aprovação, recusa e processamento pendente de pagamento.
- Reaproveitamento de chave de idempotência em novas tentativas da mesma compra.
- Criação e histórico de pedidos.
- Confirmação da compra.

### Atualizações em tempo real

- Integração com Socket.IO.
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
├── mocks/        # Handlers REST