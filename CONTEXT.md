# Instagram Carousel Creator

Hebrew-first (RTL) web app that turns user-written text into styled Instagram carousel images, edited live and exported as PNG files.

## Language

**Carousel**:
The whole work unit: an ordered list of Slides plus a Carousel Title and a Palette. One draft exists at a time.
_Avoid_: Post, project, deck

**Slide**:
A single 1080×1350 image in the Carousel. Holds an optional Heading and a Body, authored manually by the user (no auto-splitting of long text). Max 20 per Carousel (Instagram limit).
_Avoid_: Page, card, image (image = the exported artifact, not the editable unit)

**Heading**:
Optional short title text at the top of a Slide.

**Body**:
The main text of a Slide.

**Carousel Title**:
Metadata only — names the Carousel and prefixes exported filenames (`{title}-1.png`, `{title}-2.png`…). It is *not* rendered on any Slide; there is no cover slide.
_Avoid_: Cover, main title

**Palette**:
One of 10 built-in 5-color sets (snapshot of coolors.co trending). Chosen per Carousel; a Slide may override with a different Palette. Picking a new Carousel Palette restarts the design: all per-Slide Palette and Color Role overrides are cleared.
_Avoid_: Theme, color scheme

**Variation**:
A carousel-wide combination of Color Roles for the chosen Palette — which color is background, text, and accent. Cycled from a curated, contrast-checked list next to the Palette picker. Cycling clears per-Slide Color Role overrides; picking a new Palette resets the Variation.
_Avoid_: Theme, color mode

**Color Role**:
The job a Palette color plays on a Slide: background, text, or accent. User can reassign which Palette color fills which role, per Slide.

**Style Overrides**:
Per-Slide design settings on top of the Carousel defaults: font size, text alignment, Color Role assignment, Palette override. Font family and layout are fixed app-wide (one Hebrew font, one layout).

**Page Badge**:
Small position marker (e.g. "3/8") rendered on each Slide's corner. Carousel-level toggle, on by default.

**Export**:
Rendering Slides to PNG at 1080×1350. "Export all" delivers one ZIP named after the Carousel Title; individual Slides download as single PNGs. Text always fits: font auto-shrinks to a minimum, then the editor warns.
_Avoid_: Generate (there is no generate step — the editor is live)
