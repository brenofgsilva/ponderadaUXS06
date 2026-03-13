const DATA_URL =
  "https://cdn.jsdelivr.net/gh/codeforamerica/click_that_hood/public/data/brazil-states.geojson";
const CSV_URL = "./fazendasUPS.csv";

const svg = d3.select("#map");
const frame = document.querySelector(".map-frame");
const status = document.querySelector("#status");
const tooltip = document.querySelector("#tooltip");
const selectedStateLabel = document.querySelector("#selected-state");
const detailSummary = document.querySelector("#detail-summary");
const upsList = document.querySelector("#ups-list");
const basesList = document.querySelector("#bases-list");

let geoData = null;
let suzanoLocations = [];
let selectedStateKey = null;
let projection = null;
let pathGenerator = null;
let zoomBehavior = null;

const MIN_ZOOM = 1;
const MAX_ZOOM = 30;

const neutralStateFill = "#ece6da";
const activeStateFill = "#f2b95d";
const selectedStateFill = "#0d6b6b";
const UPS_MARKER_RADIUS = 4;
const BASE_MARKER_SIZE = 9;
const MARKER_STROKE_WIDTH = 0.7;

const viewportLayer = svg.append("g").attr("class", "viewport-layer");
const mapLayer = viewportLayer.append("g").attr("class", "states-layer");
const markersLayer = viewportLayer.append("g").attr("class", "markers-layer");

const operatingStateKeys = new Set();

function updateStatus(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? "#b42318" : "";
}

function getFeatureName(feature) {
  return feature.properties.name || feature.properties.sigla || "Estado";
}

