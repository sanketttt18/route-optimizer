# SC06 Data / Scenario Quality Report

## Purpose and provenance
This report covers the reproducible synthetic scenario set for the SC06 multi-stop campus shuttle/delivery route optimizer. No real traffic dataset was supplied or used. All records are generated for testing and demonstration, not measured real-world observations.

## Generation summary
| Item | Result |
|---|---:|
| Scenario records | 10,000 |
| CSV columns | 44 |
| Random seed | 42 |
| Stop range | 2–12 |
| Coordinate range | 0–100 (schematic plane) |
| Priority range | 1–5 |
| Traffic multiplier range | 1.0–2.5 |
| Priority weight range | 0–2 |
| Mutation rate range | 0.01–0.25 |

## Scenario coverage
| Category | Count |
|---|---:|
| Normal | 7,000 |
| Boundary | 1,500 |
| Stress | 1,000 |
| Edge | 500 |

## Validation
The generator checks the exact row count, unique scenario IDs, stop count bounds, supported traffic labels, traffic multiplier and priority-weight ranges, mutation-rate bounds, coordinate bounds, and destination priority labels. Validation completed successfully for the generated file. The generator raises an error when a checked rule fails.

## Intended use and limitations
The scenarios can be used to test route-cost calculations, nearest-neighbour routing, GA behavior, and UI demonstrations. The coordinates are abstract and do not represent a real campus map. Traffic multipliers are illustrative and do not estimate actual travel time. This scenario set does not establish real-world route performance or replace evaluation against cited map/distance sources.

## Reproduction
Run `python src/generate_scenarios.py` from the repository root. The output is written to `data/processed/sc06_route_scenarios.csv` using seed 42. Do not mix synthetic records with any future real observations without clearly labelling provenance and purpose.
