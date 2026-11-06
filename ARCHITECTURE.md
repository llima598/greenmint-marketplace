# Arquitetura — GreenMint Marketplace

## 1. Visão geral

O GreenMint Marketplace é uma aplicação Front-end desenvolvida com React e TypeScript como desafio técnico para a Jungle Gaming.

A arquitetura separa responsabilidades entre interface, gerenciamento de estado, navegação, comunicação HTTP e atualizações em tempo real.

Os serviços de backend são simulados com Mock Service Worker (MSW), permitindo executar os principais fluxos da aplicação sem depender de uma API externa.

## 2. Tecnologias e responsabilidades

| Tecnologia | Responsabilidade |
|---|---|
| React | Construção da interface e composição de componentes |
| TypeScript | Tipagem estática |
| Vite | Desenvolvimento e build |
| Tailwind CSS | Estilização e responsividade |
| TanStack Router | Navegação e gerenciamento de rotas |
| TanStack Query | Requisições, cache e sincronização de dados |
| Axios | Comunicação HTTP |
| React Context | Estado compartilhado de autenticação e carrinho |
| MSW | Simulação dos serviços REST |
| Socket.IO Client | Comunicação em tempo real |
| Playwright | Testes automatizados End-to-End |
| Oxlint | Análise estática do código |

## 3. Organização de pastas

```text
src/
├── components/
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── Hero.tsx
│   ├── Journal.tsx
│   ├── Products.tsx
│   ├── Promos.tsx
│   ├── PriceChangeNotice.tsx
│   ├── ProtectedRoute.tsx
│   └── SocketConnection.tsx
│
├── context/
│   ├── AuthContext.tsx
│   ├── AuthContextDefinition.ts
│   ├── CartContext.tsx
│   ├── CartContextDefinition.ts
│   ├── useAuth.ts
│   └── useCart.ts
│
├── data/
│   └── nfts.ts
│
├── mocks/
│   ├── browser.ts
│   ├── handlers.ts
│   └── socket.ts
│
├── pages/
│   ├── Cart.tsx
│   ├── Checkout.tsx
│   ├── Login.tsx
│   ├── NftDetails.tsx
│   ├── Orders.tsx
│   ├── Profile.tsx
│   └── Register.tsx
│
├── services/
│   ├── api.ts
│   ├── nfts.ts
│   ├── realtime.ts
│   └── socket.ts
│
├── App.tsx
├── index.css
├── main.tsx
└── router.tsx

e2e/
└── e2e/
    ├── auth.spec.ts
    ├── checkout.spec.ts
    ├── realtime-orders.spec.ts
    └── responsive.spec.ts
```

## 4. Camadas e responsabilidades

### Components

Contém componentes reutilizáveis da interface, como cabeçalho, rodapé, listagem de produtos e integração com atualizações em tempo real.

O componente `SocketConnection` centraliza a inscrição nos eventos recebidos pelo Socket.IO e atualiza o cache do TanStack Query.

### Pages

Contém as páginas e os fluxos principais da aplicação:

- Marketplace.
- Detalhes do NFT.
- Login e cadastro.
- Carrinho.
- Checkout.
- Perfil.
- Histórico de pedidos.

### Context

Centraliza os estados compartilhados da aplicação.

**AuthContext**

- Gerencia o usuário autenticado.
- Controla login, cadastro e logout.
- Mantém o token de autenticação no LocalStorage.
- Recupera a sessão por meio da API simulada.
- Disponibiliza os dados e operações de autenticação pelo hook `useAuth`.

**CartContext**

- Gerencia os itens adicionados ao carrinho.
- Permite adicionar, remover e atualizar quantidades.
- Gerencia cupons de desconto.
- Persiste os dados localmente.
- Mantém os dados do carrinho separados por usuário e para visitantes.
- Disponibiliza as operações pelo hook `useCart`.

### Services

Responsável pela comunicação com os serviços HTTP e de tempo real.

- `api.ts`: configuração da instância Axios.
- `socket.ts`: configuração da conexão Socket.IO Client.
- `realtime.ts`: estruturas e validação de eventos recebidos em tempo real.

### Data

Contém os dados iniciais e os tipos relacionados aos NFTs utilizados pela aplicação.

### Mocks

Contém a infraestrutura de simulação dos serviços.

- `browser.ts`: inicialização do MSW no navegador.
- `handlers.ts`: interceptação de requisições REST e respostas simuladas.
- `socket.ts`: simulação das conexões e emissão de eventos em tempo real.

## 5. Gerenciamento de dados e estado

