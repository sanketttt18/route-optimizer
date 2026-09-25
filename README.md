# SC06 — Multi-Stop Campus Shuttle / Delivery Route Optimizer

A front-end prototype for the **Soft Computing Capstone** project:

> **SC06 | Multi-Stop Campus Shuttle / Delivery Route Optimizer**

The application demonstrates a **Genetic Algorithm (GA)** for finding a lower-cost multi-stop campus route while considering distance, traffic and destination priority. It also provides the mandatory **nearest-neighbour greedy baseline** for comparison.

## 1. Mid-term scope

This version focuses on the Milestone 1 requirements:

- Working interactive UI
- Configurable routing scenario
- Permutation-based Genetic Algorithm
- Nearest-neighbour baseline
- Route visualization
- GA convergence plot
- Comparison metrics
- Traffic and priority influence
- Clear explanation of the algorithmic components

This is intentionally a browser-only prototype. No backend or database is required for the mid-term version.

---

## 2. Files

```text
SC06-route-optimizer/
├── index.html
├── styles.css
├── script.js
└── README.md
```

### `index.html`
Contains the complete application structure and controls.

### `styles.css`
Contains all UI styling and responsive layout.

### `script.js`
Contains:

- Scenario generation
- Distance matrix generation
- Traffic modelling
- Priority handling
- Nearest-neighbour baseline
- Genetic Algorithm
- Selection
- Order crossover
- Swap mutation
- Fitness calculation
- Route visualization
- Convergence chart
- Result rendering

---

## 3. How to run

No build system is required.

### Option A — Directly open

Open:

```text
index.html
```

in a modern browser.

### Option B — VS Code Live Server

1. Open the project folder in VS Code.
2. Install/use **Live Server**.
3. Right-click `index.html`.
4. Select **Open with Live Server**.

---

## 4. How the application works

The problem is represented as a permutation-routing problem.

Example:

```text
Depot → Stop 4 → Stop 1 → Stop 6 → Stop 2 → ... → Depot
```

Every chromosome represents one possible ordering of the destinations.

### Chromosome

For 6 stops:

```text
[3, 0, 5, 2, 1, 4]
```

means:

```text
Stop 4 → Stop 1 → Stop 6 → Stop 3 → Stop 2 → Stop 5
```

The depot is implicitly placed at the beginning and end.

---

## 5. Genetic Algorithm

The implementation follows the basic evolutionary cycle:

```text
Initial population
        ↓
Fitness evaluation
        ↓
Tournament selection
        ↓
Order crossover
        ↓
Swap mutation
        ↓
New population
        ↓
Repeat for N generations
        ↓
Best route
```

### Population

The UI lets the user choose the population size.

Default:

```text
100 candidate routes
```

### Selection

**Tournament selection** is used.

Three candidate routes are sampled and the lowest-cost route becomes a parent.

### Crossover

The project uses **Order Crossover (OX)**.

OX is appropriate because routes are permutations and duplicate destinations are invalid.

### Mutation

The project uses **swap mutation**.

Example:

```text
Before:
[1, 4, 2, 5, 3]

After:
[1, 2, 4, 5, 3]
```

Two positions are selected and exchanged.

### Elitism

The best portion of the previous population is copied into the next generation to reduce the chance of losing a strong solution.

---

## 6. Fitness / objective function

The application combines three ideas:

### Distance

Longer routes receive a larger cost.

### Traffic

Every road segment has a traffic multiplier.

The traffic condition can be changed between:

- Low traffic
- Normal traffic
- Heavy traffic
- Peak / uncertain

The scenario generator introduces small variations between individual route segments to represent imperfect real-world conditions.

### Priority

Every destination has a priority from 1–5.

High-priority destinations are penalized when they appear late in the route.

The priority influence slider controls how strongly this component affects the total cost.

Conceptually:

```text
Total Cost =
    distance component
  + traffic/time component
  + priority lateness component
```

The exact implementation is intentionally visible in `script.js` so the viva can explain the course algorithm instead of treating the GA as a black-box library.

---

## 7. Baseline

The mandatory baseline is **Nearest Neighbour**.

The algorithm:

1. Starts at the depot.
2. Looks at every unvisited destination.
3. Chooses the closest available destination.
4. Moves there.
5. Repeats until all destinations are visited.
6. Returns to the depot.

It is computationally simple but greedy.

The application compares its distance/cost against the GA solution.

---

## 8. Route visualization

The route panel displays:

