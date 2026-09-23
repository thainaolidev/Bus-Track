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