A aplicação utiliza mecanismos diferentes conforme a responsabilidade de cada informação.

| Recurso | Utilização |
|---|---|
| React Context | Estado global de autenticação e carrinho |
| TanStack Query | Requisições, cache e estados de carregamento e erro |
| TanStack Router | Navegação, rotas e parâmetros |
| Axios | Comunicação HTTP |
| LocalStorage | Persistência de sessão, carrinho, cupons e tentativas de checkout |
| MSW | Simulação dos serviços de backend |

A busca, os filtros, a ordenação e a paginação do marketplace utilizam parâmetros da URL, permitindo compartilhar e recuperar o estado da navegação.

## 6. Fluxo de autenticação

1. O usuário acessa a tela de login ou cadastro.
2. A aplicação envia os dados para o serviço de autenticação.
3. O MSW intercepta a requisição e executa a validação simulada.
4. Em caso de sucesso, o token e os dados do usuário são armazenados no estado da aplicação.
5. O token é persistido no LocalStorage.
6. O contexto de autenticação disponibiliza a sessão para os componentes.
7. Nas próximas inicializações, a aplicação consulta o endpoint de recuperação de sessão.
8. As rotas protegidas verificam a autenticação antes de permitir o acesso.

O logout remove os dados locais da sessão.

## 7. Carrinho e cupons

O carrinho é gerenciado pelo `CartContext` e possui persistência local.

Os dados são separados de acordo com o usuário autenticado. Visitantes também podem manter itens no carrinho por meio de uma chave própria no LocalStorage.

As operações disponíveis incluem:

- Adicionar NFTs.
- Remover NFTs.
- Atualizar quantidades.
- Limpar o carrinho.
- Aplicar e remover cupons de desconto.

A validação de cupons é realizada por meio de um endpoint REST simulado.

O cupom de demonstração `GREENMINT10` concede 10% de desconto. O carrinho calcula subtotal, desconto e total, e os valores são utilizados na etapa de checkout.

## 8. Fluxo de compra

O processo de compra utiliza operações simuladas de criação de pedido e pagamento.

1. O usuário adiciona NFTs ao carrinho.
2. O carrinho mantém os itens e o cupom aplicado.
3. O usuário acessa o checkout.
4. A aplicação calcula os valores do pedido.
5. Uma chave de idempotência é criada ou recuperada para a tentativa de compra.
6. A aplicação envia a solicitação de criação do pedido.
7. O serviço simulado revalida os preços contra o catálogo atual. Se algum preço mudou, responde `409 PRICE_CHANGED`: o cliente atualiza o catálogo, o carrinho exibe a alteração e a compra só prossegue depois que o usuário revisa o pedido.
8. O serviço simulado registra ou recupera o pedido correspondente.
9. A aplicação solicita o processamento do pagamento.
10. Se o pagamento for aprovado (`200`), o pedido passa a `confirmed`, a compra é confirmada e o carrinho é limpo.
11. Se o pagamento for recusado (`402`), o pedido passa a `rejected` (estado terminal), os itens são preservados e a chave de idempotência é descartada, de modo que a nova tentativa cria outro pedido.
12. Se o pagamento ficar pendente (`202`), o pedido permanece `pending` e a chave é mantida: reenviar a compra recupera o mesmo pedido.

### Idempotência

A aplicação utiliza uma chave de idempotência associada ao usuário e à composição do carrinho.

A chave é persistida localmente e reutilizada em novas tentativas da mesma compra, evitando a criação de pedidos duplicados quando a solicitação é repetida com a mesma chave.

No serviço simulado, cada pedido guarda uma impressão digital do conteúdo enviado (itens, quantidades, preços e total):

- mesma chave e mesmo conteúdo: retorna o pedido já criado (`200`);
- mesma chave e conteúdo diferente: retorna `409 IDEMPOTENCY_CONFLICT`.

## 9. Comunicação em tempo real

A aplicação utiliza Socket.IO Client para receber atualizações simuladas pelo MSW.

Os eventos implementados são:

- `nft.updated`: comunica alterações nos dados de NFTs.
- `order.updated`: comunica alterações nos pedidos.

O componente `SocketConnection` recebe os eventos e atualiza o cache do TanStack Query.

O tratamento considera identificadores de eventos, recursos e versões para evitar o processamento de eventos duplicados ou desatualizados.

A identificação da sessão permite associar conexões ao usuário autenticado e restringir eventos de pedidos ao usuário correspondente.

A conexão também contempla reconexão automática e atualização dos dados após o restabelecimento da conexão.

