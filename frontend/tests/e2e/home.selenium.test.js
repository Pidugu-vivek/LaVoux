import { Builder, By, until } from 'selenium-webdriver';
import { jest, describe, it, beforeAll, afterAll, expect } from '@jest/globals';

// Increase per-test timeout because browser startup can be slow
jest.setTimeout(30000);

describe('Frontend E2E - Home page', () => {
  let driver;
  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173'; // Vite default

  beforeAll(async () => {
    driver = await new Builder().forBrowser('chrome').build();
  });

  afterAll(async () => {
    if (driver) await driver.quit();
  });

  it('should load the app and have a title', async () => {
    await driver.get(baseUrl);
    await driver.wait(until.titleIs('Vite + React'), 10000).catch(() => {});
    const title = await driver.getTitle();
    expect(typeof title).toBe('string');
    expect(title.length).toBeGreaterThan(0);
  });

  it('should render root element', async () => {
    await driver.get(baseUrl);
    const root = await driver.wait(until.elementLocated(By.css('#root')), 10000);
    const displayed = await root.isDisplayed();
    expect(displayed).toBe(true);
  });
});
