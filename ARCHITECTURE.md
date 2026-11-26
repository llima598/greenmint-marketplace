# Arquitetura — GreenMint Marketplace

## 1. Visão geral

O GreenMint Marketplace é uma aplicação Front-end desenvolvida com React 19, TypeScript e Vite.

A arquitetura separa responsabilidades entre interface, navegação, estado compartilhado, comunicação HTTP, cache e atualizações em tempo real. Os serviços de backend são simulados com Mock Service Worker (MSW), permitindo executar os fluxos da aplicação sem depender de uma API externa.

**Importante:** o projeto demonstra a integração entre essas camadas no Front-end. Ele não possui backend de produção, pagamentos reais ou integração com blockchain.

## 2. Tecnologias e responsabilidades

| Tecnologia | Responsabilidade |
|---|---|
| React 19 | Construção da interface e composição de componentes |
| TypeScript | Tipagem estática |
| Vite | Desenvolvimento e build |
| Tailwind CSS v4 | Estilização e responsividade |
| shadcn/ui e Base UI | Componentes de interface |
| TanStack Router | Navegação, rotas protegidas e parâmetros de busca |
| TanStack Query | Requisições, cache e sincronização de dados |
| React Context | Estado compartilhado de autenticação, carrinho e favoritos |
| Axios | Comunicação HTTP |
| MSW | Simulação dos serviços REST |
| Socket.IO Client | Recebimento de eventos em tempo real simulados |
| Playwright | Testes automatizados end-to-end |
| Oxlint | Análise estática do código |

## 3. Organização da aplicação

A pasta `src` organiza o código por responsabilidade:

- `components/`: componentes reutilizáveis, incluindo cabeçalho, proteção de rotas, aviso de alteração de preço e botão de favoritos.
- `context/`: provedores e hooks de autenticação, carrinho e favoritos.
- `data/`: dados iniciais e tipos dos NFTs.
- `mocks/`: handlers REST, inicialização do MSW e simulação de eventos Socket.IO.
- `pages/`: páginas do marketplace, detalhes do NFT, login, cadastro, carrinho, checkout, pedidos, favoritos e perfil.
- `services/`: configuração Axios, consultas de NFTs e integração com eventos em tempo real.
- `router.tsx` e `router/lazyPages.tsx`: definição das rotas e carregamento sob demanda das páginas.

A pasta `e2e/` contém os cenários automatizados do Playwright.

## 4. Rotas e navegação

O TanStack Router organiza as seguintes rotas:

| Rota | Acesso | Responsabilidade |
|---|---|---|
| `/` | Público | Catálogo e filtros do marketplace |
| `/nft/$nftId` | Público | Detalhes de um NFT |
| `/cart` | Público | Carrinho do visitante ou usuário |
| `/login` | Público | Autenticação |
| `/register` | Público | Cadastro |
| `/checkout` | Protegido | Finalização simulada da compra |
| `/orders` | Protegido | Histórico de pedidos da conta |
| `/favorites` | Protegido | NFTs salvos pelo usuário |
| `/profile` | Protegido | Dados da conta, senha, coleção e carteira |

As páginas são carregadas sob demanda por meio de `React.lazy` e `Suspense`. A proteção das rotas privadas é feita pelo componente `ProtectedRoute`.

Na página inicial, os parâmetros de busca, ordenação, preço, categoria, rede e página são validados e sincronizados com a URL.

## 5. Catálogo: busca, filtros e paginação

A consulta do catálogo é feita pelo endpoint simulado `GET /api/nfts`.

Quando recebe parâmetros de catálogo, o handler do MSW executa:

1. Validação dos parâmetros e dos filtros.
2. Busca por nome.
3. Filtro por preço mínimo e máximo.
4. Filtro por categoria e rede.
5. Ordenação.
6. Paginação.
7. Retorno dos itens da página, total de resultados, página atual, limite, total de páginas e contagens de categorias e redes.

Portanto, busca, filtros, ordenação e paginação são processados no endpoint simulado, e não apenas na interface.

Sem parâmetros de catálogo, o endpoint retorna a lista completa de NFTs. Essa resposta também é utilizada por fluxos que precisam consultar o catálogo completo, como a sincronização de preços do carrinho e a montagem da lista de favoritos.

