# EE501 — master build report

Collated end-of-build reports for every piece of prepared course material, in one place.

This folder sits **outside `docs/`** on purpose: `docs/` is the published GitHub Pages site, so
nothing written here can reach students. It is a maintenance record for the course owner —
what was built, what is honestly computed, what is a labelled schematic, and what is still open.

Last updated: **31 August 2026** · covers Lectures 2–8, PC Labs 1–3, the equation summary and the
provenance appendix.

---

## 1 · Contents

| § | Module | Published at | Pages | Interactive panels | Built |
|---|---|---|---|---|---|
| 4 | PC Labs 1–3 | `docs/pc-lab-*/` | 3 labs + 3 task pages | 3 bundled labs | 3 Aug 2026 |
| 5 | Lecture 2 — The Earth's Energy Budget | `docs/lecture-2-earths-energy-budget/` | 7 | 12 + insolation canvas | 20–26 Aug 2026 |
| 6 | Lecture 3 — Climate at a Local Scale | `docs/lecture-3-climate-at-a-local-scale/` | 5 | 6 + explorer canvas | 27–28 Aug 2026 |
| 7 | Lecture 4 — Global Cycles: Water and Carbon | `docs/lecture-4-global-cycles-water-and-carbon/` | 4 | 7 | 28–29 Aug 2026 |
| 8 | Lecture 5 — Modelling the Climate System | `docs/lecture-5-modelling-the-climate-system/` | 5 | 9 | 29–30 Aug 2026 |
| 9 | Lecture 6 — Response to Perturbations | `docs/lecture-6-response-of-the-climate-system-to-perturbations/` | 6 | 11 | 30 Aug 2026 |
| 10 | Lecture 7 — Climate Change: Past and Present | `docs/lecture-7-climate-change-past-and-present/` | 6 + appendix | 12 | 30 Aug 2026 |
| 11 | Lecture 8 — Climate Change: the Future | `docs/lecture-8-climate-change-the-future/` | 7 | 25 | 31 Aug 2026 |
| 12 | Equation summary | `docs/equations/` | 1 (Parts I–VII) | — | continuous |
| 12 | Provenance appendix | `docs/lecture-7-…/provenance.html` | 1 | — | 30–31 Aug 2026 |

**Totals.** 41 published teaching pages, 44 formal *Demonstration* cards plus 38 smaller
interactive panels, 3 bundled PC labs, one 7-part equation summary and one provenance appendix.

---

## 2 · The conventions every module was built to

These were established with Lecture 2 and held throughout. They are the reason the modules read as
one course rather than seven separate builds.

1. **One self-contained HTML file per page.** No build step, no external data fetches, no CDN.
   A page works from a memory stick with the network off. The three canvas-based interactives
   (`insolation/`, `explorer/`, `atmospheric-equations/`) are the exception: they carry a local
   `support.js` and their own `.jsx` scenes.
2. **A shared visual grammar.** Light/dark theme toggle honouring `data-theme`; `.card` for
   exposition, `.card.demo` for a demonstration (auto-prefixed *Demonstration ·*), `.q` for a
   question, `.kpi` for readouts, `.foot` for the grey source note.
3. **A grey source note at the foot of every page**, naming the Goosse chapter, the figure numbers,
   and the primary literature — and stating plainly which figures are computed and which are
   schematics. All 41 pages have one.
4. **Never draw a curve that looks like data but is not.** Where an observational field could not be
   sourced honestly, the page either computes a model, draws a labelled schematic with no numeric
   value axis, or says in prose that the lecturer will show the original. This rule is written out
   for students in the provenance appendix.
5. **Integration over duplication.** Each lecture links into the earlier ones rather than restating
   them. 116 cross-lecture links currently exist between published pages.
6. **Instructor material never enters `docs/`.** Teacher outlines and PPTX decks live in the root
   `lecture-*` folders and are gitignored.

---

## 3 · Cross-integration map

Every module was checked to link backwards into the material it depends on. Link counts between
published pages, heaviest first:

| Target | Inbound links | Pulled in by |
|---|---|---|
| `lecture-7/provenance.html` | 8 | all of Lectures 7 and 8 |
| `lecture-6/forcing-and-feedback.html` | 8 | L7 loop-sign rule, L8 forcing chain |
| `lecture-7/forced-and-internal.html` | 7 | L8 uncertainty partition, σ table |
| `lecture-6/biogeochemical-feedbacks.html` | 7 | L8 carbon budgets, L4 cycle closure |
| `lecture-3/turbulent-fluxes.html` | 7 | L2 Bowen ratio, L8 land–sea contrast |
| `lecture-6/transient-response.html` | 6 | L7 last-millennium EBM, L8 two-layer |
| `lecture-6/forcing-agents.html` | 6 | L7 attribution ledger, L8 scenarios |
| `lecture-5/hierarchy.html` | 6 | L6, L7, L8 integrators |
| `lecture-4/carbon-budget.html` | 6 | L6 β–γ, L8 airborne fraction |
| `pc-lab-3-abrupt-vegetation-change/` | 11 | L6 Sahara feedback, L7 abrupt change |
| `pc-lab-2-energy-balance-model/` | 5 | L5 hierarchy, L6 sensitivity |
| `pc-lab-1-daisyworld/` | 3 | L5 hierarchy, L6 feedback sign |
| `equations/` | 4 | landing page + three lectures |

