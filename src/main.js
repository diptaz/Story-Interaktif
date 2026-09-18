import './styles/tokens.css';
import './styles/base.css';
import './styles/landing.css';
import './styles/landing-editorial.css';
import './styles/decision.css';
import './styles/outreach.css';
import { createLanding } from './landing.js';

const landingRoot = document.querySelector('#landing');
const storyApp = document.querySelector('#story-app');
let storyStarted = false;

function returnToScholarshipPage() {
  // Releases WebGL, audio, and scene listeners; story progress remains in localStorage.
  history.replaceState(null, '', '#campus-tour');
  location.reload();
}

async function startTour(resumeRoute = 'intro') {
  if (storyStarted) return;
  storyStarted = true;
  landingRoot.hidden = true;
  storyApp.hidden = false;
  document.body.classList.add('story-mode');
  window.scrollTo(0, 0);

  const loading = document.createElement('div');
  loading.className = 'tour-bootstrap';
  loading.setAttribute('role', 'status');
  loading.textContent = 'Menyiapkan kisah awardee…';
  storyApp.append(loading);
  try {
    // Three.js, GSAP, audio and the story content are not needed on the homepage.
    const { mountTour } = await import('./tour-app.js');
    loading.remove();
    await mountTour({ resumeRoute, onHome: returnToScholarshipPage });
  } catch (error) {
    console.error('[Kisah Awardee] Unable to start:', error);
    loading.remove();
    const message = document.createElement('div');
    message.className = 'tour-bootstrap tour-bootstrap--error';
    message.setAttribute('role', 'alert');
    const title = document.createElement('h2');
    title.textContent = 'Cerita interaktif belum dapat dibuka.';
    const hint = document.createElement('p');
    hint.textContent = 'Periksa koneksi atau coba browser yang mendukung WebGL. Informasi beasiswa tetap dapat dibaca.';
    const back = document.createElement('button');
    back.textContent = 'Kembali ke informasi beasiswa';
    back.addEventListener('click', returnToScholarshipPage);
    message.append(title, hint, back);
    storyApp.append(message);
    back.focus();
  }
}

createLanding(landingRoot, {
  onTour: () => {
    history.replaceState(null, '', '#tour');
    startTour();
  },
});

// Legacy developer links continue to work after the participant-card gate.
const hashRoute = location.hash.slice(1);
if (hashRoute === 'tour' || hashRoute === 'intro' || hashRoute === 'outro' || /^chapter-\d+$/.test(hashRoute)) {
  startTour(hashRoute === 'tour' ? 'intro' : hashRoute);
}
