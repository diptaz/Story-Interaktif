import test from 'node:test';
import assert from 'node:assert/strict';
import {
  bkKit,
  bkSummaryText,
  countEvidence,
  evidenceCategories,
  evidenceItems,
  filterEvidence,
  referralLink,
  schoolCode,
} from '../src/outreach-content.js';

test('evidence items cover the proof categories the proposal asks for', () => {
  const needed = ['akademik', 'kehidupan', 'pengembangan', 'magang', 'alumni', 'lulusan'];
  for (const category of needed) {
    assert.ok(evidenceItems.some(item => item.category === category), `belum ada bukti kategori ${category}`);
    assert.ok(evidenceCategories.some(c => c.id === category));
  }
  assert.equal(new Set(evidenceItems.map(i => i.id)).size, evidenceItems.length);
});

test('every evidence card answers who, what, what was learned, and why it matters', () => {
  for (const item of evidenceItems) {
    for (const field of ['who', 'activity', 'title', 'learned', 'journey', 'photo', 'alt']) {
      assert.ok(item[field] && item[field].trim().length > 3, `${item.id} kekurangan ${field}`);
    }
    // Konten contoh wajib ditandai supaya tidak terbaca sebagai testimoni asli.
    assert.equal(item.sample, true, `${item.id} harus ditandai sebagai contoh sampai diganti konten asli`);
  }
});

test('evidence filter and counters follow the category list', () => {
  assert.equal(filterEvidence('semua').length, evidenceItems.length);
  assert.ok(filterEvidence('alumni').every(item => item.category === 'alumni'));
  assert.equal(filterEvidence('kategori-tidak-ada').length, 0);
  const counts = countEvidence();
  assert.equal(counts.reduce((total, c) => total + c.total, 0), evidenceItems.length);
  assert.ok(!counts.some(c => c.id === 'semua'));
});

test('school codes are stable, unique per school, and URL friendly', () => {
  const code = schoolCode('SMAN 1 Kupang');
  assert.equal(code, schoolCode('  sman 1 kupang  '), 'kode harus sama walau spasi/huruf berbeda');
  assert.match(code, /^[A-Z0-9-]+$/);
  assert.notEqual(code, schoolCode('SMAN 2 Kupang'));
  assert.equal(schoolCode(''), '');
  assert.equal(schoolCode('SMK Negeri 3 Banda Aceh'), schoolCode('SMK Negeri 3 Banda Aceh'));
});

test('referral link carries the school code as a query parameter', () => {
  const link = referralLink('SMAN-1-KUPANG-670', 'https://contoh.test/hub');
  assert.equal(new URL(link).searchParams.get('ref'), 'SMAN-1-KUPANG-670');
  assert.equal(new URL(referralLink('', 'https://contoh.test/hub')).search, '');
});

test('BK summary keeps the official source, the deadline, and no personal data request', () => {
  const text = bkSummaryText('SMAN-1-KUPANG-670', 'https://contoh.test/hub?ref=SMAN-1-KUPANG-670');
  assert.ok(text.includes('https://karir.bca.co.id'));
  assert.ok(text.includes('SMAN-1-KUPANG-670'));
  assert.ok(/tanpa pungutan|tanpa biaya/i.test(text));
  assert.ok(!/nomor|NIK|whatsapp siswa/i.test(text));
  assert.ok(bkKit.agenda.length >= 5 && bkKit.points.length >= 4);
});