The chains that carry most of the course: **insolation geometry** (L2 → L7 orbital forcing →
L7 Holocene proxies); **the single-slab EBM** (L5 hierarchy → L6 transient → L7 last millennium →
L7 attribution fingerprints → L8 scenarios); **the carbon budget** (L4 → L6 β–γ → L8 TCRE and
remaining budgets); **bistability** (PC Lab 3 → L6 Sahara → L7 AMOC — flagged in L7 page 4 as the
same mathematics).

---

## 4 · PC Labs 1–3

**Published** — `docs/pc-lab-1-daisyworld/`, `docs/pc-lab-2-energy-balance-model/`,
`docs/pc-lab-3-abrupt-vegetation-change/`, each with an `index.html` lab bundle (~0.5 MB,
self-contained) and a `tasks.html`.

| Lab | Subject | Task page |
|---|---|---|
| 1 · Daisyworld | Planetary self-regulation, after Watson & Lovelock (1983) | Intro + E1–E9: growth rate vs temperature, brightening sun, bare planet, black-only, white-only, both, stronger albedo contrast, lower death rate, and the transfer question to global change |
| 2 · Energy Balance Model | Zero-dimensional EBM | Intro + E1–E6: grey atmosphere, varying emissivity, what drives the greenhouse effect, planetary albedo, a variable sun, other planets |
| 3 · Abrupt Vegetation Change | Vegetation–precipitation feedback in the Sahara | Intro + E1–E5: no stochastic forcing, stochastic rainfall, filtered stochastic forcing, unstable vs stable collapse, the Sahel under global change |

Each task page carries preparation, report and submission instructions. Answer keys and report
templates are gitignored (`*FASIT*`, `*Report*.docx`, `*Teacher*.html`) and were never published.
Two spoiler paths were closed in the Sahara lab during the build.

Course materials originally developed by **Hans Renssen**, former course coordinator — credited on
all three labs and on the landing page.

---

## 5 · Lecture 2 — The Earth's Energy Budget

**Published — `docs/lecture-2-earths-energy-budget/`, 7 pages.**

| Page | Demonstration |
|---|---|
| Four thermal emitters | Heater, fire, skin and Sun compared; visible/infrared shares from numerical integration of Planck's law |
| Stefan–Boltzmann | Temperature drag; disc-absorbs / sphere-emits geometry; the same law resolved by wavelength |
| The greenhouse effect | Single-layer slab with the absorptivity ε as a slider, resolving to *T*s = [2/(2−ε)]^¼ *T*e |
| From one layer to a real atmosphere | "Space sees 255 K — where is that?" with the US Standard Atmosphere profile; an *n*-layer blanket; band-by-band absorption |
| Insolation geometry | Animated orbit, sky-path and daily-curve canvas with the Fig. 2.11 heatmap and annual totals |
| The geography of the budget | The same arithmetic run at six sites; a lumped column driven by a sine wave; the annual-mean meridional picture |
| The complete ledger | The full flux diagram, and the missing-term exercise — if the budget closes, no number in it is independent |

**Honest calculation.** Everything on the first two pages is computed from constants, not quoted:
σ = 5.670374419 × 10⁻⁸ (exact, from the 2019 SI definitions), *R*☉ = 6.957 × 10⁸ m, *T*☉ = 5772 K,
1 AU = 1.495978707 × 10¹¹ m. The two slightly different solar constants in use are reconciled
explicitly on the page — *S*₀ = 1368 W m⁻² (Goosse) gives *T*e = 254.9 K, the modern TSI 1361 gives
254.6 K, a 0.3 K difference invisible at this model's precision.

**Sources.** Goosse et al. (2010) ch. 2, §2.1.1–2.1.2, Eqs. 2.1–2.13, Figs. 2.12–2.19.
Flux values from Wild et al. (2013) as reproduced in Hartmann et al. (2014), AR5 WG1 Fig. 2.11.
Window split from Trenberth, Fasullo & Kiehl (2009). Imbalance and ocean heat uptake from
von Schuckmann et al. (2020). Profile: US Standard Atmosphere (1976). Atmosphere/ocean transport
split after Fasullo & Trenberth (2008); observed fields after Rayner et al. (2003).

**Flagged for your judgement.**

- Zonal albedo and outgoing longwave are representative annual means rounded from CERES EBAF and
  chosen so the global means and the meridional transport come out right — *a teaching dataset, not
  a reanalysis*, and the footer says so.
- The seasonal model is a deliberate caricature: one lumped column, *A* = 130 W m⁻²,
  fixed λ = 9 W m⁻² K⁻¹. Its job is the land/ocean ratio and the phase lag, not absolute temperatures.
- The absorption-band figure is schematic.
- Two different flux sets are in use on different pages (Wild vs. Trenberth–Fasullo–Kiehl); the
  difference is stated where it occurs rather than hidden.

**Questions.** 15 questions across 4 pages, all hidden behind `<details><summary>Answer</summary>`.

