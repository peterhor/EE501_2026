# EE501 - Climate Change and Ecology

Repository for the EE501 course website, interactive lecture material, and student computer practicals.

Live site:

**[https://peterhor.github.io/EE501_2026/](https://peterhor.github.io/EE501_2026/)**

The published site is a static GitHub Pages site served from `docs/`. It includes:

1. The main landing page with schedule and Canvas link
2. Three PC labs with separate task/question pages
3. Interactive lecture material for Lectures 1-8
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

1. `lecture-1-components-of-the-climate-system/`
2. `lecture-2-earths-energy-budget/`
3. `lecture-3-climate-at-a-local-scale/`
4. `lecture-4-global-cycles-water-and-carbon/`
5. `lecture-5-modelling-the-climate-system/`
6. `lecture-6-response-of-the-climate-system-to-perturbations/`
7. `lecture-7-climate-change-past-and-present/`
8. `lecture-8-climate-change-the-future/`

Published lecture folders:

1. `docs/lecture-1-components-of-the-climate-system/`
2. `docs/lecture-2-earths-energy-budget/`
3. `docs/lecture-3-climate-at-a-local-scale/`
4. `docs/lecture-4-global-cycles-water-and-carbon/`
5. `docs/lecture-5-modelling-the-climate-system/`
6. `docs/lecture-6-response-of-the-climate-system-to-perturbations/`
7. `docs/lecture-7-climate-change-past-and-present/`
8. `docs/lecture-8-climate-change-the-future/`

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
3. `docs/lecture-1-components-of-the-climate-system/` through `docs/lecture-8-climate-change-the-future/`: lecture materials
4. `docs/equations/`: equation summary

The landing page currently follows two different navigation models by design:

1. Lecture-material cards are fully clickable across the whole card
2. PC Lab cards keep two explicit actions: open lab and tasks/questions

## Lecture coverage

Current published lecture coverage:

1. Lecture 1: published interactive material present, seven pages linked from the landing page
2. Lecture 2: published interactive material present, including the nested insolation interactive
3. Lecture 3: published interactive material present
4. Lecture 4: published interactive material present
5. Lecture 5: published interactive material present, including the nested atmospheric-equations interactive
6. Lecture 6: published interactive material present
7. Lecture 7: published interactive material present, including `docs/lecture-7-climate-change-past-and-present/provenance.html`
8. Lecture 8: published interactive material present, seven pages linked from the landing page

All eight lectures now have a teacher outline in their source folder and an entry in `teacher/index.html`.

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
2. The `teacher/` folder, which holds the index over those outlines
3. PPTX lecture decks
4. Screenshots and uploads used during preparation
5. Answer keys, reports, and worked solutions
6. Reference textbook material in `Goosse2010_textbook/`
7. Preview `.dc.html` exports and duplicate root-level runtime files

This keeps the public site in `docs/` while allowing the lecture mother folders to contain working and instructor-facing material locally.

### Teacher outline hub

Each lecture keeps its own running order inside its own mother folder, at `lecture-N-<topic>/LectureN-Teacher-outline.html`, next to the deck it was built from. `teacher/index.html` is the single index over all eight: the week at a glance, what each session is built on, its block-by-block running order, and the published pages each outline drives. Open it locally in a browser; it is not part of the site and is not committed.

The outlines are the authority. The hub summarizes them and links to them, so where the two disagree the outline is right.

Three `.gitignore` rules keep this side of the repository private, and it is worth knowing them before renaming anything:

1. `teacher/` is ignored wholesale, so working files dropped beside the hub are ignored too
2. `*Teacher*.html` catches the outlines by name wherever they sit
3. The current outline paths are additionally listed one by one, so keep the word `Teacher` in any outline filename and the explicit list can go stale without anything leaking

`git status --short` should never show an outline, a deck, or anything under `teacher/`.

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
10. Added `teacher/index.html`, the instructor-only index over the seven lecture outlines, and extended `.gitignore` to cover `teacher/` and the Lecture 8 outline path

Still to do in the broader course cleanup:
  Check the TODO.md file for more tasks

## Key files

1. `README.md`: repository overview and structure
2. `TODO.md`: active project and content-cleanup tasks
3. `docs/index.html`: live landing page and schedule
4. `teacher/index.html`: instructor-only index over the eight lecture outlines (local only)
5. `.gitignore`: local-only and instructor-only exclusions