- Depot
- Destination nodes
- Destination labels
- Optimized route
- Visit order

The visualization is schematic rather than a real geographic map.

This is appropriate for the mid-term prototype because the project requires the algorithm and decision-support workflow to be demonstrated first.

---

## 9. Convergence plot

The convergence graph records the best fitness value found after every generation.

A healthy GA run should generally show:

```text
High initial cost
       ↓
rapid improvement
       ↓
slower improvement
       ↓
stabilisation
```

The plot provides visual evidence that the population is evolving rather than simply returning a hard-coded route.

---

## 10. Important data note

The current mid-term prototype **does not claim to contain a real 10,000-record external traffic dataset**.

Scenario distances and traffic conditions are generated inside the browser for demonstration/testing.

For the final milestone, replace or augment this simulated scenario generator with the project's cited map/distance source and the required 10,000+ documented traffic/route scenarios.

Do **not** present the current generated scenarios as real-world observations.

---

## 11. Suggested final-project extension

For the full capstone, the following architecture can be used:

```text
Real map/distance source
          ↓
10,000+ traffic/route scenarios
          ↓
Validation + preprocessing
          ↓
Nearest-neighbour baseline
          ↓
Genetic Algorithm
          ↓
Optimized route
          ↓
Evaluation dashboard
          ↓
Hosted Streamlit / web application
```

Potential final metrics:

- Total route distance
- Estimated travel time
- Priority-weighted cost
- Percentage improvement over baseline
- GA convergence
- Runtime
- Robustness under different traffic scenarios
- Sensitivity to mutation rate
- Sensitivity to population size
- Sensitivity to priority weighting

---

## 12. Recommended viva explanation

A concise explanation of the prototype:

> "We model the multi-stop routing problem as a permutation optimization problem. Each chromosome represents an ordering of campus destinations. The fitness function combines route distance, traffic-adjusted travel time and priority-based lateness. We generate an initial population of candidate routes, select parents using tournament selection, produce valid permutations using order crossover, introduce diversity through swap mutation, and retain elite solutions. We compare the resulting route against a nearest-neighbour greedy baseline and visualize convergence and route order."

---

## 13. Limitations of the mid-term version

This prototype is deliberately limited to the course milestone.

It does not yet include:

- Live traffic API
- GPS/map tiles
- Real campus GIS coordinates
- 10,000+ real traffic records
- Backend database
- User authentication
- Persistent experiment storage
- Multi-vehicle routing
- Time-window constraints
- Pickup/delivery capacity constraints

These can be added during the final milestone if required.

---

## 14. Team presentation split

For a 3–4 person team, a natural split is:

### Member 1 — Problem + Data
- Problem formulation
- Scenario generation/data source
- Preprocessing
- Assumptions

### Member 2 — Genetic Algorithm
- Chromosome representation
- Fitness function
- Selection
- Crossover
- Mutation
- Convergence

### Member 3 — Baseline + Evaluation
- Nearest neighbour
- Comparison metrics
- Experimental design
- Results

### Member 4 — Product/UI
- Frontend
- Visualization
- Dashboard
- Deployment
- Demo flow

---

## 15. Demo flow

For a 5-minute mid-term demo:

### 1. Explain the problem — 30 sec

"Given a depot, multiple destinations, traffic uncertainty and different priorities, we need an efficient visit order."

### 2. Configure scenario — 30 sec

Change:

- Number of stops
- Traffic
- Priority influence
- Mutation rate

### 3. Run baseline + GA — 60 sec

Click:

**Run Genetic Algorithm**

### 4. Explain route — 60 sec

Show:

- Optimized order
- Route visualization
- Distance
- Travel time
- Priority-aware cost

### 5. Explain convergence — 45 sec

Show that the best fitness improves across generations.

### 6. Compare baseline — 45 sec

Explain the difference between greedy nearest-neighbour and population-based optimization.

### 7. Discuss limitations/future work — 30 sec

Mention the transition from simulated scenarios to the required 10,000+ documented dataset.

---

## 16. Academic integrity / reproducibility note

The project intentionally exposes the main Genetic Algorithm components in `script.js` instead of hiding the optimization inside a library call.

For the final submission, document:

- Dataset name
- Dataset URL
- License
- Original dataset size
- Selected features
- Preprocessing
- Scenario-generation assumptions
- GA parameters
- Number of experimental runs
- Random seed strategy
- Baseline definition
- Evaluation metrics

This makes the experimental results reproducible and defensible during the individual viva.