---

## 6 · Lecture 3 — Climate at a Local Scale

**Published — `docs/lecture-3-climate-at-a-local-scale/`, 5 pages.**

| Page | Demonstration |
|---|---|
| The surface energy balance — eight real sites | The same surface twelve hours apart: at night *F*solar goes to zero and everything downstream flips sign |
| Sensible and latent heat — the bulk formulas | Four-slider custom conditions off a preset; the fourth term (storage) with a material selector |
| Heat in the ground | Analytic temperature wave at all depths at once, four depths through the cycle, the profile at one moment; Sahara 64 °C / 27 °C, winter soil, snow insulation |
| What the surface does to the radiation | Full observed albedo/emissivity ranges as bars; albedo against solar altitude for six canopies; Beer–Lambert penetration into a canopy by cumulative leaf area |
| Local energy balance explorer | Live diurnal budget canvas over six surfaces — desert, oasis, snow, crop, forest, urban |

**Honest calculation.** Bulk formulas with ρ = 1.15 kg m⁻³, *c*p = 1004 J K⁻¹ kg⁻¹,
*L*v = 2.50 × 10⁶ J kg⁻¹. Soil diffusivity κ is computed on the page as *k*/*C* from Oke's Table 2.1
so the table is internally consistent — it can differ in the last digit from Oke's printed κ column,
which the footer states. Canopy extinction uses *k* = 0.65 direct / 0.33 diffuse, α = 0.15.

**Sources.** Oke, *Boundary Layer Climates* (2nd edn, 1987), Tables 1.1 and 2.1 and the site budgets
used in the EE501 lecture; albedo–altitude curves after Moene & van Dam (2014).

**Flagged for your judgement.**

- Where the lecture gave only one half of a budget, the remaining terms were chosen so the balance
  closes exactly. Those are teaching figures, not published measurements, and the footer labels them.
- The albedo–solar-altitude curves are smooth fits α = α∞ + b·e^(−h/h₀) to the six measured curves,
  drawn only over the altitude range where data exist.
- The spruce profiles are drawn from the shape of the measured figure and are qualitative.
- Presets are plausible midday conditions chosen to reproduce the Bowen ratios quoted in the lecture,
  not a specific instrument record; both bulk formulas assume *c*h = *c*L.

**Questions.** 7 questions, answers currently visible inline in the same box. See §13.

---

## 7 · Lecture 4 — Global Cycles: Water and Carbon

**Published — `docs/lecture-4-global-cycles-water-and-carbon/`, 4 pages.**

| Page | Demonstration |
|---|---|
| The global water balance | The long-term mean hydrological cycle with flux-proportional arrows; the soil water balance integrated a year at a time; E−P and the salinity fingerprint it leaves |
| The global carbon budget | Mauna Loa CO₂ and global CH₄ with the seasonal cycle strippable; **"Make the five numbers add up"** — four sliders and the atmosphere takes the remainder, because carbon is conserved |
| The oceanic carbon cycle | **Seawater chemistry from two numbers and a temperature** — a genuine equilibrium solver |
| Land, rock and methane | The GPP→NPP→NEP→NBP cascade; the methane budget integrating d*B*/d*t* = *S* − *B*/τ forward from today |

**The centrepiece is a real calculation.** The carbonate solver bisects on pH until the alkalinity
expression of Eq. 2.48 is satisfied exactly, then reports the speciation of Eq. 2.45, the partial
pressure of Eq. 2.41, the buffer (Revelle) capacity and the saturation states that follow. Residence
times on page 1 are computed on the page from the diagram's own volumes and fluxes, so they are
internally consistent with the figure rather than quoted from elsewhere.

**Sources.** Ciais et al. (2013), AR5 WG1 ch. 6, Table 6.1 and Fig. 6.1 — the source of Figs. 2.25
and 2.26 in the lecture; Global Carbon Budget 2024 (Friedlingstein et al.) for 2014–2023;
Trenberth et al. (2007) for the water reservoirs; Seneviratne et al. (2010) for the soil box;
Denman et al. (2007) and the Takahashi climatology for the air–sea flux; Randerson et al. (2018)
for GFED fire; AR5 Table 6.8 for the methane budget. 1 ppm = 2.124 PgC throughout.

**Flagged for your judgement.**

- Concentration records are **reconstructed** from published annual means with the observed seasonal
  cycle imposed — read for shape and magnitude, not for a particular month.
- The lecture slide's 1950 ppb CH₄ corresponds to a northern-hemisphere station; the global marine
  surface mean is ~1930 ppb. The page states both and explains the difference rather than picking one.
- The Global Carbon Budget's imbalance term is folded into the land sink so that the five numbers
  close exactly. The "Lecture arithmetic" preset deliberately reproduces the slide's version, which
  omits land-use change — the gap it leaves is the point of the exercise.
- The zonal air–sea flux profile and the NPP field are smoothed/generated to reproduce the structure
  of Figs. 2.27 and 2.28 without being satellite data.
- The carbonate solver neglects pressure, phosphate and silicate alkalinity and fixes salinity at 35:
  *"accurate enough to teach with and not accurate enough to publish with."*

