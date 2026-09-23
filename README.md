# Bus Track

Aplicação web responsiva e instalável para explorar linhas, paragens e chegadas fictícias em Santarém. Toda a interface está em português de Portugal. Os dados de transporte são simulados; não existe ligação a GPS ou operadores reais.

## Executar localmente

Requer Node.js 20.19+ ou 22.12+.

```bash
npm install
npm run dev
```

O service worker só é registado em produção; no servidor de desenvolvimento as alterações aparecem sem cache PWA.

## Compilar e pré-visualizar

```bash
npm run build
npm run preview
```

## Publicar na Vercel

Importa o repositório na Vercel. Usa `npm run build` como comando de compilação e `dist` como pasta de saída. O `vercel.json` encaminha os caminhos da aplicação para o shell React. A instalação PWA em produção requer HTTPS, fornecido pela Vercel.

## Instalação

Em Chrome/Edge, usa a opção «Instalar Bus Track» quando apresentada ou a opção de instalação do menu do navegador. No iPhone/iPad, abre no Safari, toca em Partilhar e escolhe «Adicionar ao ecrã principal»; o prompt automático `beforeinstallprompt` não é suportado em todos os navegadores.

## Offline e dados

O app shell fica disponível offline depois da primeira visita online bem-sucedida. Em falta de ligação, a interface avisa que os dados de chegadas não estão a ser atualizados. Favoritos, tema, avatar e cor ficam no `localStorage`; a limpeza das caches nunca apaga esses dados. O service worker não guarda respostas de transporte como dados permanentes.

## Publicar uma nova versão

1. Atualiza `version` em `package.json` (versão da aplicação).
2. Atualiza `CACHE_VERSION` em `vite.config.ts` quando fizeres uma alteração incompatível na estratégia do cache. Cada build também recebe um identificador calculado a partir dos assets, criando uma cache isolada automaticamente.
3. Executa `npm install` e `npm run build`.
4. Faz commit e push para o repositório ligado à Vercel.
5. Aguarda o deploy e testa a atualização numa instalação existente: deve surgir «Nova versão disponível». «Atualizar agora» ativa o novo service worker e recarrega a aplicação, mantendo as preferências locais.

Na instalação de uma nova versão, o service worker usa uma cache nova e remove caches `bus-track-*` antigas durante a ativação. Navegações são network-first com fallback para o HTML local; os assets do app shell são cache-first; outros recursos ficam sem cache. A nova worker aguarda a escolha do utilizador, evitando trocar uma página aberta a meio de uma tarefa.

## Mapa e dados de mobilidade

O mapa usa Leaflet com tiles da OpenStreetMap e atribuição visível aos contribuidores. Requer ligação à Internet para apresentar a cartografia base. Linhas, veículos em movimento, horários/ETAs e paragens específicas desta demonstração são simulados; não são uma reprodução de itinerários oficiais nem GPS em tempo real.

As geometrias fixas das três linhas de demonstração foram pré-calculadas uma vez sobre a rede viária OpenStreetMap com OSRM; não há chamadas ao serviço de routing durante a utilização. As paragens são pontos de referência reais e os seus marcadores são ajustados aos acessos rodoviários. As coordenadas do Politécnico e das escolas superiores vêm da informação GPS publicada pelo Politécnico de Santarém. A rede Scalabus existe e é publicada pela Rodoviária do Tejo, mas a informação consultada não fornece traçados atuais completos suficientes para afirmar que estas três linhas fictícias correspondem a percursos oficiais.

