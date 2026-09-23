/// <reference types="node" />

import { chromium, type Page, type Response } from "playwright";

const applicationUrl = "http://php/";

const waitForApplication = async (page: Page): Promise<Response> => {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      const response = await page.goto(applicationUrl, {
        waitUntil: "networkidle",
        timeout: 10000,
      });

      if (response && response.status() === 200) {
        return response;
      }
    } catch (error) {
      if (attempt === 30) {
        throw error;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Application did not return HTTP 200 within 60 seconds.");
};

const runTest = async (): Promise<void> => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const response = await waitForApplication(page);

    if (response.status() !== 200) {
      throw new Error(`Unexpected HTTP status: ${response.status()}`);
    }

    await page.getByText("DB接続成功！").waitFor({ timeout: 10000 });
    await page.getByText("継続的デプロイが成功！").waitFor({ timeout: 10000 });
    await page.getByText("1: Taro Yamada").waitFor({ timeout: 10000 });
    await page.getByText("2: Hanako Suzuki").waitFor({ timeout: 10000 });

    console.log("Playwright test passed: app/index.php is displayed.");
  } finally {
    await browser.close();
  }
};

runTest().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
