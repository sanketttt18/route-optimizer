const $ = (id) => document.getElementById(id);

const state = {
  stops: [],
  distance: [],
  traffic: [],
  best: null,
  baseline: null,
  history: [],
  seed: Date.now()
};

const stopNames = [
  "Main Gate", "Library", "Admin Block", "Hostel A", "Hostel B",
  "Cafeteria", "Sports Complex", "Engineering Block", "Medical Centre",
  "Auditorium", "Parking", "Innovation Hub"
];

const coordinates = [
  [50, 50], [25, 28], [58, 24], [78, 35], [80, 70], [52, 82],
  [25, 76], [36, 52], [64, 53], [49, 30], [17, 53], [68, 18]
];

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function seededRandom(seed) {
  let t = seed >>> 0;
  return function() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ t >>> 15, 1 | t);
    r ^= r + Math.imul(r ^ r >>> 7, 61 | r);
    return ((r ^ r >>> 14) >>> 0) / 4294967296;
  };
}

function createScenario(count = Number($("stopCount").value)) {
  state.seed = Math.floor(Math.random() * 1e9);
  const rng = seededRandom(state.seed);

  state.stops = Array.from({length: count}, (_, i) => ({
    id: i,
    name: stopNames[i],
    priority: Math.floor(rng() * 5) + 1,
    x: coordinates[i][0],
    y: coordinates[i][1]
  }));

  state.distance = Array.from({length: count + 1}, () => Array(count + 1).fill(0));
  state.traffic = Array.from({length: count + 1}, () => Array(count + 1).fill(1));

  // Node 0 in the matrix is the depot. Stops are matrix nodes 1..count.
  const points = [[50, 91], ...state.stops.map(s => [s.x, s.y])];
  const trafficBase = Number($("traffic").value);

  for (let i = 0; i <= count; i++) {
    for (let j = i + 1; j <= count; j++) {
      const dx = points[i][0] - points[j][0];
      const dy = points[i][1] - points[j][1];
      const d = Math.sqrt(dx * dx + dy * dy) * 0.12 + rand(0.3, 1.2);
      const factor = Math.max(0.75, trafficBase + (rng() - .5) * .28);
      state.distance[i][j] = state.distance[j][i] = d;
      state.traffic[i][j] = state.traffic[j][i] = factor;
    }
  }
  renderStops();
  renderEmptyRoute();
  drawChart([]);
  setText("runStatus", "Scenario ready. Edit priorities or run the optimizer.");
  setText("routeBadge", "Not run");
}

function renderStops() {
  $("stopsTable").innerHTML = state.stops.map((s, i) => `
    <div class="stop-row">
      <div class="stop-id">${String(i + 1).padStart(2, "0")}</div>
      <div>
        <span class="stop-name">${s.name}</span>
        <span class="stop-sub">Destination ${i + 1}</span>
      </div>
      <select class="priority-select" data-index="${i}" aria-label="Priority for ${s.name}">
        ${[1,2,3,4,5].map(p => `<option value="${p}" ${p === s.priority ? "selected" : ""}>Priority ${p}</option>`).join("")}
      </select>
    </div>
  `).join("");

  document.querySelectorAll(".priority-select").forEach(el => {
    el.addEventListener("change", e => {
      state.stops[Number(e.target.dataset.index)].priority = Number(e.target.value);
    });
  });
}

function routeCost(route) {
  const priorityWeight = Number($("priorityWeight").value) / 100;
  let distance = 0;
  let time = 0;
  let priorityPenalty = 0;
  let current = 0;

  route.forEach((stopIndex, order) => {
    const next = stopIndex + 1;
    const d = state.distance[current][next];
    const traffic = state.traffic[current][next];
    distance += d;
    time += d * 4.2 * traffic;
    const p = state.stops[stopIndex].priority;
    // High priority destinations receive a larger penalty when visited late.
    priorityPenalty += (6 - p) * (order + 1) * 0.28;
    current = next;
  });

  // Return to depot, typical for a shuttle/delivery route.
  distance += state.distance[current][0];
  time += state.distance[current][0] * 4.2 * state.traffic[current][0];

  const cost = distance * (1 - priorityWeight * .35)
             + time * .16
             + priorityPenalty * priorityWeight;
  return {cost, distance, time, priorityPenalty};
}

