# SC06 Scenario Data

## Purpose
SC06 is a multi-stop campus shuttle/delivery route optimizer. This Step 2 package provides deterministic **synthetic scenarios** for testing the route representation, nearest-neighbour baseline, and Genetic Algorithm.

## Source and provenance
No external traffic dataset is included in this mid-term prototype. Coordinates, traffic multipliers, priorities, and GA settings are generated in code using Python's standard-library `random` module and fixed seed `42`. These values are illustrative and are **not real campus GIS coordinates, GPS traces, measured distances, or observed traffic records**. No external dataset licence applies to these generated records.

## Schema
- `scenario_id`: unique synthetic scenario identifier.
- `scenario_type`: normal, boundary, stress, or edge test category.
- `stop_count`: number of destinations (2–12).
- `traffic_condition`, `traffic_multiplier`: simulated traffic label and segment-cost multiplier.
- `priority_weight`: influence of priority lateness in the objective.
- `mutation_rate`, `generations`: example GA configuration values.
- `stop_N_x`, `stop_N_y`: generated 2D schematic coordinates in a 0–100 plane.
- `stop_N_priority`: destination priority from 1 (low) to 5 (high). Unused stop slots are blank.

## Reproduction
From the repository root:
```bash
python src/generate_scenarios.py
```
This writes `data/processed/sc06_route_scenarios.csv`. The generator uses seed `42` and validates output before saving. The generated scenarios are for algorithm testing and demonstration only; do not describe them as real-world observations.

## Step 2 use
Use the same documented fields/ranges when developing and comparing the nearest-neighbour baseline and GA. Keep any future real sourced data separate, cite its URL/licence, and document transformations before using it.
