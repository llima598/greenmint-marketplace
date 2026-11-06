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
7. O serviço simulado registra ou recupera o pedido correspondente.
8. A aplicação solicita o processamento do pagamento.
9. Se o pagamento for aprovado, a compra é confirmada e o carrinho é limpo.
10. Se o pagamento não for aprovado, o fluxo apresenta o retorno correspondente e preserva os itens para uma nova tentativa.

### Idempotência

A aplicação utiliza uma chave de idempotência associada ao usuário e à composição do carrinho.

A chave é persistida localmente e reutilizada em novas tentativas da mesma compra, evitando a criação de pedidos duplicados quando a solicitação é repetida com a mesma chave.

## 9. Comunicação em tempo real

A aplicação utiliza Socket.IO Client para receber atualizações simuladas pelo MSW.

Os eventos implementados são:

- `nft.updated`: comunica alterações nos dados de NFTs.
- `order.updated`: comunica alterações nos pedidos.

O componente `SocketConnection` recebe os eventos e atualiza o cache do TanStack Query.

O tratamento considera identificadores de eventos, recursos e versões para evitar o processamento de eventos duplicados ou desatualizados.

A identificação da sessão permite associar conexões ao usuário autenticado e restringir eventos de pedidos ao usuário correspondente.

A conexão também contempla reconexão automática e atualização dos dados após o restabelecimento da conexão.

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
- Comportamento responsivo em diferentes resoluções.

As resoluções verificadas incluem 375 px, 768 px, 1024 px e 1440 px.

O Oxlint é utilizado para análise estática do código, enquanto o processo de build executa a verificação de tipos do TypeScript antes de gerar os arquivos de produção.

Comandos disponíveis:

```bash
npm run lint
npm run build
npm run test:e2e
```

## 12. Limitações e escopo da simulação

O GreenMint Marketplace é uma aplicação Front-end demonstrativa.

- Não existe integração com uma blockchain real.
- Os pagamentos em ETH são simulados.
- Os serviços REST e eventos Socket.IO são simulados pelo MSW.
- Os dados persistidos dependem do armazenamento local do navegador.
- A autenticação é demonstrativa e não substitui um sistema real de autenticação em produção.

A arquitetura foi organizada para demonstrar separação de responsabilidades, gerenciamento de estado, comunicação HTTP, atualização em tempo real e testes automatizados.