# What Remains Unsaid — content guide

The project uses React, TypeScript, Tailwind CSS and the existing Next-compatible Vinext/Vite runtime. Keep the current lockfile. The deployed site is public; the editing room is owner-only.

## Owner editing room

Open `/admin` and sign in with the owner’s ChatGPT account. Select a work to edit its title, keywords, curator’s note and article in separate fields. Save draft keeps changes private; preview saves and displays the private draft; publish updates the public work. Add works from the collection selector. Forms and navigation work without JavaScript.

D1 `manuscripts` stores drafts and independent published snapshots. Published snapshots override the original source records below. Source file changes do not overwrite an existing database override. Draft-only additions are invisible to public visitors. Revision checks reject stale edits and preserve submitted text for recovery. The Archive editor manages all archive entries and the opening article. Museum and Room editors manage names, introductions, room prefaces, ordering, and new spaces. Publish a Museum before creating rooms within it. Published spaces are selectable in the work editor. Existing room parent and record URLs stay fixed. The documents table stores these separate draft/public snapshots.

The database schema is in `db/schema.ts`; generated migrations in `drizzle/` are packaged with the deployment. Do not change an applied migration.

## Content files

- `src/data/exhibits.ts`: 25 exhibit records — 5 L, 4 E, 5 R, 11 D. All 22 existing works have complete text. D-09 through D-11 remain forthcoming.
- `src/data/articles.ts`: full Chinese texts, original curatorial notes where available, and PDF source page numbers. Edit an article's multiline `fullText` directly. The matching exhibit page updates automatically.
- `src/data/museums.ts`: museum and room records.
- `src/data/archive.ts`: process entries.

Separate paragraphs with a blank line. Single line breaks are preserved. A standalone `## ` heading creates a section heading, used for the two versions of D-01. No other Markdown or HTML is interpreted; text remains escaped.

A future exhibit receives its body by adding its code to `articles` with `fullText` and a verified `sourcePage`. Make its exhibit status `published` if it is no longer forthcoming; existing source-backed entries are marked published automatically. Optional exhibit images use `image` and `imageAlt`.

## Source and editorial decisions

The supplied 53-page PDF is the source. All 22 exhibit bodies were transcribed directly, with multi-column reading order restored, typesetting spaces removed, and wrapped lines rejoined. Original prose was not rewritten. Source glyph counts were checked after excluding display titles and labels.

The user explicitly requested:

- Ignore PDF page 30.
- Remove E-05 / 反锁; it is not an existing work.
- Preserve both independent versions of 向下 on page 45, as 版本一 and 版本二.

Chinese curatorial notes from pp. 15, 17, 19, 21, 23, 32, 34, 36, 38 and 40 replace provisional English notes. Other English curatorial labels remain provisional website copy. Text numbering within the author's prose is preserved even where it differs from the website catalogue (for example 反步).

The room introduction 总序｜身体之后 (p. 44) is readable at `/museum/remains/body-afterward`. The opening article 在尚未形成语言之前 (p. 10) is readable in the archive. Both use expandable reading sections. No text from p. 30 is included.

Canonical exhibit routes use codes, such as `/exhibit/l-01`. Prior descriptive routes redirect to canonical records. `/museum/second` redirects to `/museum/evidence`. Removed E-05 routes show the not-found page. The user's catalogue naming overrides inconsistent PDF headings, including R-05 NAME. Forthcoming burial codes D-09 through D-11 are provisional.

Archive dates remain null because the source does not establish dates. Add an ISO date only when verified. Archive reflections are condensed from the cited pages, not diary quotations.

## Shared presentation

`app/globals.css` holds grayscale tokens, typography, responsive layout, and reduced-motion rules. `src/components/Museum.tsx` provides the shell, index, room and museum headers, exhibit lists, labels, notes and Chinese reading components. Navigation supports keyboard focus and a mobile contents menu.

`public/portfolio/` contains images extracted from the user-supplied PDF. Existing social metadata and older assets are preserved. The full source PDF is not published.

Coming-soon works keep their catalogue labels but have no public link. Canonical and legacy detail URLs return not-found, public metadata omits manuscript notes, and previous/next navigation skips them. Owner editing and private preview retain the full manuscript. Publish a status change to apply it publicly.

Museum/Room editors and lists now link to 管理馆内作品. A native checkbox form moves selected works into the space, with an explicit destination for removed works. Museum selection includes all child rooms and preserves their existing placements. Room removals return to the parent Museum main area. Membership saves update published placement immediately while preserving unpublished text and statuses; drafts remain drafts. A single revision-guarded SQL statement applies all changes atomically.

## Images
Museum, Room and work editors accept JPG, PNG and WebP uploads up to 8 MB. R2 IMAGES stores the bytes; D1 image_assets records metadata. Uploads are initially owner-only. /media/<id> serves visitors only while a published record references that image (Coming Soon work images remain private). Removing or replacing a published association revokes public access when no other published record references it. Drafts keep their own image references and never override the public snapshot. Captions, alt text and crop position are separate fields. Native text saving remains available; uploads use the ImageEditor client. No user assets are generated or inserted on behalf of the owner.
