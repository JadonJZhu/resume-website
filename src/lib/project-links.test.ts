// Regression set for the modal link row. `node --test` runs this file directly
// on node 22 with no test framework and no build step. `npm test`.
//
// The case that matters most is the empty one: the three entries live on the
// site today carry no `links` at all, and they must render exactly as they did
// before the row existed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LINK_LABELS, isHttpUrl, projectLinks } from './project-links.ts';

test('no links object yields nothing to render', () => {
	assert.deepEqual(projectLinks(undefined), []);
});

test('the schema default of {} yields nothing to render', () => {
	assert.deepEqual(projectLinks({}), []);
});

test('schema order wins over the order the JSON wrote the keys in', () => {
	assert.deepEqual(
		projectLinks({ demo: 'https://example.com/demo', repo: 'https://example.com/repo' }),
		[
			{ key: 'repo', label: 'Repository', url: 'https://example.com/repo' },
			{ key: 'demo', label: 'Demo', url: 'https://example.com/demo' },
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

// The schema rejects these too (src/content.config.ts), so a real build never
// reaches this branch. It exists because the value ends up in an `href` and the
// only thing stopping a `javascript:` URL from running in this origin today is
// a `target="_blank"` set for an unrelated reason.
test('only http and https survive into an href', () => {
	for (const url of [
		'javascript:alert(1)',
		'JavaScript:alert(1)',
		'data:text/html,<script></script>',
		'vbscript:msgbox(1)',
		'not a url at all',
	]) {
		assert.equal(isHttpUrl(url), false, url);
		assert.deepEqual(projectLinks({ repo: url }), [], url);
	}
	for (const url of ['http://example.com/a', 'https://example.com/a', 'HTTPS://example.com/a']) {
		assert.equal(isHttpUrl(url), true, url);
		assert.equal(projectLinks({ repo: url }).length, 1, url);
	}
});

test('every label is a plain noun with no punctuation or emoji', () => {
	for (const label of Object.values(LINK_LABELS)) {
		assert.match(label, /^[A-Z][a-z]+$/, label);
	}
});
