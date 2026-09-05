// The modal's link row, built from the `links` object in a project's JSON.
//
// Every key is optional and the schema defaults the whole object to `{}`
// (src/content.config.ts), so most entries produce an empty list and the row is
// hidden entirely. Nothing here branches on a project: adding a link to a data
// file is the only edit a new link needs, per PLAN.md §3.3.
//
// The key set is closed by `.strict()` in the schema, so a key with no label
// here is a build failure that names it rather than a link that silently
// vanishes. Keep LINK_LABELS and the schema's `links` object in step.
//
// `isHttpUrl` lives here and the schema imports it, so the scheme rule has one
// home. It is enforced twice on purpose: at the schema, where a bad URL is a
// named build failure, and again here, so a URL that reached this function by
// some other path still never becomes an `href`.

/**
 * Label per link key, and the display order. The order is the schema's own
 * declaration order in src/content.config.ts; nothing about a visitor's likely
 * interest is encoded here.
 *
 * Labels are public text and WRITING.md binds them. Plain nouns only.
 */
export const LINK_LABELS = {
	repo: 'Repository',
	demo: 'Demo',
	release: 'Release',
	video: 'Video',
} as const;

export type LinkKey = keyof typeof LINK_LABELS;

/** The `links` object as the content schema produces it. */
export type ProjectLinks = Partial<Record<LinkKey, string>>;

/** One anchor to render: `key` is for a test or a stable hook, never displayed. */
export type RenderedLink = {
	key: LinkKey;
	label: string;
	url: string;
};

const KEYS = Object.keys(LINK_LABELS) as LinkKey[];

/**
 * Whether a string is a URL this site will put in an `href`.
 *
 * `z.string().url()` is not that test. Measured on the zod 3.25.76 in this
 * repo's `node_modules` on 2026-09-05: it accepts `javascript:alert(1)`,
 * `JavaScript:alert(1)`, `data:text/html,<script>x</script>` and
 * `vbscript:msgbox(1)`. A `javascript:` href built from project data renders
 * verbatim and runs in this origin; today only `target="_blank"` stops it, and
 * that attribute is set for an unrelated reason. Project JSON is machine
 * generated (PLAN.md §3.3), so the scheme is checked rather than trusted.
 *
 * `new URL().protocol` lowercases the scheme, so the check is case-insensitive
 * without a manual `toLowerCase()`. Verified 2026-09-05: `JavaScript:alert(1)`
 * yields `javascript:`.
 */
export function isHttpUrl(value: string): boolean {
	let protocol: string;
	try {
		protocol = new URL(value).protocol;
	} catch {
		return false;
	}
	return protocol === 'http:' || protocol === 'https:';
}

/**
 * The links to render, in LINK_LABELS order. Absent, empty-string and
 * non-http(s) values drop out, so an entry with no links yields `[]` and the
 * caller renders no container at all.
 */
export function projectLinks(links: ProjectLinks | undefined): RenderedLink[] {
	if (!links) return [];
	const rendered: RenderedLink[] = [];
	for (const key of KEYS) {
		const url = links[key];
		if (typeof url === 'string' && url !== '' && isHttpUrl(url)) {
			rendered.push({ key, label: LINK_LABELS[key], url });
		}
	}
	return rendered;
}