O estado da navegação é refletido na URL para permitir recarregar ou compartilhar uma consulta.

## 6. Gerenciamento de estado e persistência

A aplicação utiliza ferramentas diferentes de acordo com a responsabilidade:

| Recurso | Solução |
|---|---|
| Autenticação | `AuthContext` |
| Carrinho e cupom | `CartContext` |
| Favoritos | Contexto e hook de favoritos |
| Dados remotos e cache | TanStack Query |
| Navegação e filtros | TanStack Router |
| Requisições HTTP | Axios |
| Persistência da demonstração | LocalStorage |
| Backend simulado | MSW |

O carrinho e o cupom são persistidos em chaves separadas por usuário. Visitantes também possuem uma chave própria. Os dados de sessão e os dados simulados de usuários, pedidos, NFTs, favoritos e carteiras são mantidos no armazenamento local utilizado pelos mocks.

Ao trocar de conta ou encerrar a sessão, o cache de dados privados é limpo para evitar que informações de uma conta permaneçam disponíveis na sessão seguinte.

## 7. Autenticação e conta

O fluxo de autenticação é executado pelos endpoints simulados do MSW:

1. O usuário realiza login ou cadastro.
2. O serviço simulado valida os dados e retorna usuário e token.
3. O token é armazenado em `localStorage`.
4. O `AuthContext` mantém os dados da sessão disponíveis para a aplicação.
5. Ao iniciar a aplicação, o contexto consulta `GET /api/auth/me` para recuperar e validar a sessão.
6. As rotas protegidas verificam se há usuário autenticado.

O contexto também oferece operações para logout, atualização de perfil e alteração de senha.

Na página de perfil, o usuário pode:
- Atualizar nome e e-mail.
- Alterar a senha informando a senha atual.
- Consultar a seção “Minha coleção”, formada pelos NFTs presentes em pedidos confirmados.
- Vincular ou desvincular um endereço público de carteira nas redes Ethereum, Polygon ou Solana.

A edição de perfil, senha e carteira utiliza endpoints REST simulados. A carteira é apenas um endereço público associado à conta; não há conexão com extensões ou assinatura de transações.

## 8. Favoritos

Os favoritos são associados ao usuário autenticado e gerenciados por um contexto próprio.

O componente `FavoriteButton` permite adicionar ou remover um NFT. A página `/favorites` consulta os IDs salvos e os combina com os dados do catálogo para exibir os NFTs correspondentes.

Os handlers simulam os endpoints:
- `GET /api/favorites`
- `POST /api/favorites`
- `DELETE /api/favorites/:nftId`

A rota de favoritos é protegida e os dados são separados por conta no armazenamento dos mocks.

## 9. Carrinho, cupons e checkout

O carrinho permite adicionar e remover NFTs, alterar quantidades e aplicar ou remover cupons.

O cupom de demonstração `GREENMINT10` concede 10% de desconto. A validação é realizada pelo endpoint simulado `POST /api/coupons/validate`.

O checkout simula os seguintes resultados:
- **Aprovado:** pedido confirmado e carrinho limpo.
- **Recusado:** pedido rejeitado e itens preservados para uma nova tentativa.
- **Pendente:** pedido permanece pendente e pode ser recuperado pela mesma chave de idempotência.

### Idempotência

A criação de pedidos utiliza uma chave de idempotência associada à tentativa de compra.

O serviço simulado também calcula uma impressão digital do conteúdo do pedido:
- Mesma chave e mesmo conteúdo: recupera o pedido existente.
- Mesma chave e conteúdo diferente: retorna conflito `409 IDEMPOTENCY_CONFLICT`.

### Revalidação de preço

Antes de criar o pedido, o serviço simulado compara os preços enviados com os valores atuais do catálogo. Se houver divergência, retorna `409 PRICE_CHANGED`. A interface atualiza os dados e solicita que o usuário revise a alteração antes de confirmar a compra.

## 10. Atualizações em tempo real

O projeto utiliza Socket.IO Client com transporte simulado pela integração entre MSW e `@mswjs/socket.io-binding`.

