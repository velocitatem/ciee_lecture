# AI in Beer Distribution (CIEE Lecture)

Slides, synthetic data, and a local simulation for a lecture/demo on where AI improves beer distribution margin.

## What is in this repo

- `presentation.tex`: Beamer slide deck source.
- `dataset/`: synthetic Czech beer supply-chain dataset generator and docs.
- `simulation/`: local Monte Carlo fallback demo and visualization outputs.
- `DEMO.md`: end-to-end demo runbook (Palantir-style flow + local fallback).
- `NARRATIVE.md`: lecture storyline notes.

## Quick start

1) Build the slides:

```bash
make
```

Output: `presentation.pdf`

2) Generate synthetic data:

```bash
python3 dataset/generate_synthetic_dataset.py
```

3) Run the local simulation fallback:

```bash
python3 simulation/supply_chain_monte_carlo.py
```

Outputs are written to `simulation/output/`.

## Requirements

- `python3`
- `make` and `pdflatex` (for slides)
- Python packages for simulation: `numpy`, `matplotlib`

## Notes

- All dataset files are synthetic.
- The generator is seeded for reproducible demo data.
- For dataset file definitions, see `dataset/README.md`.