function nearestNeighbour() {
  const remaining = new Set(state.stops.map((_, i) => i));
  const route = [];
  let current = 0;

  while (remaining.size) {
    let best = null;
    let bestScore = Infinity;
    remaining.forEach(i => {
      const node = i + 1;
      const score = state.distance[current][node] * state.traffic[current][node];
      if (score < bestScore) {
        bestScore = score;
        best = i;
      }
    });
    route.push(best);
    remaining.delete(best);
    current = best + 1;
  }
  return route;
}

function randomRoute(n) {
  const a = Array.from({length: n}, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function tournament(population, k = 3) {
  let winner = null;
  for (let i = 0; i < k; i++) {
    const candidate = population[Math.floor(Math.random() * population.length)];
    if (!winner || candidate.score < winner.score) winner = candidate;
  }
  return winner.route.slice();
}

function orderCrossover(a, b) {
  const n = a.length;
  let left = Math.floor(Math.random() * n);
  let right = Math.floor(Math.random() * n);
  if (left > right) [left, right] = [right, left];

  const child = Array(n).fill(null);
  const used = new Set();
  for (let i = left; i <= right; i++) {
    child[i] = a[i];
    used.add(a[i]);
  }

  let pos = (right + 1) % n;
  for (let k = 0; k < n; k++) {
    const gene = b[(right + 1 + k) % n];
    if (!used.has(gene)) {
      child[pos] = gene;
      used.add(gene);
      pos = (pos + 1) % n;
    }
  }
  return child;
}

function mutate(route, rate) {
  if (Math.random() < rate) {
    const a = Math.floor(Math.random() * route.length);
    const b = Math.floor(Math.random() * route.length);
    [route[a], route[b]] = [route[b], route[a]];
  }
  return route;
}

function runGA() {
  const popSize = Math.max(20, Math.min(500, Number($("population").value)));
  const generations = Math.max(20, Math.min(1000, Number($("generations").value)));
  const mutationRate = Number($("mutation").value) / 100;

  const baselineRoute = nearestNeighbour();
  state.baseline = {route: baselineRoute, ...routeCost(baselineRoute)};

  let population = Array.from({length: popSize}, () => {
    const route = randomRoute(state.stops.length);
    return {route, ...routeCost(route), score: routeCost(route).cost};
  });

  state.history = [];
  let best = population.reduce((a, b) => a.score < b.score ? a : b);

  for (let g = 0; g < generations; g++) {
    population.sort((a, b) => a.score - b.score);
    if (population[0].score < best.score) best = {...population[0], route: population[0].route.slice()};
    state.history.push(best.score);

    const next = population.slice(0, Math.max(2, Math.floor(popSize * .08)))
      .map(x => ({...x, route: x.route.slice()}));

    while (next.length < popSize) {
      const p1 = tournament(population);
      const p2 = tournament(population);
      let child = orderCrossover(p1, p2);
      child = mutate(child, mutationRate);
      next.push({route: child, ...routeCost(child), score: routeCost(child).cost});
    }
    population = next;
  }

  best = {...best, ...routeCost(best.route)};
  state.best = best;

  renderResults();
  drawChart(state.history);
}

function renderResults() {
  const ga = state.best;
  const base = state.baseline;
  const improvement = Math.max(0, ((base.distance - ga.distance) / base.distance) * 100);

  setText("gaDistance", ga.distance.toFixed(2));
  setText("baselineDistance", base.distance.toFixed(2));
  setText("gaTime", ga.time.toFixed(1));
  setText("gaCost", ga.cost.toFixed(1));
  setText("improvementText", improvement.toFixed(1) + "%");
  setText("heroImprovement", improvement.toFixed(1) + "%");
  $("improvementBar").style.width = Math.min(100, improvement * 2.5) + "%";

  setText("routeBadge", "GA optimized");
  setText("runStatus", `Completed ${$("generations").value} generations with ${$("population").value} candidate routes.`);
  $("baselineRoute").innerHTML = "Depot → " + base.route.map(i => state.stops[i].name).join(" → ") + " → Depot";

  renderRoute(ga.route);
  $("routeOrder").innerHTML = `<span class="route-chip start">DEPOT</span>` +
    ga.route.map((i, n) => `<span class="route-chip">${n + 1}. ${state.stops[i].name}</span>`).join("") +
    `<span class="route-chip start">DEPOT</span>`;
}

function renderEmptyRoute() {
  $("routeOrder").innerHTML = '<span class="route-chip">Run the optimizer to generate a route</span>';
  $("routeVisual").innerHTML = `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect width="100" height="100" fill="#f1f5f2"/>
      <text x="50" y="50" text-anchor="middle" dominant-baseline="middle"
            font-family="Manrope, sans-serif" font-size="4" fill="#708079">
        Route visualization will appear here
      </text>
    </svg>`;
}

function renderRoute(route) {
  const points = [[50, 91], ...state.stops.map(s => [s.x, s.y])];
  const ordered = [0, ...route.map(i => i + 1), 0];
  const poly = ordered.map(i => points[i].join(",")).join(" ");

  const circles = state.stops.map((s, i) => `
    <circle cx="${s.x}" cy="${s.y}" r="2.6" fill="#ffffff" stroke="#177a52" stroke-width="0.7"/>
    <text x="${s.x}" y="${s.y + 1}" text-anchor="middle" font-family="DM Mono" font-size="2.2" fill="#17322a">${i+1}</text>
  `).join("");

  const labels = state.stops.map(s => `
    <text x="${s.x + 3.3}" y="${s.y - 3}" font-family="Manrope" font-size="2.3" fill="#708079">${s.name}</text>
  `).join("");

  $("routeVisual").innerHTML = `
    <svg viewBox="0 0 100 100" preserveAspectRatio="none">
      <rect width="100" height="100" fill="#f1f5f2"/>
      <path d="M 8 18 H 92 M 8 48 H 92 M 8 78 H 92 M 18 5 V 95 M 48 5 V 95 M 78 5 V 95"
            stroke="#dce5df" stroke-width=".6" fill="none"/>
      <polyline points="${poly}" fill="none" stroke="#177a52" stroke-width="1.2"
                stroke-linecap="round" stroke-linejoin="round" opacity=".9"/>
      ${circles}
      ${labels}
      <circle cx="50" cy="91" r="3.6" fill="#17322a"/>
      <text x="50" y="91.8" text-anchor="middle" font-family="DM Mono" font-size="2.2" fill="#fff">D</text>
      <text x="53.5" y="94" font-family="Manrope" font-size="2.5" fill="#17322a">Depot / Gate</text>
    </svg>`;
}

function drawChart(history) {
  const canvas = $("convergenceChart");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 800;
  const height = 300;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, width, height);

  const pad = {l: 48, r: 18, t: 20, b: 35};
  ctx.strokeStyle = "#dce5df";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#708079";
  ctx.font = "10px DM Mono";

  for (let i = 0; i <= 4; i++) {
    const y = pad.t + (height - pad.t - pad.b) * i / 4;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(width - pad.r, y); ctx.stroke();
  }

  if (!history.length) {
    ctx.textAlign = "center";
    ctx.fillText("Run the optimizer to plot convergence.", width / 2, height / 2);
    return;
  }

  const min = Math.min(...history);
  const max = Math.max(...history);
  const range = Math.max(1, max - min);
  ctx.beginPath();
  history.forEach((v, i) => {
    const x = pad.l + i * (width - pad.l - pad.r) / Math.max(1, history.length - 1);
    const y = pad.t + (max - v) / range * (height - pad.t - pad.b);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = "#177a52";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = "#708079";
  ctx.textAlign = "left";
  ctx.fillText("Fitness / cost", 4, pad.t + 5);
  ctx.textAlign = "center";
  ctx.fillText("Generation", width / 2, height - 8);
  ctx.textAlign = "right";
  ctx.fillText(String(history.length), width - pad.r, height - 8);
}

function setText(id, value) { $(id).textContent = value; }

$("stopCount").addEventListener("input", e => {
  setText("stopCountValue", `${e.target.value} stops`);
  createScenario(Number(e.target.value));
});
$("mutation").addEventListener("input", e => setText("mutationValue", `${e.target.value}%`));
$("priorityWeight").addEventListener("input", e => setText("priorityValue", `${e.target.value}%`));
$("traffic").addEventListener("change", () => createScenario(Number($("stopCount").value)));
$("randomizeBtn").addEventListener("click", () => createScenario(Number($("stopCount").value)));
$("optimizeBtn").addEventListener("click", () => {
  $("optimizeBtn").disabled = true;
  $("optimizeBtn").textContent = "⏳ Optimizing...";
  setTimeout(() => {
    runGA();
    $("optimizeBtn").disabled = false;
    $("optimizeBtn").innerHTML = "<span>▶</span> Run Genetic Algorithm";
  }, 30);
});
window.addEventListener("resize", () => drawChart(state.history));

createScenario(8);
