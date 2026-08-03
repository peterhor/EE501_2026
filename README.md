# EE501 — Climate Change and Ecology

Interactive computer practical (PC) labs for the course, published via GitHub Pages:

**→ https://peterhor.github.io/EE501_2026/**

The live site has the course schedule, a link to Canvas, and the three labs:

1. **Daisyworld** — planetary self-regulation, after Watson & Lovelock (1983)
2. **Energy Balance Model** — zero-dimensional energy balance climate model
3. **Abrupt Vegetation Change** — vegetation–precipitation feedback in the Sahara

Course materials originally developed by Hans Renssen, former course coordinator.

## Repo structure

- `docs/` — the published site (GitHub Pages serves from `main` / `docs`). This is the
  only folder students' browsers ever load; edit `docs/index.html` for landing-page
  changes (schedule, links, etc.).
- `PC Lab 1_ Daisy world/`, `PC Lab 2_ Energy Balance Model/`, `PC Lab 3_ Abrupt vegetation change/` —
  source working folders for each lab, including instructor-only material (answer keys,
  teacher variants) that's excluded from version control via `.gitignore`.

Each lab is a single self-contained HTML bundle exported from Claude — no build step,
no dependencies. To update a lab, replace its `(Student).html` file in the relevant
source folder and re-copy it into the matching `docs/<lab>/index.html`.
