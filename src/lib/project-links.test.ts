// Regression set for the modal link row. `node --test` runs this file directly
// on node 22 with no test framework and no build step. `npm test`.
//
// The case that matters most is the empty one: the three entries live on the
// site today carry no `links` at all, and they must render exactly as they did
// before the row existed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LINK_LABELS, projectLinks } from './project-links.ts';

test('no links object yields nothing to render', () => {
	assert.deepEqual(projectLinks(undefined), []);
});

test('the schema default of {} yields nothing to render', () => {
	assert.deepEqual(projectLinks({}), []);
});

test('lanewalk renders both of its links in schema order', () => {
	// examples/lanewalk/resume-entry.json, verbatim: demo written before repo.
	assert.deepEqual(
		projectLinks({ demo: 'https://lanewalk.pages.dev', repo: 'https://github.com/JadonJZhu/lanewalk' }),
		[
			{ key: 'repo', label: 'Repository', url: 'https://github.com/JadonJZhu/lanewalk' },
			{ key: 'demo', label: 'Demo', url: 'https://lanewalk.pages.dev' },
		],
	);
});

test('order is LINK_LABELS order, not the order the JSON happened to use', () => {
	const out = projectLinks({
		video: 'https://example.com/v',
		release: 'https://example.com/r',
		demo: 'https://example.com/d',
		repo: 'https://example.com/g',
	});
	assert.deepEqual(
		out.map((link) => link.key),
		Object.keys(LINK_LABELS),
	);
});

test('an empty string is not a link', () => {
	assert.deepEqual(projectLinks({ repo: '' }), []);
});

test('every label is a plain noun with no punctuation or emoji', () => {
	for (const label of Object.values(LINK_LABELS)) {
		assert.match(label, /^[A-Z][a-z]+$/, label);
	}
});