**Questions.** 14 questions, answers currently visible inline. See §13.

---

## 8 · Lecture 5 — Modelling the Climate System

**Published — `docs/lecture-5-modelling-the-climate-system/`, 5 pages.**

| Page | Demonstration |
|---|---|
| Discretising the planet | **Coarsen a landscape and watch the physics leave** — an idealised continent with coastline, range, summit, fjord and island, re-averaged onto your chosen grid |
| The model hierarchy | **Run the zero-dimensional model** — integrate *C* d*T*/d*t* forward, choose what is thermally connected, perturb at year 20 |
| The governing equations of the atmosphere | Seven equations with live numeric substitution, presets, scale analysis, PNG/CSV export, and reflection questions behind a global *Reveal solutions* toggle |
| Components, coupling and scale | Four components and a coupler; **grow some sea ice** over six years; **downscaling** — the model has the grid-box mean of the mountain, not the mountain |
| Does the model work? | **Why the average of many models beats nearly all of them**; **correct a model you cannot fix** — offset, drift and trend, each with its own assumption |

**Honest calculation.** The 0-D model is the standard one with a bulk infrared transmissivity τa,
heat capacities 1.0 × 10⁷ J m⁻² K⁻¹ for an atmospheric column and ρ*c*w*h* with
ρ*c*w = 4.1 × 10⁶ J m⁻³ K⁻¹ for water. The CO₂ perturbation is applied as the τa reduction that
produces 3.7 W m⁻² of OLR reduction. **Its 1.1 K response is the Planck-only sensitivity and the
footer says so explicitly — it is not an estimate of climate sensitivity.** The sea-ice column is a
zero-layer Semtner scheme (*k*i = 2.03, *k*s = 0.31 W m⁻¹ K⁻¹, ρi = 917 kg m⁻³,
*L*f = 3.34 × 10⁵ J kg⁻¹, freezing point −1.8 °C, degree-day melt 2.5 mm K⁻¹ day⁻¹). Cost scaling
assumes an explicit advective CFL limit at 80 m s⁻¹.

**Sources.** Goosse et al. ch. 3.1–3.5, Figs. 3.1–3.25 and Eqs. 3.6–3.11; grid schematic after
McGuffie & Henderson-Sellers (1997); resolutions after Eyring et al. (2016); skill magnitudes from
Flato et al. (2013) and Eyring et al. (2021); saturation vapour pressure from Bolton; ICAO standard
atmosphere.

**Flagged for your judgement.**

- The landscape in the coarsening demo is synthetic — built to make the effect visible, not to be a
  real place. *The grid-box averaging applied to it is exactly what a model does to real orography.*
- The evaluation ensemble is synthetic with a fixed seed: a shared error pattern plus independent
  per-model patterns. The 1/√N cancellation it shows is a property of averaging, not of these
  numbers, and holds for any independent error set. Skill magnitudes are indicative, not statistics.
- The downscaling cross-section is synthetic: realistic elevations and lapse rate, but the
  temperature field is built from the lapse rate alone so the elevation error shows cleanly.
- Snow depth is prescribed rather than accumulated; the ice does not drift, ridge or export.
- The condensation-level rule of thumb (125 m per K of dew-point depression) is good to a few per
  cent for well-mixed boundary layers and no better.

**Questions.** 15 inline questions plus one global *Reveal solutions* toggle on the equations page —
a fourth answer pattern. See §13.

---

## 9 · Lecture 6 — Response of the Climate System to Perturbations

**Published — `docs/lecture-6-response-of-the-climate-system-to-perturbations/`, 6 pages, 11 demonstrations.**

| Page | Demonstration |
|---|---|
| Forcing and feedback | **What is the forcing, exactly?** — the three IPCC formulas with presets; **build a loop and read off its sign** — flip any link and the loop resolves live |
| The forcing agents | Build the AR5 anthropogenic ledger one agent at a time; land use from a local albedo change to a global forcing, in three factors; volcanic against anthropogenic 1850–2020 on one axis |
| The feedback parameter | **Assemble the climate sensitivity** — a waterfall building λf on the left, the warming curve on the right, watching the step spacing grow |
| The physical feedbacks | Where the warming happens in the vertical — drag the profile and watch the lapse-rate feedback flip sign; what a cloud does to the budget as it moves up |
| The transient response | Two climates differing only in sensitivity, driven by the same forcing |
| Biogeochemical feedbacks | **How much of what we emit stays in the air?** — the β–γ loop solved; carbonate compensation as the ocean's own thermostat |

**Honest calculation.** The forcing formulas are the standard IPCC approximations; 5.4 ln 2 = 3.74
W m⁻², quoted as 3.7 throughout to match AR5/AR6. Summing the Soden & Held best estimates gives
λf = −1.26 W m⁻² K⁻¹ and 2.9 K for a doubling — **which lands in the middle of the assessed
1.5–4.5 K range without having been tuned to it.** The transient integrator uses Goosse's worked
values (*C*s = 8.36 × 10⁸ J K⁻¹ m⁻², λf of −1.85 and −0.93) and recovers the analytic step-forcing
solution exactly. The cloud calculator returns a net cloud radiative effect near −20 W m⁻² at the
global-mean preset, matching the observed value.

