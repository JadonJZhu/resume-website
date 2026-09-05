// Regression set for the card scrim. `node --test` runs this file directly on
// node 22 with no test framework and no build step. `npm test`.
//
// The four hostile cases are the ones measured in headless Chrome on
// 2026-09-05; hover-content.ts records what each one did unescaped. They are
// here because nothing constrains these characters in the project JSON and a
// generator writes those files.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cssString, hoverContent } from './hover-content.ts';

test('real data is unchanged', () => {
	assert.equal(
		hoverContent({ title: 'Golotl', role: 'Lead Systems Design Engineer', period: 'Fall 2025' }),
		'"Golotl\\A Lead Systems Design Engineer\\A Fall 2025"',
	);
});

test('an absent role drops its line and its separator', () => {
	assert.equal(hoverContent({ title: 'Golotl', period: 'Fall 2025' }), '"Golotl\\A Fall 2025"');
});

test('a quote cannot close the property or start a second declaration', () => {
	const out = hoverContent({ title: 'Inj";background:red;--x:"', period: 'Fall 2026' });
	// Exactly two unescaped quotes, the ones this function put there itself.
	assert.equal(out.replace(/\\\\/g, '').replace(/\\"/g, '').split('"').length - 1, 2);
	assert.equal(out, '"Inj\\22 ;background:red;--x:\\22 \\A Fall 2026"');
});

test('a segment starting with a hex digit keeps its line break', () => {
	// Without the space after \A the separator would swallow the 3.
	assert.equal(
		hoverContent({ title: 'AA', role: '3D Artist', period: 'Fall 2026' }),
		'"AA\\A 3D Artist\\A Fall 2026"',
	);
});

test('a backslash in the data is not read as an escape', () => {
	assert.equal(cssString('A\\Ab'), 'A\\\\Ab');
});

test('a literal newline becomes a CSS newline instead of killing the rule', () => {
	assert.equal(cssString('A\nB'), 'A\\A B');
	assert.equal(cssString('A\r\nB'), 'A\\A B');
});
