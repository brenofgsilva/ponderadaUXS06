# Sistema de Otimização de Resposta a Incêndios Florestais - Suzano

## Sumário

- [Sistema de Otimização de Resposta a Incêndios Florestais - Suzano](#sistema-de-otimização-de-resposta-a-incêndios-florestais---suzano)
  - [Sumário](#sumário)
  - [Contexto do Projeto](#contexto-do-projeto)
  - [Organização das Duplas](#organização-das-duplas)
  - [Visualizações e Gráficos](#visualizações-e-gráficos)
    - [1. Mapa de Calor dos Focos de Incêndio](#1-mapa-de-calor-dos-focos-de-incêndio)
      - [Relevância](#relevância)
      - [Explicação Técnica](#explicação-técnica)
    - [2. Grafo Bipartido de Alocação de Recursos](#2-grafo-bipartido-de-alocação-de-recursos)
      - [Relevância](#relevância-1)
      - [Explicação Técnica](#explicação-técnica-1)
    - [3. Mapa de Infraestrutura Operacional](#3-mapa-de-infraestrutura-operacional)
      - [Relevância](#relevância-2)
      - [Explicação Técnica](#explicação-técnica-2)
    - [4. Diagrama Sankey de Distribuição de Recursos](#4-diagrama-sankey-de-distribuição-de-recursos)
      - [Relevância](#relevância-3)
      - [Explicação Técnica](#explicação-técnica-3)
  - [Como Executar](#como-executar)

## Contexto do Projeto

O projeto desenvolve um **sistema de apoio à decisão para otimização da resposta a incêndios florestais** na Suzano S.A., líder global na produção de celulose de eucalipto. A solução utiliza algoritmos de grafos e modelagem matemática para recomendar, em tempo real, qual base operacional acionar e quais recursos mobilizar (aeronaves, recursos terrestres e brigadistas) para cada ocorrência de incêndio.

O sistema foi concebido para atender duas personas principais:

- **Márcia Viana** (Operadora do Centro de Operações Integradas): precisa de recomendações objetivas e rápidas sob alta pressão para decidir qual base acionar e quais recursos enviar.
- **Gerson Neves** (Gestor Corporativo de Inteligência Patrimonial): demanda padronização, justificativas técnicas auditáveis e rastreabilidade das decisões para governança corporativa.

A solução combina eficiência operacional com compromissos de sustentabilidade ambiental (ODS da ONU), reduzindo o tempo de resposta, minimizando áreas queimadas e otimizando o uso de recursos críticos.

## Organização das Duplas

Cada dupla é responsável pelo desenvolvimento de uma visualização específica que compõe o sistema integrado de apoio à decisão:

| Dupla       | Integrantes                             | Visualização                | Responsabilidade                                     |
| ----------- | --------------------------------------- | --------------------------- | ---------------------------------------------------- |
| **Dupla 1** | Caroline Paz e Christian Santos         | Mapa de Calor dos Focos     | Análise espacial de risco e densidade de ocorrências |
| **Dupla 2** | Pedro Soares e Breno Silva              | Grafo Bipartido de Recursos | Modelagem de alocação entre centrais e UPs           |
| **Dupla 3** | Rebeca Sbroglio e Marcos Silva          | Mapa de Infraestrutura      | Visão operacional de bases, UPs e rastreadores       |
| **Dupla 4** | Gabriel Bartmanovicz e Leonardo Fischel | Diagrama Sankey             | Fluxo de distribuição de recursos                    |

Todas as visualizações foram desenvolvidas em **D3.js** e são integradas ao sistema de recomendação baseado em algoritmos de grafos.

## Visualizações e Gráficos

### 1. Mapa de Calor dos Focos de Incêndio

**Dupla responsável:** Caroline e Christian

#### Relevância

O mapa de calor é uma ferramenta fundamental para **análise espacial de risco**, permitindo identificar:

- **Regiões com maior densidade de focos de incêndio** ao longo do tempo
- **Padrões sazonais e climáticos** que influenciam a ocorrência de queimadas
- **Áreas críticas** que demandam atenção preventiva e posicionamento estratégico de recursos

Esta visualização suporta tanto decisões táticas (onde posicionar brigadas preventivamente) quanto estratégicas (investimento em infraestrutura de monitoramento).

#### Explicação Técnica

O mapa utiliza:

- **Base cartográfica real** das regiões onde a Suzano opera
- **Sobreposição de camadas de calor** (heatmap) com intensidade proporcional à frequência e gravidade dos focos
- **Integração com dados históricos** de incêndios e condições meteorológicas
- **Renderização em D3.js** com projeções geográficas (D3-geo) para precisão cartográfica

A intensidade das cores reflete a concentração de ocorrências, permitindo identificar visualmente **hotspots críticos** que requerem monitoramento reforçado.

### 2. Grafo Bipartido de Alocação de Recursos

**Dupla responsável:** Pedro e Breno

#### Relevância

O grafo bipartido é a **representação central do modelo matemático de otimização**, traduzindo o problema logístico de alocação de recursos em uma estrutura visual compreensível. Ele permite:

- **Visualizar conexões** entre centrais operacionais (nós de origem) e UPs afetadas (nós de destino)
- **Identificar gargalos** e sobrecarga de centrais específicas
- **Avaliar a distribuição de recursos** (aeronaves, terrestres, brigadistas) de forma balanceada
- **Auditar decisões** de alocação com base em critérios técnicos transparentes

Esta visualização é essencial para **Gerson Neves** (gestor) validar que as decisões seguem critérios objetivos e para **Márcia Viana** (operadora) entender rapidamente quais bases estão disponíveis e seus recursos.

#### Explicação Técnica

O grafo é composto por:

- **Dois conjuntos de nós**:
  - Centrais operacionais (C = {c₁, c₂, ..., cₙ}) à esquerda
  - Unidades de Produção/UPs (U = {u₁, u₂, ..., uₘ}) à direita
- **Arestas ponderadas** representando fluxos de recursos (k ∈ K = {Aeronaves, Terrestres, Brigadistas})
- **Atributos visuais**:
  - Espessura das arestas proporcional ao volume de recursos alocados
  - Cores diferenciadas por tipo de recurso
  - Rótulos com distância, tempo de deslocamento e custo operacional normalizado

A renderização utiliza **force-directed layouts** do D3.js para posicionamento automático dos nós, facilitando a leitura de redes complexas.

### 3. Mapa de Infraestrutura Operacional

**Dupla responsável:** Rebeca e Marcos

#### Relevância

Este mapa fornece uma **visão operacional em tempo real** da infraestrutura de combate a incêndios, essencial para:

- **Planejamento de cobertura territorial**: identificar gaps e áreas descobertas
- **Análise de redundância**: avaliar se há bases suficientes para atendimento simultâneo
- **Gestão de ativos críticos**: rastrear localização de caminhões-pipa, torres de monitoramento e equipamentos
- **Integração com rastreadores**: monitorar posicionamento dinâmico de equipes e veículos

Para a operadora **Márcia**, este mapa oferece contexto geográfico para suas decisões. Para o gestor **Gerson**, permite avaliar se a distribuição de bases está alinhada com a exposição ao risco.

#### Explicação Técnica

O mapa integra três camadas de informação:

1. **Bases operacionais**: marcadores georreferenciados com capacidade de cada central
2. **Unidades de Produção (UPs)**: polígonos representando áreas florestais com classificação de risco
3. **Rastreadores ativos**: posições em tempo real de equipes e veículos (quando disponível via API)

A visualização utiliza:

- **D3-geo** para projeções cartográficas
- **GeoJSON** para representação de polígonos de UPs
- **Interatividade**: tooltips ao passar o mouse, filtros por região/tipo de recurso

### 4. Diagrama Sankey de Distribuição de Recursos

**Dupla responsável:** Gabriel e Leonardo

#### Relevância

O diagrama Sankey é uma ferramenta poderosa para **visualizar fluxos de recursos ao longo de múltiplas etapas**, permitindo:

- **Rastrear a jornada dos recursos** desde as centrais até as UPs afetadas
- **Identificar perdas e ineficiências** ao longo do processo (por exemplo, recursos mobilizados mas não utilizados)
- **Comunicar complexidade logística** de forma intuitiva para stakeholders não-técnicos
- **Auditar decisões** de mobilização em análises pós-ocorrência

Para **Gerson** (gestor), o Sankey oferece uma narrativa visual clara para apresentações à diretoria. Para **Márcia** (operadora), contextualiza suas decisões dentro do fluxo completo de atendimento.

#### Explicação Técnica

O Sankey representa:

- **Nós de origem**: Centrais operacionais com estoque inicial de recursos
- **Nós intermediários**: Categorias de recursos (Aeronaves, Terrestres, Brigadistas)
- **Nós de destino**: UPs que receberam os recursos
- **Fluxos**: Representados por fitas cuja largura é proporcional ao volume de recursos

Características técnicas:

- **Renderização em D3-sankey** (plugin oficial do D3.js)
- **Normalização de valores** para garantir comparabilidade entre diferentes tipos de recursos
- **Interatividade**: hover para exibir valores exatos, filtros temporais para análise histórica
- **Exportação**: possibilidade de gerar imagens estáticas (SVG/PNG) para relatórios

## Como Executar

Para visualizar os mapas e gráficos desenvolvidos, navegue até o arquivo html correspondente de cada dupla e abra-o em um navegador web moderno.

Para facilitar, instale a biblioteca **Live Server** (disponível como extensão para VS Code) e execute o comando "Live Server: Open with Live Server" no arquivo `html` de cada visualização. Isso garantirá que as dependências do D3.js sejam carregadas corretamente e permitirá interatividade total com os gráficos.
