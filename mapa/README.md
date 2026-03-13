# Mapa do Brasil com D3.js

Projeto em HTML + JavaScript que utiliza D3.js para visualizar a atuação da Suzano no território brasileiro, combinando:

- mapa coroplético por estado (com destaque de atuação);
- painel contextual com resumo por estado;
- marcadores de UPS e Bases no estado selecionado;
- navegação espacial com zoom e panning.

## Capturas de tela

### Visão inicial (antes de interação)

![Tela inicial do mapa de atuação da Suzano](../assets/mapa-sem-foco.png)

Nesta visão, o usuário tem o panorama nacional da atuação, sem estado selecionado.

### Visão com estado selecionado (após interação)

![Tela com estado selecionado para análise](../assets/mapa-foco.png)

Nesta visão, o mapa aplica foco no estado escolhido e exibe os detalhes de UPS e Bases.

## Por que esta visualização é boa para entender o problema

Esta visualização é adequada porque o problema é geográfico e hierárquico ao mesmo tempo:

1. **Contexto macro + detalhe local**
   - O mapa nacional permite identificar rapidamente **onde existe atuação**.
   - O clique no estado abre o nível de detalhe (UPS/Bases), sem perder o contexto do Brasil.

2. **Redução de ambiguidade espacial**
   - Marcar apenas tabelas de UPS não mostra distribuição real no território.
   - Com projeção geográfica, cada ponto aparece em posição coerente com latitude/longitude.

3. **Priorização visual clara**
   - Estados com atuação recebem cor distinta.
   - Estado selecionado recebe destaque adicional.
   - Marcadores de UPS e Base usam formas diferentes (círculo/losango), facilitando leitura rápida.

4. **Navegação orientada à investigação**
   - Zoom automático no estado acelera a análise de regiões densas.
   - Panning + zoom manual permite explorar clusters de pontos com precisão.
   - Tamanho visual fixo dos marcadores evita distorção de percepção durante zoom.

5. **Integração entre visão quantitativa e espacial**
   - O painel resume número de localizações, quantidade de UPS, Bases e área total.
   - Isso conecta a pergunta “onde está?” com “quanto existe?” no mesmo fluxo.

## Como executar com npx serve

Pré-requisito: Node.js instalado (inclui `npx`).

No diretório do projeto:

```bash
cd mapa
npx serve .
```

Depois abra no navegador o endereço exibido no terminal (geralmente `http://localhost:3000`).

### Porta específica (opcional)

```bash
cd mapa
npx serve -l 5123 .
```

E abra `http://localhost:5123`.

## Funcionamento detalhado do projeto

### 1) Carregamento de dados

- O GeoJSON dos estados do Brasil é carregado de uma URL pública.
- O arquivo local `fazendasUPS.csv` é lido com `d3.csv`.
- Coordenadas são normalizadas para número (`pt-BR`, vírgula decimal).

### 2) Enriquecimento geográfico

- Cada linha do CSV é convertida em ponto `[lon, lat]`.
- O estado da linha é inferido com `d3.geoContains` (point-in-polygon).
- Com isso, o sistema identifica automaticamente os estados com atuação.

### 3) Renderização do mapa

- A projeção (`geoMercator`) é ajustada ao tamanho do container.
- Cada estado é desenhado como `path` SVG.
- Cores são aplicadas por regra:
  - neutro: sem atuação no CSV;
  - ativo: estado com atuação;
  - selecionado: estado clicado.

### 4) Interação por estado

- Ao clicar em estado com atuação:
  - o estado vira selecionado;
  - o painel lateral é atualizado;
  - o mapa aplica zoom para enquadrar o estado.

### 5) Painel de detalhes

- Mostra nome do estado selecionado.
- Exibe resumo consolidado:
  - total de localizações;
  - número de UPS únicas;
  - número de Bases únicas;
  - soma de área em hectares.
- Lista UPS e Bases em blocos separados.

### 6) Marcadores UPS e Bases

- UPS: círculo em cada localização do estado selecionado.
- Base: losango no centro médio das localizações da mesma base.
- Tooltips mostram identificadores no hover.

### 7) Zoom e panning

- O mapa usa `d3.zoom` com limites configurados (`MIN_ZOOM` e `MAX_ZOOM`).
- É possível arrastar para pan e usar scroll para zoom.
- Os marcadores têm escala visual compensada (`1/k`), então mantêm tamanho aparente estável durante a navegação.

## Estrutura do projeto

- `index.html`: estrutura da interface, painel de detalhes, legenda e estilos.
- `script.js`: pipeline de dados, desenho do mapa, interações, zoom/pan e tooltips.
- `fazendasUPS.csv`: dados de localização e atributos operacionais.

## Limitações atuais

- Dependência de GeoJSON remoto (necessita internet).
- Ausência de filtros (por UPS, Base ou intervalo de área).
- Não há persistência de estado de navegação entre recarregamentos.

## Próximos passos sugeridos

- adicionar filtros por UPS/Base/núcleo;
- adicionar busca por estado e por código UPS;
- criar versão offline com GeoJSON local;
- incluir exportação de recorte por estado selecionado.
