# EE501 - Climate Change and Ecology

Repository for the EE501 course website, interactive lecture material, and student computer practicals.

Live site:

**[https://peterhor.github.io/EE501_2026/](https://peterhor.github.io/EE501_2026/)**

The published site is a static GitHub Pages site served from `docs/`. It includes:

1. The main landing page with schedule and Canvas link
2. Three PC labs with separate task/question pages
3. Interactive lecture material for Lectures 2-7
4. Shared reference material such as the equation summary

Course materials were originally developed by Hans Renssen, the former course coordinator.

## Repository model

The repository is organized around a public/private split:

1. `docs/` contains the published student-facing site
2. Root-level `lecture-*` folders are the source-side umbrella folders for each lecture
3. Instructor-only and local-only preparation material is excluded through `.gitignore`

There is no single global build step. The published material consists of static HTML, CSS, and JavaScript, with some source-side JSX and preview assets used during development.

## Normalized lecture structure

The repo now uses one mother folder per lecture at the root and one top-level published folder per lecture under `docs/`.

Root lecture folders:

1. `lecture-2-earths-energy-budget/`
2. `lecture-3-climate-at-a-local-scale/`
3. `lecture-4-global-cycles-water-and-carbon/`
4. `lecture-5-modelling-the-climate-system/`
5. `lecture-6-response-of-the-climate-system-to-perturbations/`
6. `lecture-7-climate-change-past-and-present/`
7. `lecture-8-climate-change-the-future/`

Published lecture folders:

1. `docs/lecture-2-earths-energy-budget/`
2. `docs/lecture-3-climate-at-a-local-scale/`
3. `docs/lecture-4-global-cycles-water-and-carbon/`
4. `docs/lecture-5-modelling-the-climate-system/`
5. `docs/lecture-6-response-of-the-climate-system-to-perturbations/`
6. `docs/lecture-7-climate-change-past-and-present/`
7. `docs/lecture-8-climate-change-the-future/`

Two previously separate material groups are now nested under their lecture umbrellas:

1. `insolation/` now sits under Lecture 2:
   `lecture-2-earths-energy-budget/insolation/` and `docs/lecture-2-earths-energy-budget/insolation/`
2. `atmospheric-equations/` now sits under Lecture 5:
   `lecture-5-modelling-the-climate-system/atmospheric-equations/` and `docs/lecture-5-modelling-the-climate-system/atmospheric-equations/`

## Published site layout

Everything under `docs/` is intended for students and is part of the live site.

Key published areas:

1. `docs/index.html`: main landing page
2. `docs/pc-lab-1-daisyworld/`, `docs/pc-lab-2-energy-balance-model/`, `docs/pc-lab-3-abrupt-vegetation-change/`: PC Labs 1-3
3. `docs/lecture-2-earths-energy-budget/` through `docs/lecture-7-climate-change-past-and-present/`: lecture materials
4. `docs/equations/`: equation summary

The landing page currently follows two different navigation models by design:

1. Lecture-material cards are fully clickable across the whole card
2. PC Lab cards keep two explicit actions: open lab and tasks/questions

## Lecture coverage

Current published lecture coverage:

1. Lecture 2: published interactive material present, including the nested insolation interactive
2. Lecture 3: published interactive material present
3. Lecture 4: published interactive material present
4. Lecture 5: published interactive material present, including the nested atmospheric-equations interactive
5. Lecture 6: published interactive material present
6. Lecture 7: published interactive material present, including `docs/lecture-7-climate-change-past-and-present/provenance.html`
7. Lecture 8: lecture folder exists in both root and `docs/`, but interactive material is not yet published there
8. Lecture 1: no lecture folder currently present in `docs/`

## Labs

The three PC labs remain separate from the lecture folders, but now follow the same explicit naming pattern:

1. `docs/pc-lab-1-daisyworld/`
2. `docs/pc-lab-2-energy-balance-model/`
3. `docs/pc-lab-3-abrupt-vegetation-change/`

Each lab has:

1. A published interactive page
2. A published tasks/questions page
3. A source-side student HTML bundle in the corresponding root-level PC Lab folder

The source lab folders are:

1. `pc-lab-1-daisyworld/`
2. `pc-lab-2-energy-balance-model/`
3. `pc-lab-3-abrupt-vegetation-change/`

## Instructor-only and local-only material

Several classes of files are intentionally excluded through `.gitignore` and are not part of the public site:

1. Teacher outlines such as `Lecture5-Teacher-outline.html`
2. PPTX lecture decks
3. Screenshots and uploads used during preparation
4. Answer keys, reports, and worked solutions
5. Reference textbook material in `Goosse2010_textbook/`
6. Preview `.dc.html` exports and duplicate root-level runtime files

This keeps the public site in `docs/` while allowing the lecture mother folders to contain working and instructor-facing material locally.

## Workflow

Typical workflow:

1. Work in the relevant root-level `lecture-*` folder or lab source folder
2. Move or adapt the student-facing version into the matching location under `docs/`
3. Update `docs/index.html` if landing-page links, schedule, or card copy changes
4. Keep citations, provenance notes, and cross-links aligned across the published pages

If you are unsure where to edit, start by deciding whether the change is:

1. Public and student-facing: edit under `docs/`
2. Lecture preparation or instructor-facing: inspect the relevant root-level `lecture-*` folder first
3. Lab-specific: check both the root-level PC Lab source folder and the matching `docs/` folder

## Cleanup progress

Completed in the current cleanup pass:

1. Renamed the root lecture folders to explicit lecture-numbered names
2. Renamed the top-level published lecture folders in `docs/` to the same lecture-numbered scheme
3. Merged `insolation` into the Lecture 2 umbrella in both the root source structure and `docs/`
4. Merged `atmospheric-equations` into the Lecture 5 umbrella in both the root source structure and `docs/`
5. Updated landing-page links and published cross-links to the new structure
6. Updated `.gitignore` to the new folder names
7. Updated the private teacher-outline links to the new published lecture paths
8. Renamed the root and published lab folders to explicit `pc-lab-*` names and updated lab links
9. Deduplicated the confirmed identical Lecture 2 insolation runtime assets by making the root preview reuse the canonical copies under `docs/`

Still to do in the broader course cleanup:

1. Standardize question/answer reveal patterns across all published material
2. Continue checking provenance/source notes and scientific grounding page by page
3. Decide how Lecture 8 interactive material should be published once developed

## Key files

1. `README.md`: repository overview and structure
2. `TODO.md`: active project and content-cleanup tasks
3. `docs/index.html`: live landing page and schedule
4. `.gitignore`: local-only and instructor-only exclusions
