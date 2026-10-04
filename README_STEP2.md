# SC06 Step 2 — Reproducible Scenario Pipeline

Minimal Step 2 deliverable for the SC06 route optimizer. It creates and validates 10,000 deterministic synthetic routing scenarios for algorithm testing. The records are simulated, not real traffic data.

## Run
Requires Python 3.9+; no third-party packages are needed.
```bash
python src/generate_scenarios.py
```
The output is `data/processed/sc06_route_scenarios.csv`. See `data/README.md` for field definitions and `data/reports/scenario_quality_report.md` for validation and limitations.

The existing frontend can remain unchanged. Copy these files into the existing repository root and commit them on the project's Step 2 branch.
