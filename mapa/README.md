# Mapa do Brasil com D3.js

Projeto inicial em HTML + JavaScript que desenha os estados do Brasil com D3.js usando um GeoJSON publico.

## Como executar

Use um servidor local simples para evitar problemas de carregamento entre arquivos locais e recursos externos.

```bash
cd mapa
python3 -m http.server 8000
```

Depois abra no navegador:

```text
http://localhost:8000
```

## Estrutura

- `index.html`: layout, estilos e carregamento do D3 via CDN.
- `script.js`: busca do GeoJSON e renderizacao do mapa responsivo.

## Proximos passos possiveis

- destacar um estado especifico;
- adicionar zoom e pan;
- trocar a fonte de dados por um GeoJSON proprio;
- exibir metricas por estado com legenda e tooltip.