### Preço alterado durante a compra

O `nft.updated` atualiza o cache `['nfts']` (catálogo) e `['nfts', id]` (detalhe). O `CartProvider` observa a mesma chave `['nfts']` e sincroniza o preço dos itens do carrinho com o catálogo. Quando há diferença:

1. o preço do item é atualizado e o resumo é recalculado;
2. a alteração é registrada (`priceChanges`) e o componente `PriceChangeNotice` a exibe no carrinho e no checkout, com `role="alert"`;
3. o botão "Confirmar compra" fica desabilitado até o usuário reconhecer a alteração;
4. mesmo que o cliente envie um preço antigo, o servidor simulado recusa a criação do pedido com `409 PRICE_CHANGED`.

A mesma sincronização acontece após reconexão (a invalidação de `['nfts']` busca os dados atuais na API REST) e ao abrir o carrinho com preços salvos antes de uma alteração.

## 10. Simulação de serviços

O Mock Service Worker intercepta as requisições HTTP e fornece respostas para os fluxos da aplicação.

Os handlers simulam operações como:

- Consulta e atualização de NFTs.
- Cadastro, login e recuperação de sessão.
- Consulta e criação de pedidos.
- Processamento de pagamentos.
- Validação de cupons.

Os dados simulados utilizam o LocalStorage para manter informações entre atualizações da página.

A comunicação em tempo real é simulada por meio da integração entre MSW, `@mswjs/socket.io-binding` e Socket.IO Client.

Essa abordagem permite testar a integração entre as camadas da aplicação sem depender de um backend externo.

## 11. Testes e qualidade

O projeto utiliza Playwright para testes automatizados End-to-End.

Os cenários automatizados cobrem:

- Fluxos de autenticação.
- Checkout com pagamento aprovado e recusado.
- Alteração de preço via Socket.IO durante o checkout, com bloqueio da compra até a revisão.
- Idempotência de pedidos (recuperação do mesmo pedido e `409` com conteúdo diferente) e rejeição de preço desatualizado.
- Cadastro sem senha em texto puro.
- Comportamento responsivo em diferentes resoluções.

As resoluções verificadas incluem 375 px, 768 px, 1024 px e 1440 px.

O Oxlint é utilizado para análise estática do código, enquanto o processo de build executa a verificação de tipos do TypeScript antes de gerar os arquivos de produção.

Comandos disponíveis:

```bash
npm run lint
npm run build
npm run test:e2e
```

## 12. Cache e sincronização (TanStack Query)

O `QueryClient` usa os valores padrão da biblioteca. Eles foram mantidos de propósito e estão registrados aqui para que o comportamento seja conhecido:

| Item | Valor | Observação |
|---|---|---|
| `staleTime` | 0 | Os dados são considerados antigos logo após a busca e são revalidados ao montar a tela. |
| `gcTime` | 5 min | Consultas sem uso são descartadas depois desse período. |
| `retry` (consultas) | 3, com espera crescente | O detalhe do NFT usa `retry: false` para exibir "NFT não encontrado" imediatamente. |
| `retry` (mutations) | 0 | O checkout nunca repete automaticamente: reenvios são manuais e protegidos pela chave de idempotência. |
| `refetchOnWindowFocus` / `refetchOnReconnect` | ativados | Ajudam a reconciliar o cache com a API. |

Chaves de consulta:

| Chave | Conteúdo |
|---|---|
| `['nfts']` | Lista de NFTs (catálogo e carrinho). |
| `['nfts', id]` | Detalhe de um NFT. |
| `['orders', userId]` | Pedidos do usuário autenticado. |

Atualização do cache por eventos:

- `nft.updated`: `setQueryData` em `['nfts']` e `['nfts', id]`.
- `order.updated`: `setQueryData` em `['orders', userId]`, apenas para o usuário dono do pedido.
- Conexão ou reconexão: `invalidateQueries` em `['nfts']` e `['orders', userId]`, que busca novamente os dados na API REST. A REST é a fonte de verdade, e os eventos apenas antecipam a atualização.

Eventos duplicados ou antigos são descartados por `eventId` e pela versão mais recente conhecida do recurso (`createRealtimeEventGuard`). O controle fica em memória e é reiniciado ao recarregar a página, quando os dados voltam da REST.

## 13. Contratos REST e eventos

Todas as rotas ficam sob `/api` e são interceptadas pelo MSW. Rotas privadas usam `Authorization: Bearer <token>`.