**Sources.** Goosse et al. ch. 4.1–4.3, Figs. 4.1–4.16, Eqs. 4.1–4.20. Forcing ledger from
Myhre et al. (2013), AR5 Table 8.6 and Fig. 8.15. Feedback values from Soden & Held (2006);
anticorrelation also after Bony et al. (2006). 1750 reference concentrations from Forster et al.
(2007). β–γ framework from Friedlingstein et al. (2006), C4MIP. CaCO₃ budget after
Sarmiento & Gruber (2006). Eruption record after Gao et al. (2008).

**Flagged for your judgement.**

- The listed anthropogenic terms sum to about 2.25 W m⁻² against the published total of 2.29; the
  residual is small terms not shown, and the footer says so rather than fudging the total.
- **The land-use calculator will not reproduce the assessed −0.15 W m⁻² unless you use an effective
  albedo change well below the forest-to-crop contrast — which is the honest situation, since much
  cleared land was grassland to begin with.** That is stated in the footer as a feature.
- The 1850–2020 timeline is a **reconstruction, not a published series**: eruption years and
  approximate peak optical depths are real, the aerosol decay is a one-year e-folding, the solar
  cycle is an 11-year ±0.09 W m⁻² sinusoid, and the anthropogenic curve is interpolated through AR5
  anchor values. Compare shapes and magnitudes; do not read off individual years.
- The inter-model scatter in the lapse-rate/water-vapour panel is synthetic, fixed seed, imposed
  correlation −0.9 — it shows the *shape* of the reported anticorrelation, not any real ensemble.
- Saturation-horizon depths in the carbonate-compensation demo are a schematic linear mapping chosen
  to put the present-day horizon near 3500 m. The direction and the rebalancing are the physics;
  the depths are illustrative.
- Goosse's text uses ΔQ = 3.8 and λ₀ ≈ −3.8; these pages use 3.7 and −3.2. The discrepancy is
  stated on the page rather than quietly reconciled.
- ±0.42 on λf is the individual spreads added in quadrature, which assumes independence between the
  cloud and albedo terms — *"a convenient assumption rather than a demonstrated one."*

**Questions.** 20 inline questions. The TODO singles out `forcing-and-feedback.html` as the clearest
example of a question and its answer sharing one box. See §13.

---

## 10 · Lecture 7 — Climate Change: Past and Present

**Published — `docs/lecture-7-climate-change-past-and-present/`, 6 pages + the provenance appendix.**
(Built as `docs/past-present/`; renamed to the lecture-numbered scheme in the 30 August cleanup pass.)

| Page | Demonstration |
|---|---|
| Forced and internal variability | Lorenz divergence slider; signal-and-noise explorer with time-of-emergence across five spatial scales; timescale spectrum |
| Modes of internal variability | Live equatorial-Pacific cross-section driven by one Niño3.4 slider; Bjerknes sign-counting loop; mode gallery; real event timeline |
| Orbital forcing and the glacial cycles | Exact insolation calculator with PMIP presets; Imbrie–Imbrie ice model with live spectra |
| Abrupt change | Stommel two-box hysteresis + four hosing experiments; bipolar seesaw |
| The Holocene and the last 2000 years | Proxy-sensitivity switcher; last-millennium EBM ensemble with forcings toggleable |
| Detection and attribution | Fingerprint regression with live least squares and 2σ ranges; cherry-picking widget |

**The two centrepieces are honest calculations, not illustrations.** The insolation calculator
evaluates the standard daily-mean integral exactly — 478 W m⁻² at 65°N on the June solstice today,
546 at 127 ka — and its presets are the PMIP protocol values (0 ka: *e* = 0.016764, ε = 23.459°,
ϖ−180° = 102.93°; 6 ka: 0.018682, 24.105°, 0.87°; 21 ka: 0.018994, 22.949°, 114.42°;
127 ka: 0.039378, 24.040°, 275.41°). The ice-model spectra show 23 and 41 kyr going in and a 100-kyr
peak coming out, computed by DFT from the series on screen; set the asymmetry to zero and the peak
disappears. The attribution regression genuinely solves the normal equations: β_GHG = 0.86 ± 0.21,
β_aerosol = 0.69 ± 0.45, residual 0.119 K against 0.11 K of noise.

**Integration rather than duplication.** Every page cross-links into the existing material — the
loop-sign rule and λf from Lecture 6, the insolation geometry from Lecture 2, the Bowen ratio from
Lecture 3, the carbonate chemistry from Lecture 4, the model hierarchy from Lecture 5, and PC Lab 3's
bistability, which page 4 flags as the same mathematics as the AMOC. Page 5's demo explicitly reuses
Lecture 6 page 5's integrator. Part VI was added to the equation summary and a Lecture 7 block to the
landing page.

