// The card scrim text, built at build time as one CSS custom property.
//
// The value lands in a `style` attribute on the card, so every character in it
// is parsed by the CSS parser. Project data is written by a generator from
// generated project text and the schema constrains none of these characters, so
// each segment is escaped for a CSS string before it goes in. HTML escaping is
// not enough on its own: Astro turns a `"` in the data into `&#34;`, which the
// CSS parser still reads as a real quote.
//
// Measured in headless Chrome on 2026-09-05, reading
// `getComputedStyle(el, '::after').content` and the card's own
// `backgroundColor`. Unescaped, all four of these are wrong:
//   title `Inj";background:red;--x:"` -> the property closes early and
//     `background: red` is applied to the card as a second, live declaration
//   role `3D Artist` -> the `\A` separator swallows the `3` as a hex digit and
//     the line break with it: `AA਽Artist`
//   title `A\Ab` -> the backslash is read as an escape: `A«`
//   title with a literal newline -> the whole declaration is dropped and the
//     scrim renders `content: none`, blank
// Escaped, all four render as the literal text and the card keeps its own
// background. `hover-content.test.ts` holds these four as a regression set.

/** Escape a data string so it is inert inside a CSS string literal. */
export function cssString(value: string): string {
	return value
		.replace(/\\/g, '\\\\')
		.replace(/"/g, '\\22 ')
		.replace(/\r\n|[\r\n]/g, '\\A ');
}

/** The fields of a project entry the scrim reads. */
export type HoverFields = {
	title: string;
	period: string;
	/** Absent for solo work; its line and its separator drop out with it. */
	role?: string | undefined;
};

/**
 * `"<title>\A <role>\A <period>"`, ready to be interpolated into a `style`
 * attribute after `--hover-content: `.
 *
 * The separator is `\A` plus one space. The space is the escape's terminator
 * and is eaten by the CSS parser, so it is not a space in the rendered text;
 * without it the escape runs on into a segment that starts with a hex digit.
 */
export function hoverContent(data: HoverFields): string {
	const segments = [data.title, data.role, data.period].filter(
		(segment): segment is string => segment !== undefined,
	);
	return `"${segments.map(cssString).join('\\A ')}"`;
}
