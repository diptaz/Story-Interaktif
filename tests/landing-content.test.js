import test from 'node:test';
import assert from 'node:assert/strict';
import { registrationStatus, scholarship, programs, selectionSteps, questions } from '../src/landing-content.js';
import { campusArt, programArt } from '../src/landing-art.js';

test('registration status respects the opening and closing boundaries in WIB', () => {
  const opens = Date.parse(scholarship.opens);
  const closes = Date.parse(scholarship.closes);
  assert.equal(registrationStatus(opens - 1), 'Pendaftaran segera dibuka');
  assert.equal(registrationStatus(opens), 'Pendaftaran dibuka');
  assert.equal(registrationStatus(Date.parse('2026-09-18T12:00:00+07:00')), 'Pendaftaran dibuka');
  assert.equal(registrationStatus(closes), 'Pendaftaran dibuka');
  assert.equal(registrationStatus(closes + 1), 'Periode pendaftaran telah berakhir');
});

test('programs have unique IDs and link only to the official HTTPS portal', () => {
  assert.equal(new Set(programs.map(p => p.id)).size, programs.length);
  assert.deepEqual(programs.map(p => p.id), ['ppti', 'ppbp']);
  for (const program of programs) {
    const url = new URL(program.url);
    assert.equal(url.origin, 'https://karir.bca.co.id');
    assert.ok(program.fullName && program.audience && program.topics.length);
  }
});

test('all selection steps and FAQs have meaningful content', () => {
  assert.equal(selectionSteps.length, 7);
  assert.equal(questions.length, 6);
  selectionSteps.flat().forEach(text => assert.ok(text.trim().length > 5));
  questions.flat().forEach(text => assert.ok(text.trim().length > 10));
});

test('illustrations use distinct local SVG IDs and contain no external assets', () => {
  const hero = campusArt('hero');
  const tour = campusArt('tour');
  assert.match(hero, /id="hero-windows"/);
  assert.match(tour, /id="tour-windows"/);
  assert.doesNotMatch(hero + tour, /https?:|<image|<script/);
  assert.match(programArt('ppti'), /hello_future/);
  assert.match(programArt('ppbp'), /business-chart/);
});