**Scientific grounding.** Goosse ch. 5, Figs. 5.1–5.44, with the primary literature named:
NGRIP Members (2004), Shakun et al. (2012), Parrenin et al. (2013), Zachos et al. (2008),
Lisiecki & Raymo (2005), Jouzel et al. (2007), Berger (1978), Annan & Hargreaves (2013),
Braconnot et al. (2007), PAGES 2k (2013), Crespin et al. (2013), Masson-Delmotte et al. (2013),
Hartmann et al. (2014), Jones et al. (2013), Hawkins & Sutton (2012). Published models run live:
Lorenz (1963), Stommel (1961), Imbrie & Imbrie (1980), Stocker & Johnsen (2003). Where an
observational record could not be sourced honestly (ice cores, teleconnection maps) the page uses a
computed model or a labelled schematic instead of fake data; the teacher outline flags the four
places where the 2025 deck's maps should be shown instead.

**Flagged for your judgement.**

- **The 800-kyr orbital series in page 3's ice demo is a deliberately truncated synthesis, not
  Berger (1978)** — obliquity as a single 41-kyr sinusoid over 22.25–24.25° peaking 9 kyr ago,
  perihelion precessing uniformly with a 22-kyr period, eccentricity as a 405-kyr plus a 95-kyr term
  over 0.004–0.054. It has the right periods, amplitudes and present-day anchoring but not the exact
  phasing of individual cycles. The figure and the footnote say so in those words, and no date read
  off it should be taken as a real date.
- **Page 5's volcanic forcing uses the real eruption dates — 1258, 1453, 1600, 1641, 1695, 1783,
  1809, 1815, 1835, 1883, 1902, 1963, 1982, 1991 — with representative peak amplitudes (−2 to
  −9 W m⁻², 1.5-year decay) rather than a published reconstruction.** The dates are the reliable part.
- Both demonstrations on page 6 are synthetic, and deliberately so: the true coefficients are 1 by
  construction, so the demo shows how the method behaves rather than reproducing a published value.
  The OLS standard errors assume independent residuals whereas internal variability is autocorrelated,
  so the plotted 2σ ranges are somewhat narrower than a proper treatment would give — stated in the
  footer.
- The Stommel parameters are tuned so the "on" state carries ~18 Sv and collapses near 0.35 Sv of
  hosing: plausible values, neither a measurement, and the caveat box above the demo says so.
- The Greenland, Heinrich and deglaciation figures are labelled schematics. *No axis on them should
  be read as data.*
- Mode index series in the gallery are synthetic realisations with the documented spectral character
  of each mode, labelled *synthetic — character only, not data* inside the figure.

**Private — `lecture-7-climate-change-past-and-present/Lecture7-Teacher-outline.html`.**
Minute-by-minute running order for Wed 16 Sep 08:15–12:00, following the Lecture 6 outline's format:
the one sentence, 25 learning outcomes, six blocks with points/show/ask, a cut list, and the six
questions that will come. `.gitignore` excludes both it and the pptx; `git check-ignore` confirms.

**Questions.** 25 inline questions across the six pages (plus 2 on the appendix). See §13.

---

## 11 · Lecture 8 — Climate Change: the Future

**Published — `docs/lecture-8-climate-change-the-future/`, 7 pages, 11 demonstrations and 14 shorter
interactive panels.** The largest single module and the most heavily sourced.

| Page | Demonstration |
|---|---|
| Scenarios and the forcing chain | **The chain, end to end** — pick an emission pathway and the page runs a real carbon cycle and a real two-layer energy balance to give concentration, forcing and temperature; plus RCP-vs-SSP, the aerosol forcing that goes away, and scenario plausibility |
| Projections, predictions and uncertainty | **Where predictability goes** — two ensembles chasing one "real world", one told where the ocean started; **three sources of uncertainty measured against each other** |
| The geography of warming | **Why land warms faster than ocean** — the moist-static-energy argument in one line, not thermal inertia; **why the Arctic warms fastest** — and why ice–albedo is not the largest term |
| The water cycle response | **The two rates** — 7 %/K moisture against 2–3 %/K precipitation, with the circulation weakening as their difference; wet-gets-wetter and what that sentence actually claims |
| Extremes and distribution shifts | **Moving the distribution** — set a global warming and read exact tail probabilities; event attribution run backwards; rainfall extremes; compound events |
| Cumulative emissions and carbon budgets | **Why cumulative emissions are the thing that matters** — six deliberately different pathways collapsing onto one line; **the remaining carbon budget** in three divisions |
| Commitment, sea level and abrupt change | **The long tail of a carbon pulse** over a million years on a log axis; **marine ice sheet instability** — a threshold produced by geometry alone; sea level; AMOC |

**Published models, run live in the browser.** Joos et al. (2013) four-reservoir CO₂ impulse response
(*a*₀ = 0.2173, (0.2240, 394.4 yr), (0.2824, 36.54 yr), (0.2763, 4.304 yr)); Geoffroy et al. (2013)
two-layer energy balance with the multi-model mean parameters (*C* = 7.3, *C*₀ = 106 W yr m⁻² K⁻¹,
γ = 0.73, efficacy ε = 1.28); Schoof (2007) grounding-line flux law with *n* = 3, *m* = ⅓, giving the
exponent 4.75; Abramowitz & Stegun (1964) 26.2.17 for normal tails, absolute error < 7.5 × 10⁻⁸;
Bolton (1980) for saturation vapour pressure; the Joshi et al. (2008) land–sea argument in the
fixed-relative-humidity form of Byrne & O'Gorman (2013).

