const { openBrowser, closeBrowser, goto, setConfig } = require('taiko');

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

async function openApp() {
  await openBrowser({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  setConfig({ ignoreSSLErrors: true });
}

async function closeApp() {
  await closeBrowser();
}

async function navigate(path) {
  await goto(`${APP_URL}${path}`);
}

module.exports = { openApp, closeApp, navigate, APP_URL };
