/* globals step, beforeScenario, afterScenario */

const { openBrowser, closeBrowser, goto, write, click, text, into, textBox, button, waitFor, setConfig } = require('taiko');
const assert = require('assert');

const APP_URL = process.env.APP_URL || 'http://localhost:5173';

beforeScenario(async () => {
  await openBrowser({ headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  setConfig({ ignoreSSLErrors: true });
});

afterScenario(async () => {
  await closeBrowser();
});

step("Navigate to <path>", async (path) => {
  await goto(`${APP_URL}${path}`);
  await waitFor(1000);
});

step("Write <value> in the <label> field", async (value, label) => {
  await write(value, into(textBox(label)));
});

step("Click the <label> button", async (label) => {
  await click(button(label));
  await waitFor(500);
});

step("Click link <label>", async (label) => {
  await click(text(label));
  await waitFor(500);
});

step("Verify success message <message>", async (expected) => {
  await waitFor(2000);
  const exists = await text(expected).exists();
  assert.ok(exists, `Expected success message "${expected}" not found`);
});

step("Verify error message <message>", async (expected) => {
  await waitFor(1000);
  const exists = await text(expected).exists();
  assert.ok(exists, `Expected error message "${expected}" not found`);
});

step("Verify page heading <heading>", async (expected) => {
  await waitFor(1000);
  const exists = await text(expected).exists();
  assert.ok(exists, `Expected heading "${expected}" not found`);
});

step("Verify link <label>", async (label) => {
  const exists = await text(label).exists();
  assert.ok(exists, `Expected link "${label}" not found`);
});