**The result worth showing a class.** The extremes demonstration fixes an amplification of 1.3 and
σ = 1.8 K **once**, not per warming level — and with those two numbers alone reproduces all eight
assessed AR6 SPM.3 frequency multipliers. The pathway demonstration prints the cumulative historical
emissions its calibration implies, so a student can compare them against the observed 2400 GtCO₂
themselves.

**Assessed values quoted, not derived** (all IPCC AR6 WG1, 2021): TCRE 1.65 (*likely* 1.0–2.3) K per
1000 PgC; remaining budgets ≈ 500, 850 and 1350 GtCO₂ from 1 Jan 2020 for 1.5, 1.7 and 2.0 °C at 50 %
likelihood; historical warming 1.07 °C for 2010–2019; zero-emissions commitment close to zero;
Earth-system-feedback correction ≈ 26 GtCO₂ per decade; SPM.3 extreme multipliers; hot-day intensity
increases of +1.2, +1.9, +2.6 and +5.1 °C at 1, 1.5, 2 and 4 °C; Table 9.9 sea-level medians and
*likely* ranges plus the low-likelihood high-impact storyline; Table SPM.1 scenario warming.
Also: Armstrong McKay et al. (2022) for tipping elements; Hausfather & Peters (2020) for plausibility;
Allen (2003) and Stott et al. (2004) for probability ratio; Zscheischler et al. (2018) for compound
events; Pithan & Mauritsen (2014) for the ordering of polar-amplification mechanisms;
Held & Soden (2006) and Allen & Ingram (2002) for the two rates; Archer & Brovkin (2008) for the
carbon tail; van Vuuren et al. (2011), Riahi et al. (2017), O'Neill et al. (2016) for the scenarios.

**Deliberately not reproduced.** Goosse Figs. 6.8, 6.10, 6.11, 6.15, 6.21, 6.22, 6.23, 6.24 and
6.25–6.30 are observational-scale model fields. **None is redrawn.** Each page says in prose that the
lecturer shows the original, and builds the equivalent from its own model instead — Fig. 6.24 in
particular is *constructed* by the carbon-budget demo so a student watches the collapse happen rather
than being shown that it did.

**Flagged for your judgement.**

- The six emission pathways and the scenario presets are parametric peak-and-decline shapes tuned to
  reproduce the assessed AR6 warming. **They are not the marker scenario time series.** Non-CO₂
  forcing is prescribed, not computed.
- Because the underlying carbon cycle is linear, the TCRE collapse is cleaner here than in
  comprehensive models where carbon-cycle feedbacks add scatter. The near-linearity is a
  well-established but approximate result, and the footer says so.
- **The split of Joos's non-decaying term *a*₀ into 62 % carbonate compensation (8 kyr e-folding) and
  38 % silicate weathering (300 kyr) is an addition to the published fit, not part of it.** The two
  timescales are Archer & Brovkin's standard values; the split is mine, and the demo plots it
  alongside the unmodified fit so the difference is visible.
- The 0.5 Sv North Atlantic freshwater baseline is representative rather than measured, and the
  hosing range is the span used in model experiments rather than an observed quantity.
- The ice-sheet bed profile is an idealised analytic curve, not a real bed; the prefactor is
  normalised so today's grounding line sits at the outer stable equilibrium. It demonstrates the
  stability criterion, not any particular glacier.
- The zonal P − E figure is a labelled schematic **with no numeric value axis** — the base profile
  carries sign and relative shape only.
- *k* = 2.2 W m⁻² K⁻¹ and *f* = 0.8 in the precipitation constraint are representative values chosen
  to reproduce the Allen & Ingram slow response, not measurements.
- A pure distribution shift cannot reproduce the small extra intensification AR6 assesses for the
  very rarest events, which implies a slight increase in variability in the far tail. That is
  **stated rather than modelled**.
- The predictability series are synthetic with a seeded generator: *no date on them means anything*.

**Private — `lecture-8-climate-change-the-future/Lecture8-Teacher-outline.html`.** Running order for
Thu 17 Sep 08:15–12:00. `git check-ignore` confirms both it and
`Lecture8-Climate-change-the future2026.pptx` are excluded; `git status` shows nothing from that
folder.

**Questions.** 31 questions, **all behind a `Reveal` button** with `aria-expanded` state — the only
lecture already in the target pattern.

**Repository status.** Lecture 8 is currently **untracked** (`?? docs/lecture-8-climate-change-the-future/`),
along with uncommitted edits to `docs/index.html` (Lecture 8 block), `docs/equations/index.html`
(Part VII) and `docs/lecture-7-…/provenance.html` (Lecture 8 rows). `README.md` still says Lecture 8
has no published material — that line needs updating with the commit.

---

## 12 · Shared reference material

**Equation summary — `docs/equations/`, seven parts.**

