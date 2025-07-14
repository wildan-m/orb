// Initialize Sentry
const SENTRY_DSN = ''; // TODO: Replace with actual Sentry DSN
const API_ENDPOINT = ''; // TODO: Replace with Replit URL

if (SENTRY_DSN) {
  import('https://browser.sentry-cdn.com/7.54.0/bundle.min.js').then((Sentry) => {
    Sentry.init({
      dsn: SENTRY_DSN,
      release: '0.3.0',
      environment: 'beta'
    });
  });
}

// Core functionality
async function scanVideo(videoId) {
  try {
    const response = await fetch(`${API_ENDPOINT}/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content
      })
    });
    return await response.json();
  } catch (error) {
    Sentry?.captureException(error);
    console.error('Scan failed:', error);
    return null;
  }
}

async function getVideoTags(videoId) {
  try {
    const response = await fetch(`${API_ENDPOINT}/getTags?videoId=${videoId}`);
    return await response.json();
  } catch (error) {
    Sentry?.captureException(error);
    console.error('Failed to get tags:', error);
    return { tag: null };
  }
}

// Badge management
function createBadge(tag, score) {
  const badge = document.createElement('div');
  badge.className = 'orb-badge';
  badge.innerHTML = `
    <img src="${chrome.runtime.getURL(`icons/icon48.png`)}" alt="ORB Badge">
    <span class="orb-tag">${tag}</span>
    <span class="orb-score">${score}/10</span>
  `;
  return badge;
}

// YouTube integration
function addBadgeToVideo() {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get('v');
  if (!videoId) return;

  getVideoTags(videoId).then(tagData => {
    if (!tagData.tag) {
      scanVideo(videoId).then(newTagData => {
        if (newTagData?.tag) {
          const badge = createBadge(newTagData.tag, newTagData.score);
          document.querySelector('#above-the-fold')?.appendChild(badge);
        }
      });
    } else {
      const badge = createBadge(tagData.tag, tagData.score);
      document.querySelector('#above-the-fold')?.appendChild(badge);
    }
  });
}

// Initialize
window.addEventListener('yt-navigate-finish', addBadgeToVideo);
document.addEventListener('DOMContentLoaded', addBadgeToVideo);