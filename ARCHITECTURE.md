# Arquitetura — GreenMint Marketplace

## 1. Visão geral

O GreenMint Marketplace é uma aplicação Front-end desenvolvida com React e TypeScript. Sua arquitetura foi organizada para separar responsabilidades e facilitar a manutenção, evolução e testes das funcionalidades.

A aplicação utiliza serviços simulados com MSW para representar a comunicação com uma API REST e Socket.IO durante o desenvolvimento.

## 2. Organização de pastas

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
├── main.tsx
├── router.tsx
└── index.css

e2e/
└── e2e/
    ├── auth.spec.ts
    └── checkout.spec.ts
```

## 3. Camadas e responsabilidades

### Components

Contém os componentes reutilizáveis da interface, como cabeçalho, rodapé, listagem de produtos e componentes de integração com atualizações em tempo real.

### Pages

Contém as páginas principais da aplicação:

- Marketplace.
- Detalhes do NFT.
- Login e cadastro.
- Carrinho.
- Checkout.
- Perfil.
- Histórico de pedidos.

### Context

Centraliza estados compartilhados entre diferentes partes da aplicação.

**AuthContext**
- Gerencia o usuário autenticado.
- Controla login, cadastro e logout.
- Mantém o token de autenticação no armazenamento local.
- Disponibiliza o estado de autenticação por meio do hook `useAuth`.

**CartContext**
- Gerencia os NFTs adicionados ao carrinho.
- Permite adicionar, remover e limpar itens.
- Persiste os itens no armazenamento local.
- Separa os dados do carrinho por usuário.
- Disponibiliza as operações por meio do hook `useCart`.

### Services

Responsável pela comunicação e integração com serviços externos ou simulados.

- `api.ts`: configuração e comunicação HTTP com Axios.
- `socket.ts`: configuração da conexão Socket.IO.
- `realtime.ts`: tratamento e controle dos eventos recebidos em tempo real.

### Data

Contém os dados e tipos relacionados aos NFTs utilizados pela aplicação.

### Mocks

Contém a infraestrutura de simulação dos serviços.

- `browser.ts`: inicialização do MSW no navegador.
- `handlers.ts`: interceptação e respostas das operações REST.
- `socket.ts`: simulação dos eventos de comunicação em tempo real.

## 4. Gerenciamento de dados e estado

A aplicação utiliza diferentes mecanismos conforme a responsabilidade de cada informação.

| Tecnologia | Responsabilidade |
|---|---|
| React Context | Estado global de autenticação e carrinho |
| TanStack Query | Requisições, cache e gerenciamento de estados de carregamento e erro |
| TanStack Router | Navegação e parâmetros de rotas |
| LocalStorage | Persistência local de sessão, carrinho e tentativa de checkout |
| Axios | Comunicação HTTP |

Os filtros, a busca, a ordenação e a paginação do marketplace utilizam parâmetros da URL, permitindo manter o estado da navegação.

## 5. Fluxo de autenticação

1. O usuário acessa a tela de login ou cadastro.
2. A aplicação envia os dados para o serviço de autenticação.
3. O serviço simulado valida as credenciais.
4. Em caso de sucesso, o token e os dados do usuário são armazenados.
5. O contexto de autenticação atualiza o estado da aplicação.
6. As rotas protegidas verificam a existência de uma sessão válida.

O logout limpa os dados locais de autenticação.

## 6. Fluxo de compra

O processo de compra foi estruturado para tratar falhas e permitir novas tentativas.

1. O usuário seleciona um NFT.
2. O produto é adicionado ao carrinho.
3. O carrinho mantém os itens persistidos localmente.
4. O usuário acessa o checkout.
5. A aplicação cria ou recupera uma chave de idempotência para a tentativa de compra.
6. A aplicação envia a solicitação de criação do pedido.
7. O serviço de pagamento simulado processa a transação.
8. Se aprovado, o pedido é confirmado e o carrinho é limpo.
9. Se recusado ou pendente, o usuário recebe o retorno correspondente e os itens permanecem no carrinho.

### Idempotência

A aplicação utiliza uma chave de idempotência associada ao usuário e à composição do carrinho.

Em uma nova tentativa da mesma compra, a chave é reutilizada. O serviço simulado verifica se já existe um pedido correspondente, evitando a criação de pedidos duplicados nesse cenário.

## 7. Comunicação em tempo real

A aplicação utiliza Socket.IO Client para receber atualizações em tempo real.

Os eventos implementados incluem:

- `nft.updated`: atualização relacionada a NFTs.
- `order.updated`: atualização relacionada a pedidos.

O tratamento dos eventos considera identificadores e versões para reduzir o processamento duplicado ou desatualizado.

A conexão também contempla mecanismos de reconexão.

## 8. Simulação de serviços

O MSW intercepta as requisições HTTP durante o desenvolvimento e fornece