| Part | Title | Relation to the textbook |
|---|---|---|
| I | The Earth's energy budget | Transcription, ch. 2 |
| II | Heat balance at the surface | Transcription |
| III | The carbon cycle | Covers 2.40–2.49 |
| IV | Radiative forcing | ch. 4.1 |
| V | Feedback and response | ch. 4.1–4.2; uses ΔQ = 3.7 W m⁻² throughout |
| VI | Variability, orbits and attribution | **A companion to Lecture 7, not a transcription of ch. 5** — Chapter 5 sets out the physics largely in words; the Stommel, seesaw and Imbrie–Imbrie relations are the published conceptual models named in the right-hand column |
| VII | Projecting the future | **A companion to Lecture 8, not a transcription of ch. 6** — impulse response, two-layer EBM and grounding-line law are published models named inline; assessed quantities are quoted from AR6, not derived |

**Provenance appendix — `docs/lecture-7-climate-change-past-and-present/provenance.html`.**
Now covers **both** Lectures 7 and 8. Every figure and demonstration classified as one of four kinds:

| Kind | Meaning |
|---|---|
| **Computed** | Evaluated live in the browser from an equation or published model, parameters given |
| **Schematic** | Drawn by hand to carry a shape or a sequence; warned inside the figure, usually no numeric value axis |
| **Real values** | Published numbers quoted or used as parameters — protocol values, assessed trends, event dates |
| **Not reproduced** | Described in prose only, because it is an observational field that cannot be redrawn honestly |

The rule it states once, and which the whole build is held to: *"If a figure on these pages has
numbers on both axes, either it was computed from an equation you are given, or it is labelled inside
the figure as a schematic. There is no third case."*

It is written as teaching, not as a disclaimer — it tells students that a surprising result in a
computed figure says something about the physics, and a surprising detail in a schematic says
something about the person who drew it.

---

## 13 · Open items carried across the whole build

Ordered by how much they affect students.

**1. Question/answer patterns are not harmonised.** Four patterns currently coexist. The intended
target is the reveal button.

| Pattern | Where | Count |
|---|---|---|
| `button.rev` + hidden `.ans` (target) | Lecture 8, all 7 pages | 31 |
| `<details><summary>Answer</summary>` | Lecture 2, 4 pages | 15 |
| One global *Reveal solutions* toggle | `atmospheric-equations` | 1 panel |
| Answer visible inline in the question box | Lectures 3, 4, 5, 6, 7 | **81** |

The TODO names `lecture-6/forcing-and-feedback.html` as the clearest case. Converting Lectures 3–7 to
the Lecture 8 pattern is the single largest remaining content job — roughly 81 question blocks.

**2. No collated reference library.** Every page has a full source note, but there is no single panel
listing the papers used across the course. All the raw material for it is in the 41 footers.

**3. The provenance appendix covers Lectures 7 and 8 only.** Lectures 2–6 have equally careful
footers but no appendix rows. Extending it would make the four-kind classification course-wide.

**4. Teacher outlines are seven separate private files** with no index. The TODO asks for a
teacher-only overview page referencing each. All seven exist and all seven are gitignored:
`Lecture{2,3,4,5,6,7,8}-Teacher-outline.html`.

**5. Slides not yet generated.** The slide-generation prompt is drafted in `TODO.md` (itself
gitignored). The inputs it needs — teacher outlines, interactive material, 2025/2026 PPTX decks —
are all present in the root lecture folders.

**6. No AI-generated-diagram disclaimer.** The provenance appendix does the scientific half of this
job for Lectures 7 and 8. A short statement about how the figures were produced and how closely they
follow the literature is still to be written, and should probably live next to the appendix.

**7. Lecture 8 is uncommitted**, and `README.md` still lists it as unpublished (§11).

**8. Lecture 1 has no material** in either the root or `docs/`. The schedule lists
"Components of the Climate System" on Mon 7 Sep.

---

## 14 · Delivery schedule these materials serve

From the landing page. All Peter Horvath, all week 37–38, room 4-311B for lectures.

| Date | Time | Topic | Material |
|---|---|---|---|
| Mon 7 Sep | 10.15–16 | Components of the Climate System / The Earth's Energy Budget | — / Lecture 2 |
| Tue 8 Sep | 08.15–12 | The Earth's Energy Budget | Lecture 2 |
| Tue 8 Sep | 12.15–16 | Climate at a Local Scale | Lecture 3 |
| Wed 9 Sep | 08.15–12 | Global Cycles: Water and Carbon | Lecture 4 |
| Wed 9 Sep / Thu 10 Sep | 12.15–16 | PC Lab 1: Daisyworld | Lab 1 |
| Thu 10 Sep / Mon 14 Sep | 08.15–12 / 10.15–12 | Modelling the Climate System | Lecture 5 |
| Mon 14 Sep / Tue 15 Sep | 12.15–16 | PC Lab 2: Energy Balance Model | Lab 2 |
| Tue 15 Sep | 08.15–12 | Response of the Climate System to Perturbations | Lecture 6 |
| Wed 16 Sep | 08.15–12 | Climate Change: the Past and Present | Lecture 7 |
| Wed 16 Sep / Thu 17 Sep | 12.15–16 | PC Lab 3: Abrupt Vegetation Collapse | Lab 3 |
| Thu 17 Sep | 08.15–12 | Climate Change: the Future | Lecture 8 |

Every lecture from 8 September onwards now has published interactive material behind it.