function normalizeText(value) {
  return (value || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function toNumberPtBr(value) {
  if (value === null || value === undefined) {
    return NaN;
  }

  const cleaned = value.toString().trim().replace(/\s/g, "");

  if (!cleaned) {
    return NaN;
  }

  if (cleaned.includes(",") && cleaned.includes(".")) {
    return Number.parseFloat(cleaned.replace(/\./g, "").replace(",", "."));
  }

  if (cleaned.includes(",")) {
    return Number.parseFloat(cleaned.replace(",", "."));
  }

  return Number.parseFloat(cleaned);
}

function setListItems(element, items, emptyMessage) {
  element.innerHTML = "";

  if (!items.length) {
    const li = document.createElement("li");
    li.textContent = emptyMessage;
    element.append(li);
    return;
  }

  for (const item of items) {
    const li = document.createElement("li");
    li.textContent = item;
    element.append(li);
  }
}

function moveTooltip(event, label) {
  tooltip.textContent = label;
  tooltip.style.opacity = "1";
  tooltip.style.left = `${event.offsetX}px`;
  tooltip.style.top = `${event.offsetY}px`;
}

function hideTooltip() {
  tooltip.style.opacity = "0";
}

function getStateKeyFromFeature(feature) {
  return normalizeText(getFeatureName(feature));
}

function getLocationStateKey(location) {
  const point = [location.lon, location.lat];
  const feature = geoData.features.find((stateFeature) =>
    d3.geoContains(stateFeature, point),
  );

  return feature ? getStateKeyFromFeature(feature) : null;
}

function getStateFill(feature) {
  const stateKey = getStateKeyFromFeature(feature);

  if (stateKey === selectedStateKey) {
    return selectedStateFill;
  }

  if (operatingStateKeys.has(stateKey)) {
    return activeStateFill;
  }

  return neutralStateFill;
}

function getStateStroke(feature) {
  return operatingStateKeys.has(getStateKeyFromFeature(feature))
    ? "rgba(85, 52, 7, 0.65)"
    : "rgba(80, 61, 39, 0.35)";
}

function getSelectedStateLocations() {
  return suzanoLocations.filter(
    (location) => location.stateKey === selectedStateKey,
  );
}

function updateMarkerVisualScale(zoomScale = 1) {
  const safeScale = Math.max(zoomScale, 0.0001);
  const upsRadius = UPS_MARKER_RADIUS / safeScale;
  const baseSize = BASE_MARKER_SIZE / safeScale;
  const baseHalf = baseSize / 2;
  const strokeWidth = MARKER_STROKE_WIDTH / safeScale;

  markersLayer
    .selectAll("circle")
    .attr("r", upsRadius)
    .attr("stroke-width", strokeWidth);

  markersLayer
    .selectAll("rect")
    .attr("width", baseSize)
    .attr("height", baseSize)
    .attr("x", (d) => projection([d.lon, d.lat])[0] - baseHalf)
    .attr("y", (d) => projection([d.lon, d.lat])[1] - baseHalf)
    .attr("stroke-width", strokeWidth)
    .attr("transform", (d) => {
      const [x, y] = projection([d.lon, d.lat]);
      return `rotate(45, ${x}, ${y})`;
    });
}

function updateStateStyles() {
  mapLayer
    .selectAll("path")
    .attr("fill", (feature) => getStateFill(feature))
    .attr("stroke", (feature) => getStateStroke(feature))
    .attr("stroke-width", (feature) =>
      getStateKeyFromFeature(feature) === selectedStateKey ? 2.8 : 1.25,
    );
}

function renderDetails() {
  if (!selectedStateKey) {
    selectedStateLabel.textContent = "Selecione um estado";
    detailSummary.textContent =
      "Clique em um estado destacado para visualizar UPS e Bases disponíveis.";
    setListItems(upsList, [], "Nenhum estado selecionado.");
    setListItems(basesList, [], "Nenhum estado selecionado.");
    return;
  }

  const stateFeature = geoData.features.find(
    (feature) => getStateKeyFromFeature(feature) === selectedStateKey,
  );
  const stateName = stateFeature ? getFeatureName(stateFeature) : "Estado";
  const stateLocations = getSelectedStateLocations();

  const uniqueUps = [
    ...new Set(stateLocations.map((item) => item.upCode)),
  ].sort((a, b) => a.localeCompare(b));
  const uniqueBases = [
    ...new Set(stateLocations.map((item) => item.baseName)),
  ].sort((a, b) => a.localeCompare(b));
  const totalArea = d3.sum(stateLocations, (item) => item.areaHa || 0);

  selectedStateLabel.textContent = stateName;
  detailSummary.textContent = `${stateLocations.length} localizações, ${uniqueUps.length} UPS e ${uniqueBases.length} bases. Área total: ${totalArea.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} ha.`;
  setListItems(upsList, uniqueUps, "Sem UPS cadastradas para este estado.");
  setListItems(
    basesList,
    uniqueBases,
    "Sem bases cadastradas para este estado.",
  );
}

function renderMarkers() {
  markersLayer.selectAll("*").remove();

  if (!selectedStateKey || !projection) {
    return;
  }

  const stateLocations = getSelectedStateLocations();

  const upsPoints = stateLocations.filter(
    (location) =>
      Number.isFinite(location.lon) && Number.isFinite(location.lat),
  );

  const basesByName = d3.group(stateLocations, (location) => location.baseName);
  const basePoints = [...basesByName].map(([baseName, items]) => ({
    baseName,
    lon: d3.mean(items, (item) => item.lon),
    lat: d3.mean(items, (item) => item.lat),
  }));

  markersLayer
    .selectAll("circle")
    .data(upsPoints, (d) => `${d.upCode}-${d.farmName}`)
    .join("circle")
    .attr("class", "marker-ups")
    .attr("r", UPS_MARKER_RADIUS)
    .attr("cx", (d) => projection([d.lon, d.lat])[0])
    .attr("cy", (d) => projection([d.lon, d.lat])[1])
    .on("pointerenter", (event, point) => {
      moveTooltip(event, `UPS ${point.upCode} · ${point.farmName}`);
    })
    .on("pointermove", (event, point) => {
      moveTooltip(event, `UPS ${point.upCode} · ${point.farmName}`);
    })
    .on("pointerleave", hideTooltip);

  markersLayer
    .selectAll("rect")
    .data(basePoints, (d) => d.baseName)
    .join("rect")
    .attr("class", "marker-base")
    .attr("width", BASE_MARKER_SIZE)
    .attr("height", BASE_MARKER_SIZE)
    .attr("x", (d) => projection([d.lon, d.lat])[0] - BASE_MARKER_SIZE / 2)
    .attr("y", (d) => projection([d.lon, d.lat])[1] - BASE_MARKER_SIZE / 2)
    .attr("transform", (d) => {
      const [x, y] = projection([d.lon, d.lat]);
      return `rotate(45, ${x}, ${y})`;
    })
    .on("pointerenter", (event, point) => {
      moveTooltip(event, `Base ${point.baseName}`);
    })
    .on("pointermove", (event, point) => {
      moveTooltip(event, `Base ${point.baseName}`);
    })
    .on("pointerleave", hideTooltip);

  updateMarkerVisualScale(1);
}

function renderMap() {
  const width = Math.max(frame.clientWidth, 320);
  const height = Math.max(frame.clientHeight, 420);
  projection = d3.geoMercator();
  pathGenerator = d3.geoPath(projection);

  projection.fitExtent(
    [
      [30, 30],
      [width - 30, height - 30],
    ],
    geoData,
  );

  svg.attr("viewBox", `0 0 ${width} ${height}`);

  mapLayer
    .selectAll("path")
    .data(geoData.features, getFeatureName)
    .join("path")
    .attr("d", pathGenerator)
    .attr("fill", (feature) => getStateFill(feature))
    .attr("stroke", (feature) => getStateStroke(feature))
    .attr("stroke-width", (feature) =>
      getStateKeyFromFeature(feature) === selectedStateKey ? 2.8 : 1.25,
    )
    .attr("vector-effect", "non-scaling-stroke")
    .style("cursor", "pointer")
    .on("pointerenter", function (event, feature) {
      const stateName = getFeatureName(feature);
      const stateKey = getStateKeyFromFeature(feature);
      const suffix = operatingStateKeys.has(stateKey)
        ? " · atuação Suzano"
        : " · sem dados no CSV";
      moveTooltip(event, `${stateName}${suffix}`);
    })
    .on("pointermove", function (event, feature) {
      const stateName = getFeatureName(feature);
      const stateKey = getStateKeyFromFeature(feature);
      const suffix = operatingStateKeys.has(stateKey)
        ? " · atuação Suzano"
        : " · sem dados no CSV";
      moveTooltip(event, `${stateName}${suffix}`);
    })
    .on("pointerleave", function (event, feature) {
      hideTooltip();
    })
    .on("click", (_, feature) => {
      const stateKey = getStateKeyFromFeature(feature);

      if (!operatingStateKeys.has(stateKey)) {
        return;
      }

      selectedStateKey = stateKey;
      updateStateStyles();
      renderDetails();
      renderMarkers();
      zoomToFeature(feature);
    });

  renderMarkers();

  if (selectedStateKey) {
    const selectedFeature = geoData.features.find(
      (feature) => getStateKeyFromFeature(feature) === selectedStateKey,
    );

    if (selectedFeature) {
      zoomToFeature(selectedFeature, false);
    }
  } else {
    resetZoom(false);
  }
}

function ensureZoomBehavior() {
  if (zoomBehavior) {
    return;
  }

  zoomBehavior = d3
    .zoom()
    .scaleExtent([MIN_ZOOM, MAX_ZOOM])
    .on("zoom", (event) => {
      viewportLayer.attr("transform", event.transform);
      updateMarkerVisualScale(event.transform.k);
    });

  svg.call(zoomBehavior);
}

function zoomToFeature(feature, animate = true) {
  if (!zoomBehavior || !pathGenerator) {
    return;
  }

  const width = Math.max(frame.clientWidth, 320);
  const height = Math.max(frame.clientHeight, 420);
  const [[x0, y0], [x1, y1]] = pathGenerator.bounds(feature);
  const dx = Math.max(1, x1 - x0);
  const dy = Math.max(1, y1 - y0);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const scale = Math.max(
    MIN_ZOOM,
    Math.min(MAX_ZOOM, 0.95 / Math.max(dx / width, dy / height)),
  );
  const translate = [width / 2 - scale * cx, height / 2 - scale * cy];
  const transform = d3.zoomIdentity
    .translate(translate[0], translate[1])
    .scale(scale);

  const target = animate ? svg.transition().duration(700) : svg;
  target.call(zoomBehavior.transform, transform);
}

function resetZoom(animate = true) {
  if (!zoomBehavior) {
    return;
  }

  const target = animate ? svg.transition().duration(500) : svg;
  target.call(zoomBehavior.transform, d3.zoomIdentity);
}

async function loadData() {
  try {
    const [mapData, csvData] = await Promise.all([
      d3.json(DATA_URL),
      d3.csv(CSV_URL, (row) => {
        const lon = toNumberPtBr(row.x);
        const lat = toNumberPtBr(row.y);

        if (!Number.isFinite(lon) || !Number.isFinite(lat)) {
          return null;
        }

        return {
          upCode: (row.UP || "").trim(),
          farmName: (row.FAZENDA || "Sem nome").trim(),
          areaHa: toNumberPtBr(row.AREA_HA),
          baseName: (row["NÚCLEO"] || "Base").trim(),
          lon,
          lat,
        };
      }),
    ]);

    if (!mapData || !Array.isArray(mapData.features)) {
      throw new Error("Formato de GeoJSON invalido.");
    }

    geoData = mapData;
    suzanoLocations = csvData.filter(Boolean);

    ensureZoomBehavior();

    for (const location of suzanoLocations) {
      location.stateKey = getLocationStateKey(location);

      if (location.stateKey) {
        operatingStateKeys.add(location.stateKey);
      }
    }

    renderMap();
    renderDetails();

    updateStatus(
      `${operatingStateKeys.size} estados com atuação Suzano e ${suzanoLocations.length} localizações carregadas.`,
    );
  } catch (error) {
    console.error(error);
    updateStatus("Nao foi possivel carregar dados do mapa e do CSV.", true);
  }
}

const resizeObserver = new ResizeObserver(() => {
  if (geoData) {
    renderMap();
  }
});

resizeObserver.observe(frame);
loadData();
