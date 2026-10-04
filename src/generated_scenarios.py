"""Generate reproducible synthetic route scenarios for SC06 Step 2.

These are simulated scenarios for algorithm testing, not real traffic observations.
Run from the repository root: python src/generate_scenarios.py
"""
from __future__ import annotations

import csv
import random
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_DIR = PROJECT_ROOT / "data" / "processed"
OUTPUT_FILE = OUTPUT_DIR / "sc06_route_scenarios.csv"
SEED = 42
SCENARIO_COUNT = 10_000
MAX_STOPS = 12

FIELDS = ["scenario_id", "scenario_type", "stop_count", "traffic_condition",
          "traffic_multiplier", "priority_weight", "mutation_rate", "generations"]
for i in range(1, MAX_STOPS + 1):
    FIELDS += [f"stop_{i}_x", f"stop_{i}_y", f"stop_{i}_priority"]

def generate_scenarios(count: int = SCENARIO_COUNT, seed: int = SEED) -> list[dict]:
    rng = random.Random(seed)
    rows = []
    types = (["normal"] * 7000 + ["boundary"] * 1500 +
             ["stress"] * 1000 + ["edge"] * 500)
    rng.shuffle(types)
    traffic_options = {
        "low": (1.00, 1.20), "normal": (1.20, 1.60),
        "heavy": (1.60, 2.20), "peak_uncertain": (1.40, 2.50)
    }
    for n in range(count):
        kind = types[n % len(types)] if count == SCENARIO_COUNT else (
            "normal" if n % 10 < 7 else "stress")
        if kind == "boundary":
            stops = rng.choice([2, MAX_STOPS])
            weight = rng.choice([0.0, 2.0])
        elif kind == "stress":
            stops = rng.randint(10, MAX_STOPS)
            weight = rng.uniform(1.5, 2.0)
        elif kind == "edge":
            stops = rng.choice([2, 3, MAX_STOPS])
            weight = rng.choice([0.0, 0.1, 1.9, 2.0])
        else:
            stops = rng.randint(3, 9)
            weight = rng.uniform(0.25, 1.5)
        traffic = rng.choice(list(traffic_options))
        low, high = traffic_options[traffic]
        row = {
            "scenario_id": f"SC06-{n+1:05d}", "scenario_type": kind,
            "stop_count": stops, "traffic_condition": traffic,
            "traffic_multiplier": round(rng.uniform(low, high), 3),
            "priority_weight": round(weight, 3),
            "mutation_rate": round(rng.uniform(0.01, 0.25), 3),
            "generations": rng.choice([50, 75, 100, 150, 200])
        }
        for i in range(1, MAX_STOPS + 1):
            if i <= stops:
                row[f"stop_{i}_x"] = round(rng.uniform(0, 100), 3)
                row[f"stop_{i}_y"] = round(rng.uniform(0, 100), 3)
                row[f"stop_{i}_priority"] = rng.randint(1, 5)
            else:
                row[f"stop_{i}_x"] = ""
                row[f"stop_{i}_y"] = ""
                row[f"stop_{i}_priority"] = ""
        rows.append(row)
    return rows

def validate_scenarios(rows: list[dict]) -> None:
    if len(rows) != SCENARIO_COUNT:
        raise ValueError(f"Expected {SCENARIO_COUNT} rows, got {len(rows)}")
    ids = [r["scenario_id"] for r in rows]
    if len(ids) != len(set(ids)):
        raise ValueError("Scenario IDs must be unique")
    for r in rows:
        stops = int(r["stop_count"])
        if not 2 <= stops <= MAX_STOPS:
            raise ValueError(f"Invalid stop count in {r['scenario_id']}")
        if r["traffic_condition"] not in {"low", "normal", "heavy", "peak_uncertain"}:
            raise ValueError(f"Invalid traffic label in {r['scenario_id']}")
        if not 1.0 <= float(r["traffic_multiplier"]) <= 2.5:
            raise ValueError(f"Traffic multiplier out of range in {r['scenario_id']}")
        if not 0 <= float(r["priority_weight"]) <= 2:
            raise ValueError(f"Priority weight out of range in {r['scenario_id']}")
        if not 0.01 <= float(r["mutation_rate"]) <= 0.25:
            raise ValueError(f"Mutation rate out of range in {r['scenario_id']}")
        for i in range(1, stops + 1):
            x, y, p = float(r[f"stop_{i}_x"]), float(r[f"stop_{i}_y"]), int(r[f"stop_{i}_priority"])
            if not (0 <= x <= 100 and 0 <= y <= 100 and 1 <= p <= 5):
                raise ValueError(f"Invalid stop data in {r['scenario_id']}")

def run_generator() -> Path:
    rows = generate_scenarios()
    validate_scenarios(rows)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    with OUTPUT_FILE.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)
    print("SC06 STEP 2 SCENARIO PIPELINE COMPLETED")
    print(f"Rows: {len(rows)} | Seed: {SEED} | Output: {OUTPUT_FILE.relative_to(PROJECT_ROOT)}")
    print("Scenario types:", {k: sum(r["scenario_type"] == k for r in rows)
                              for k in ("normal", "boundary", "stress", "edge")})
    print("Validation: PASSED")
    return OUTPUT_FILE

if __name__ == "__main__":
    run_generator()