| Método e rota | Sucesso | Erros |
|---|---|---|
| `POST /auth/register` `{ name, email, password }` | `201 { user, token }` | `400` campos faltando, `409` e-mail já cadastrado |
| `POST /auth/login` `{ email, password }` | `200 { user, token }` | `401` credenciais inválidas |
| `GET /auth/me` | `200 { id, name, email }` | `401` sessão inválida, `404` usuário inexistente |
| `GET /nfts` | `200 NFT[]` | — |
| `GET /nfts/:id` | `200 NFT` | `404` NFT inexistente |
| `PATCH /nfts/:id` `{ name?, price?, category?, network? }` | `200 NFT` e evento `nft.updated` | `400` validação, `404` |
| `POST /coupons/validate` `{ code }` | `200 { code, discountPercentage, message }` | `400` cupom inválido ou expirado |
| `GET /orders` | `200 Order[]` do usuário | `401` |
| `POST /orders` com `Idempotency-Key` `{ items, subtotal, discount, coupon, total }` | `201` pedido criado ou `200` pedido recuperado, e evento `order.updated` | `400`, `401`, `409 PRICE_CHANGED`, `409 IDEMPOTENCY_CONFLICT` |
| `POST /payments` `{ orderId, total, paymentMethod }` | `200 approved`, `202 pending` | `402 rejected`, `400`, `401`, `404`, `409` pedido que não aguarda pagamento |

Evento Socket.IO (`nft.updated` e `order.updated`):

```ts
interface RealtimeEvent<T> {
  eventId: string      // identidade estável do evento
  resource: 'nft' | 'order'
  resourceId: string   // recurso afetado
  version: number      // cresce a cada alteração do recurso
  userId?: string      // presente nos eventos de pedido
  data: T
}
```

Transporte simulado: o MSW intercepta a conexão WebSocket (`ws.link`) e `@mswjs/socket.io-binding` implementa o protocolo Socket.IO no navegador. O `socket.io-client` real conecta e recebe os eventos emitidos pelos handlers REST (`emitRealtime`). Limitações: o servidor simulado existe apenas na aba aberta (não há comunicação entre abas) e as conexões vivem enquanto o Service Worker estiver ativo.

## 14. Sessão e isolamento de dados

- O login e o cadastro retornam um token, guardado em `localStorage` (`greenmint-token`).
- Ao iniciar, o `AuthProvider` consulta `GET /auth/me`. Se a resposta for `401`, o token é descartado.
- O carrinho e o cupom ficam em chaves por usuário (`greenmint-cart-<id>`) e por visitante (`greenmint-cart-guest`).
- No login, logout e troca de usuário, o cache `['orders']` é removido para que dados privados não fiquem acessíveis a outra sessão.
- O socket envia `client:identify` com o token, e o servidor simulado só entrega eventos de pedido ao usuário dono.
- Os pedidos são filtrados por usuário no `GET /orders`.
- As senhas são guardadas como hash SHA-256 (com prefixo fixo) no mock. Usuários antigos com senha em texto puro são migrados no primeiro login.

## 15. Limitações e escopo da simulação

O GreenMint Marketplace é uma aplicação Front-end demonstrativa.

- Não existe integração com uma blockchain real.
- Os pagamentos em ETH são simulados.
- Os serviços REST e eventos Socket.IO são simulados pelo MSW.
- Os dados persistidos dependem do armazenamento local do navegador.
- A autenticação é demonstrativa e não substitui um sistema real de autenticação em produção: o hash usa SHA-256 simples (em produção seria bcrypt, scrypt ou argon2 no servidor, com salt por usuário), as sessões não expiram e o logout não invalida o token no servidor simulado.
- Os valores em ETH trafegam como `number` e os totais são calculados no cliente. Uma versão completa usaria strings decimais e um endpoint de cotação com taxa de rede.
- A filtragem, a ordenação e a paginação do catálogo acontecem no cliente, sobre a lista completa retornada por `GET /nfts`. O estado fica na URL.
- Favoritos, carteiras, edição de perfil, avatar e senha, atualização otimista, expiração de sessão e cenários configuráveis de latência e falha não foram implementados.
- A revalidação antes da compra considera apenas o preço (e a existência do NFT). Não há controle de disponibilidade por edição.
- Um pedido pendente é recuperado reenviando a compra, que reaproveita a chave de idempotência. Ainda não há tela dedicada de acompanhamento de pedido pendente após recarregar a página.

A arquitetura foi organizada para demonstrar separação de responsabilidades, gerenciamento de estado, comunicação HTTP, atualização em tempo real e testes automatizados.