const DATA_URL =
  "https://cdn.jsdelivr.net/gh/codeforamerica/click_that_hood/public/data/brazil-states.geojson";

const svg = d3.select("#map");
const frame = document.querySelector(".map-frame");
const status = document.querySelector("#status");
const tooltip = document.querySelector("#tooltip");

let geoData = null;

const colorScale = d3.scaleOrdinal(
  d3.quantize(d3.interpolateRgbBasis(["#b7d7cb", "#3c8c7c", "#f2b95d"]), 27),
);

function updateStatus(message, isError = false) {
  status.textContent = message;
  status.style.color = isError ? "#b42318" : "";
}

function getFeatureName(feature) {
  return feature.properties.name || feature.properties.sigla || "Estado";
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

function renderMap(data) {
  const width = Math.max(frame.clientWidth, 320);
  const height = Math.max(frame.clientHeight, 420);
  const projection = d3.geoMercator();
  const path = d3.geoPath(projection);

  projection.fitExtent(
    [
      [30, 30],
      [width - 30, height - 30],
    ],
    data,
  );

  svg.attr("viewBox", `0 0 ${width} ${height}`);

  svg
    .selectAll("path")
    .data(data.features, getFeatureName)
    .join("path")
    .attr("d", path)
    .attr("fill", (feature, index) => colorScale(index))
    .attr("stroke", "rgba(255, 255, 255, 0.92)")
    .attr("stroke-width", 1.25)
    .attr("vector-effect", "non-scaling-stroke")
    .style("cursor", "pointer")
    .on("pointerenter", function (event, feature) {
      d3.select(this).attr("fill", "#0d6b6b");
      moveTooltip(event, getFeatureName(feature));
    })
    .on("pointermove", function (event, feature) {
      moveTooltip(event, getFeatureName(feature));
    })
    .on("pointerleave", function (event, feature) {
      const index = data.features.indexOf(feature);
      d3.select(this).attr("fill", colorScale(index));
      hideTooltip();
    });
}

async function loadMap() {
  try {
    const data = await d3.json(DATA_URL);

    if (!data || !Array.isArray(data.features)) {
      throw new Error("Formato de GeoJSON invalido.");
    }

    geoData = data;
    renderMap(geoData);
    updateStatus(`${geoData.features.length} estados carregados.`);
  } catch (error) {
    console.error(error);
    updateStatus("Nao foi possivel carregar o mapa do Brasil.", true);
  }
}

const resizeObserver = new ResizeObserver(() => {
  if (geoData) {
    renderMap(geoData);
  }
});

resizeObserver.observe(frame);
loadMap();
