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
 * The links to render, in LINK_LABELS order. Absent and empty-string values
 * drop out, so an entry with no links yields `[]` and the caller renders no
 * container at all.
 */
export function projectLinks(links: ProjectLinks | undefined): RenderedLink[] {
	if (!links) return [];
	const rendered: RenderedLink[] = [];
	for (const key of KEYS) {
		const url = links[key];
		if (typeof url === 'string' && url !== '') {
			rendered.push({ key, label: LINK_LABELS[key], url });
		}
	}
	return rendered;
}