Os eventos principais são:
- `nft.updated`: alteração de dados de um NFT.
- `order.updated`: alteração de um pedido.

O componente de conexão recebe os eventos e atualiza o cache do TanStack Query. Os eventos possuem identificador e versão para ajudar a descartar mensagens duplicadas ou desatualizadas. Eventos de pedidos são associados ao usuário correspondente.

Quando um NFT tem o preço atualizado, o catálogo e o carrinho são sincronizados. O componente `PriceChangeNotice` informa a alteração, e o fluxo de compra exige a revisão do novo valor. A validação do endpoint de pedidos também impede a finalização com preço desatualizado.

A comunicação é simulada no navegador; não existe um servidor Socket.IO de produção.

## 11. Principais endpoints simulados

Todos os endpoints abaixo são interceptados pelo MSW. As rotas privadas exigem o token de demonstração no cabeçalho `Authorization`.

| Método e rota | Finalidade |
|---|---|
| `POST /api/auth/register` | Cadastro |
| `POST /api/auth/login` | Login |
| `GET /api/auth/me` | Recuperação e validação da sessão |
| `POST /api/auth/logout` | Encerramento da sessão simulada |
| `PATCH /api/auth/profile` | Atualização de nome e e-mail |
| `PATCH /api/auth/password` | Alteração de senha |
| `GET /api/nfts` | Catálogo, busca, filtros, ordenação e paginação |
| `GET /api/nfts/:id` | Detalhes de um NFT |
| `PATCH /api/nfts/:id` | Atualização simulada de NFT e emissão de evento |
| `GET /api/favorites` | Consulta dos favoritos da conta |
| `POST /api/favorites` | Adição de favorito |
| `DELETE /api/favorites/:nftId` | Remoção de favorito |
| `GET /api/wallet` | Consulta da carteira vinculada |
| `PUT /api/wallet` | Vinculação ou atualização de endereço público |
| `DELETE /api/wallet` | Desvinculação da carteira |
| `POST /api/coupons/validate` | Validação de cupom |
| `GET /api/orders` | Consulta dos pedidos da conta |
| `POST /api/orders` | Criação ou recuperação idempotente de pedido |
| `POST /api/payments` | Simulação do resultado do pagamento |

## 12. Testes e qualidade

O Playwright é utilizado nos testes end-to-end. Os cenários existentes cobrem fluxos como autenticação, checkout, atualização de pedidos em tempo real e comportamento responsivo, além de cenários de filtros, paginação, alteração de preço e idempotência.

O Oxlint realiza a análise estática do código. O comando de build executa a verificação de tipos do TypeScript antes de gerar os arquivos de produção.

Comandos disponíveis:

```bash
npm run lint
npm run build
npm run test:e2e
```

A quantidade de testes pode mudar conforme novos cenários forem adicionados.

## 13. Limitações e escopo da simulação

O GreenMint é um projeto de portfólio focado no desenvolvimento Front-end. As funcionalidades de backend são simuladas.

- Não existe backend de produção ou banco de dados remoto.
- Os dados dos mocks são mantidos no armazenamento local do navegador.
- A autenticação é demonstrativa. O hash de senha utiliza SHA-256 com prefixo fixo; isso não substitui algoritmos próprios para armazenamento seguro de senhas em um servidor real, como Argon2, bcrypt ou scrypt com salt individual.
- O token e os dados da sessão ficam no navegador; o fluxo não deve ser utilizado como modelo de segurança para produção.
- A carteira apenas associa um endereço público à conta. Não conecta MetaMask, Phantom ou outras carteiras, não solicita frases-semente ou chaves privadas e não interage com blockchain ou contratos inteligentes.
- O checkout e os pagamentos são simulados e não movimentam dinheiro ou criptoativos reais.
- Os eventos Socket.IO são simulados pelo MSW e não representam uma infraestrutura de tempo real em produção.
- Os valores em ETH são utilizados para fins de demonstração; não há cotação real nem liquidação on-chain.

A arquitetura foi organizada para demonstrar separação de responsabilidades, gerenciamento de estado, integração HTTP, cache, atualização em tempo real simulada, fluxos de compra e testes automatizados.