Fontes: [OpenStreetMap e atribuição](https://www.openstreetmap.org/copyright), [política dos tiles OSM](https://operations.osmfoundation.org/policies/tiles/), [serviços urbanos Rodoviária do Tejo](https://www.rodotejo.pt/urbanas/), [folheto Scalabus](https://www.rodotejo.pt/wp-content/uploads/SCALABUS.pdf), [coordenadas oficiais do Politécnico de Santarém](https://www.ipsantarem.pt/coordenadas-gps/).

## Arquitetura da aplicação

O frontend consome contextos e serviços, sem importar o conjunto de dados mock diretamente:

```text
React UI → TransportContext / PreferencesContext → services → mock local ou API configurada
```

- `src/types/transport.ts` define contratos para linhas, paragens, veículos/posições, chegadas, avisos e perfil.
- `src/data/routes.ts` contém a geometria estática das linhas fictícias. A UI recebe linhas e paragens por `TransportContext`.
- `src/services/TransportService.ts` implementa a interface de dados mock e os pedidos REST (`GET /routes`, `/stops`, `/vehicles`, `/arrivals`, `/service-alerts`). Com `VITE_API_URL`, selecciona a implementação REST; se falhar, apresenta os dados mock com uma mensagem explícita.
- `src/services/VehicleTrackingService.ts` centraliza a simulação de posições e oferece uma implementação de polling REST substituível por SSE/WebSocket. O marcador do mapa apenas representa a posição recebida.
- `src/services/PreferenceService.ts` abstrai a persistência. `localPreferenceService` usa `localStorage` como cache/preferências locais; `backendPreferenceService` documenta o contrato futuro `GET/PUT/DELETE /users/me/preferences`.
- `src/services/AuthService.ts` define a interface de sessão. A implementação activa é `demoAuthService`: não aceita credenciais e não simula uma conta real. `backendAuthService` é apenas um adaptador preparado para endpoints de sessão com cookie seguro.
- `src/services/NotificationService.ts` mantém o contrato de notificações. A implementação actual não pede permissões nem envia push.

As preferências do Perfil são carregadas/guardadas por `PreferenceService`; os favoritos, tema e apresentação continuam sincronizados pelo contexto global. A identidade de demonstração não recolhe nem transmite localização. O service worker mantém a estratégia PWA já existente; os pedidos da API não são tratados como prova de dados em tempo real.

### Histórico, comprovativos e ocorrências (demonstração)

- `TripHistoryService` fornece um registo de viagem de exemplo associado a uma ocorrência simulada. O comprovativo é uma projecção só de leitura e pode ser impresso ou guardado como PDF pelo diálogo do navegador. Inclui identificador de demonstração e aviso explícito de que não é documento oficial, validado nem comprovativo real.
- `IncidentService` separa o contrato de operação (`OperationalIncident`, com veículo/coordenadas/notas internas) da projecção de passageiro (`PassengerIncident`, sem esses campos). Os dados operacionais simulados ficam em memória no cliente, não são enviados à Rodoviária nem persistidos no `localStorage`.
- O portal de motorista só permite escolher linha/tipo predefinido e confirmar. A central de demonstração pode rever os detalhes internos, alterar estado/impacto/previsão e fechar ocorrências. Os dois portais estão acessíveis a partir de Definições e não aparecem na navegação pública; ambos avisam que não existe autenticação e que não se devem usar em ocorrências reais.
- Durante avarias ou acidentes reportados/em análise/em curso, `passengerIncidentService` remove o veículo afectado da projecção que alimenta o mapa e o aviso público não inclui coordenadas, identificador do veículo ou instruções até ao local. Isto é uma separação de dados no mock, não uma fronteira de segurança real: só um backend com autenticação, autorização e políticas de base de dados pode proteger a informação em produção.
- Os serviços de notificação não enviam push. As notificações apresentadas no protótipo são avisos locais derivados da ocorrência simulada e das linhas favoritas.

O `database/schema.sql` inclui tabelas propostas para incidentes internos e histórico pessoal, além de vistas públicas sem coordenadas internas. É apenas um artefacto de desenho; ainda são necessárias permissões/RLS, auditoria, retenção e validação do operador antes de qualquer utilização real. O comprovativo nunca deve ser tratado como prova oficial enquanto os registos forem simulados.

### Bilhetes e tarifas (demonstração)

`src/services/TicketingService.ts` separa catálogo e carteira por uma interface substituível. Actualmente `mockTicketingService` apresenta preços puramente fictícios (€1,20, €4,00, €30,00 e €2,50), sem fonte no tarifário do operador. Não representam preços reais ou confirmados, descontos, zonas, passes ou validade contratual. A área `/bilhetes` permite escolher linha/origem/destino, comparar produtos, indicar data/hora de início e experimentar o checkout. A confirmação só cria um registo `paymentStatus: simulated` em `localStorage`; não há recolha de dados bancários, transacção ou emissão de título válido.

O padrão gráfico do bilhete digital é determinístico e meramente visual: não é um QR de validação. A carteira local separa bilhetes activos, futuros e expirados com base no período de demonstração. Para produção, é necessário acordo e documentação do sistema de bilhética do operador, integração de tarifas/autorização, fornecedor de pagamentos compatível, processamento no backend, validação/assinatura de bilhetes, regras de cancelamento/reembolso e políticas de segurança. Nenhum bilhete deste protótipo deve ser apresentado como válido para viajar.

`VITE_API_URL` é apenas um endereço público de API. Não coloques passwords de base de dados, chaves privadas ou segredos em variáveis `VITE_*`. Copia `.env.example` para `.env.local` apenas para configurar um endereço público. O ficheiro `database/schema.sql` é uma proposta de esquema PostgreSQL para revisão: não é executado pela aplicação e não cria backend, autenticação, políticas de acesso ou dados reais. A API futura tem de autenticar e autorizar cada utilizador no servidor, validar entradas e isolar os dados por utilizador. Não guardar histórico de localização por padrão.

### Roadmap para produção

1. **Protótipo académico (agora):** dados e posições simulados, preferências locais, PWA e interface sem conta real.
2. **Backend:** escolher fornecedor/infraestrutura, implementar autenticação segura e API, aplicar migrações e políticas de acesso, e ligar os adaptadores de perfil e preferências após autenticação.
3. **Dados de transporte:** acordar acesso com o operador; importar e validar horários, paragens e percursos autorizados. A aplicação não é oficial nem está integrada com a Rodoviária do Tejo.
4. **Tempo real:** receber posições autorizadas com `vehicleId`, latitude, longitude e timestamp; substituir o serviço de tracking por polling/SSE/WebSocket e calcular ETAs com dados operacionais.
5. **Operação:** apenas depois, acrescentar área administrativa, gestão de avisos, monitorização e analytics com controlo de permissões.

### Contrato inicial da API

O adaptador espera `GET /routes`, `GET /routes/:id`, `GET /stops`, `GET /stops/:id`, `GET /vehicles`, `GET /arrivals` e `GET /service-alerts`. Como contrato futuro, o fluxo operacional pode usar `POST /operator/incidents` e `PATCH /operator/incidents/:id`; a vista pública deve usar uma projecção sanitizada, por exemplo `GET /public/incidents`. O histórico pessoal pode usar `GET /users/me/trips`, e o servidor deve gerar cada comprovativo a partir do registo imutável, nunca de horários enviados pelo cliente. Estes endpoints de incidentes/viagens são propostas, ainda não implementadas como API.

As sessões preparadas usam `/auth/sign-in`, `/auth/sign-up`, `/auth/sign-out` e `/users/me`; o backend deve emitir uma sessão segura e nunca devolver nem guardar passwords no frontend. Os contratos TypeScript em `src/types/transport.ts` e `src/types/incidents.ts` são a fronteira de dados para estas respostas. No modo actual sem backend, a demonstração continua a usar `mockTransportService`, `mockPassengerIncidentService`, `mockOperationsIncidentService`, `mockTripHistoryService` e `demoAuthService`.
