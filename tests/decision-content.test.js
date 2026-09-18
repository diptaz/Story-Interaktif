import test from 'node:test';
import assert from 'node:assert/strict';
import {
  afterProgram,
  eligibilityQuestions,
  evaluateEligibility,
  filterCities,
  groupByRegion,
  parentFacts,
  parentSummaryText,
  regions,
  testCities,
} from '../src/decision-content.js';

test('test cities cover every region, have no duplicates, and tag their programs', () => {
  assert.ok(testCities.length >= 55, 'daftar kota tes terlalu sedikit');
  assert.equal(new Set(testCities.map(c => c.city)).size, testCities.length);
  for (const item of testCities) {
    assert.ok(regions.includes(item.region), `wilayah tidak dikenal: ${item.region}`);
    assert.ok(item.programs.length && item.programs.every(p => ['ppti', 'ppbp'].includes(p)));
  }
  // Setiap wilayah harus terwakili supaya klaim "tersebar di Indonesia" bisa dibuktikan.
  for (const region of regions) assert.ok(testCities.some(c => c.region === region), region);
});

test('city search matches by city or region and respects the program filter', () => {
  assert.deepEqual(filterCities('kupang').map(c => c.city), ['Kupang']);
  assert.ok(filterCities('sulawesi').length >= 5);
  assert.ok(filterCities('  MERAUKE ').length === 1, 'pencarian harus tahan spasi dan huruf besar');
  assert.equal(filterCities('kota-yang-tidak-ada').length, 0);

  const ppti = filterCities('', 'ppti');
  const ppbp = filterCities('', 'ppbp');
  assert.ok(ppbp.length > ppti.length, 'PPBP punya kota tambahan pada catatan terakhir');
  assert.ok(!ppti.some(c => c.city === 'Jakarta'));
  assert.ok(ppbp.some(c => c.city === 'Jakarta'));
  assert.equal(filterCities('', 'all').length, testCities.length);
});

test('grouping keeps region order and drops empty regions', () => {
  const groups = groupByRegion(filterCities('papua'));
  assert.equal(groups.length, 1);
  assert.equal(groups[0].region, 'Maluku & Papua');
  assert.deepEqual(groupByRegion().map(g => g.region), regions);
});

test('eligibility self-check reports partial, fit, check, and not-yet states', () => {
  const all = (value) => Object.fromEntries(eligibilityQuestions.map(q => [q.id, value]));

  const empty = evaluateEligibility({});
  assert.equal(empty.status, 'partial');
  assert.equal(empty.answered, 0);

  const fit = evaluateEligibility(all('ya'));
  assert.equal(fit.status, 'fit');
  assert.equal(fit.blockers.length, 0);

  const oneBlocker = evaluateEligibility({ ...all('ya'), usia: 'tidak' });
  assert.equal(oneBlocker.status, 'check');
  assert.equal(oneBlocker.blockers.length, 1);

  const many = evaluateEligibility({ ...all('ya'), usia: 'tidak', rapor: 'tidak', komitmen: 'tidak' });
  assert.equal(many.status, 'not-yet');
  assert.equal(many.blockers.length, 3);
});

test('after-program and parent content stay honest about trade-offs and the official source', () => {
  assert.ok(afterProgram.facts.length >= 4 && afterProgram.tradeoffs.length >= 3);
  assert.ok(afterProgram.facts.some(([title]) => /non-gelar/i.test(title)));
  assert.ok(afterProgram.facts.some(([, text]) => /bukan jaminan|kesempatan/i.test(text)));

  const summary = parentSummaryText();
  assert.ok(summary.includes('https://karir.bca.co.id'));
  assert.ok(/tanpa pungutan|tanpa biaya/i.test(summary));
  assert.ok(parentFacts.length >= 5);
  parentFacts.flat().forEach(text => assert.ok(text.trim().length > 10));
});
