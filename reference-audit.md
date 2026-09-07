# EE501 reference audit notes

This file is for instructor follow-up. It is intentionally outside `docs/` so it does not appear on the published student-facing site.

## Status after the 2026-09-08 sweep

`docs/references.html` was rebuilt from a verified record set and now holds **69 records** (5 texts,
8 assessments/data products, 56 journal articles) plus a visible "still to confirm" list. **61 DOIs were
resolved directly against the Crossref REST API** in that pass, and every report/dataset URL was checked
to return HTTP 200. Every "cited on" claim was checked against the page it names.

Closed by that sweep:

- **Oke (1987) "Identifier pending"** — replaced with ISBN 0-415-04319-0 and the LCCN, from the confirmed
  book record below.
- **Which Goosse edition** — both are now listed separately and the difference is stated on the page: the
  2010 open edition is what the page-level source notes and the equation numbering follow; the 2015
  Cambridge book is the set text. The one place they diverge is the detection-and-attribution regression
  on the equation summary (§5.4, Fig. 5.43), which exists only in the 2015 book — the 2010 Chapter 5 ends
  at §5.5.3 / Fig. 5.32. Both pages now say so. **Worth confirming Fig. 5.43 against your printed copy.**
- **Bonan (2016) not cited anywhere** — now carries a record with its ISBNs and the Cambridge DOI, and the
  entry says plainly that no page cites it yet.
- **Abbreviated classic citations** — Rahmstorf (2002), Kuhlbrodt et al. (2007) and the Takahashi
  climatology are now full records with verified DOIs. Ruddiman (2001, 2005) stays open (books).
- **Report-style sources** — IPCC AR4/AR5/AR6 WG1 and the Global Carbon Budget now have report-level
  entries with stable URLs, with the chapter names listed inside the entry rather than guessed at
  chapter DOIs. Berkeley Earth is cited via Rohde & Hausfather (2020).
- **The KPI counts** were stale (46 pages / 14 DOIs) and are now recomputed (47 pages / 61 DOIs).

Still open:

- Ruddiman (2001, 2005) and McGuffie & Henderson-Sellers (1997): edition/printing not checked against a
  copy.
- Ekman (1905) and Sonntag (1990): pre-DOI or absent from Crossref; no verified identifier.
- GFED4.1s has a DataCite DOI, not a Crossref one, so it is linked to the project site instead.

## Flagged items for manual completion

### Books and textbook-derived demonstrations

These pages are scientifically grounded, but the right identifier is a textbook edition, chapter, or stable report URL rather than a journal DOI:

- `docs/lecture-3-climate-at-a-local-scale/energy-balance.html`
- `docs/lecture-3-climate-at-a-local-scale/soil-temperature.html`
- `docs/lecture-3-climate-at-a-local-scale/surface-properties.html`
- `docs/lecture-3-climate-at-a-local-scale/turbulent-fluxes.html`
- most Goosse-derived equation pages

Action: ISBN/publisher details for Oke, Goosse, and Bonan are now confirmed from the printed title pages (see "Confirmed book records" below). Remaining work is adding stable chapter URLs where you want a full library-grade citation.

### Confirmed book records

Transcribed directly from the printed copyright/title pages (2026-09-03). These are verified against the physical books, not looked up, so they can be used as-is in a bibliography.

**Oke, T. R. (1987).** *Boundary Layer Climates*, 2nd edition. Methuen, London; reprinted by Routledge, London and New York.
- First published 1978 by Methuen & Co. Ltd; second edition 1987; reprinted 1990, 1992, 1993, 1995 by Routledge (11 New Fetter Lane, London EC4P 4EE; 29 West 35th Street, New York, NY 10001).
- (c) 1978, 1987 T. R. Oke. Printed and bound in Great Britain at the University Press, Cambridge.
- ISBN 0-415-04319-0. LCCN 87-5608. LC class QC981.7.M5034 1987. Dewey 551.6'6.

**Goosse, H. (2015).** *Climate System Dynamics and Modelling*. Cambridge University Press, Cambridge.
- First published 2015. (c) Hugues Goosse, Universite catholique de Louvain.
- ISBN 978-1-107-08389-9 (hardback); ISBN 978-1-107-44583-3 (paperback).
- Title page: https://www.cambridge.org/9781107445833 - Additional resources: https://www.cambridge.org/goosse
- LCCN 2015009564. LC class QC874.5.G66 2015. Dewey 551.601'5118.

**Bonan, G. B. (2016).** *Ecological Climatology: Concepts and Applications*, 3rd edition. Cambridge University Press, New York.
- First published 2016. (c) Gordon Bonan 2016. Printed by Sheridan Books, Inc., USA.
- ISBN 978-1-107-04377-0 (hardback); ISBN 978-1-107-61905-0 (paperback).
- Title page: https://www.cambridge.org/9781107619050 - Additional resources: https://www.cambridge.org/bonan3
- LCCN 2015012684. LC class QK754.5.B66 2015. Dewey 581.7'22.

Follow-up items raised by these records:

- `docs/references.html` line 218 lists Oke (1987) with "Identifier pending". That can now be replaced with the ISBN and publisher above.
- `docs/references.html` line 212 cites **Goosse et al. (2010)**, the open online textbook (*Introduction to Climate Dynamics and Climate Modelling*, https://www.elic.ucl.ac.be/textbook/index.html). The printed book above is a different work: single-author, retitled, Cambridge 2015. Decide which one the "Goosse-derived equation pages" actually follow, and cite the two separately if both are used.
- Bonan (2016) is not currently cited on any page under `docs/`. If it is a course source, it still needs page-level source notes and a `docs/references.html` entry.

### Older or abbreviated classic citations

These references were named in page footnotes but remain too abbreviated on-page to promote automatically to a complete bibliography record without a manual title check:

- Ruddiman (2001)
- Ruddiman (2005)
- Rahmstorf (2002)
- Kuhlbrodt et al. (2007)
- Takahashi climatology
- model references summarized on `docs/lecture-7-climate-change-past-and-present/provenance.html`

Action: expand these to full author-title-journal form before adding DOI links.

### Report-style sources where URL is better than DOI shorthand

For these, a stable public report or chapter URL is usually more useful for students than a DOI alone:

- IPCC AR5 WG1 chapters used across Lectures 2, 4, 6, 7, and 8
- IPCC AR6 WG1 chapters and annex material
- Global Carbon Budget releases
- Berkeley Earth updates

Action: add stable report links alongside page-level source notes where students should open the original assessment directly.

### Physics-first pages

These pages are backed mainly by first-principles derivations or textbook equations rather than a single paper:

- `docs/lecture-2-earths-energy-budget/stefan-boltzmann.html`
- `docs/lecture-2-earths-energy-budget/thermal-emitters.html`
- `docs/lecture-5-modelling-the-climate-system/what-is-a-model.html`
- `docs/lecture-5-modelling-the-climate-system/atmospheric-equations/index.html`
- `docs/lecture-6-response-of-the-climate-system-to-perturbations/transient-response.html`

Action: keep the footer note explicit that these are computed from stated constants or from Goosse equations, and only add a paper citation where a figure or parameter set actually comes from one.