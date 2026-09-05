import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// One JSON file per project. The filename stem is the entry `id` and therefore
// the project's slug, so nothing inside the file has to repeat it.
//
// Why one file per project rather than one array file: a corrupt append to a
// single array file loaded by `file()` exits 0 either way. It ships stale data
// where Astro's content store survives and ships ZERO projects where it does
// not, saying `Complete!` in both cases. `glob()` exits 1 and names the file and
// the byte offset. Measured 2026-09-05; PLAN.md §4 Step 2 owns this.
//
// Every object is `.strict()` on purpose. Without it zod silently strips an
// unmodelled key, so a generator that emitted a new link type would have it
// vanish with no log line. Strict turns that into a build failure that names the
// key.
const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: z
    .object({
      // `slug` and `_note` are modelled and ignored solely so a resume-entry.json
      // written by the publish contract (riot/PUBLISHING.md §5) drops in
      // unmodified. Nothing reads either one; the filename is the slug.
      slug: z.string().optional(),
      _note: z.string().optional(),

      title: z.string(),
      period: z.string(), // display string, e.g. "Fall 2025"
      blurb: z.string(),
      skills: z.array(z.string()),

      // Omitted for solo work; the card overlay drops the line when it is absent.
      role: z.string().optional(),

      // The publish contract emits no ordering field, so this is optional and an
      // entry without it sorts last, ties broken by `id`.
      order: z.number().optional(),

      // Set only by the three projects that predate the contract and whose blurb
      // is still hand-written HTML with inline anchors. A contract-written blurb
      // is plain text and is rendered with textContent; see Projects.astro.
      // Removing the last `true` here is riot/PLAN.md §7's blurb question.
      legacyHtmlBlurb: z.boolean().default(false),

      links: z
        .object({
          repo: z.string().url().optional(),
          demo: z.string().url().optional(),
          release: z.string().url().optional(),
          video: z.string().url().optional(),
        })
        .strict()
        .default({}),

      // Plain `public/` paths, not `image()`. `image()` cannot carry video at all
      // (VALID_INPUT_FORMATS, astro/dist/assets/consts.js) and passes an mp4
      // through as a raw relative string with exit 0, and a missing asset under
      // `image()` fails the whole build rather than one card. Measured 2026-09-05.
      hero: z
        .object({
          poster: z.string(), // a /public path; the still shown on the card today
          video: z.string().optional(), // mp4; when present the card plays it
          webm: z.string().optional(),
          alt: z.string().optional(), // absent falls back to `${title} Project`
        })
        .strict(),
    })
    .strict(),
});

export const collections = { projects };
