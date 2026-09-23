/// <reference types="node" />

import { chromium, type Page, type Response } from "playwright";

const applicationUrl = "http://php/";

const waitForApplication = async (page: Page): Promise<Response> => {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    console.log(
      `[Playwright] Opening ${applicationUrl} (attempt ${attempt}/30)`,
    );
    try {
      const response = await page.goto(applicationUrl, {
        waitUntil: "networkidle",
        timeout: 10000,
      });

      console.log(
        `[Playwright] HTTP status: ${response?.status() ?? "no response"}`,
      );
      if (response && response.status() === 200) {
        return response;
      }
    } catch (error: unknown) {
      console.error(
        `[Playwright] Navigation failed on attempt ${attempt}: ${formatError(error)}`,
      );
      if (attempt === 30) {
        throw error;
      }
    }

    console.log(
      "[Playwright] Application is not ready; retrying in 2 seconds.",
    );
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  throw new Error("Application did not return HTTP 200 within 60 seconds.");
};

const formatError = (error: unknown): string => {
  return error instanceof Error
    ? `${error.name}: ${error.message}`
    : String(error);
};

const runTest = async (): Promise<void> => {
  console.log(`[Playwright] Starting browser test against ${applicationUrl}`);
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    page.on("console", (message) => {
      console.log(`[Browser console:${message.type()}] ${message.text()}`);
    });
    page.on("requestfailed", (request) => {
      console.error(
        `[Browser request failed] ${request.method()} ${request.url()} - ${request.failure()?.errorText ?? "unknown error"}`,
      );
    });

    const response = await waitForApplication(page);

    if (response.status() !== 200) {
      throw new Error(`Unexpected HTTP status: ${response.status()}`);
    }

    console.log("[Playwright] Verifying expected page text.");
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
  console.error(`[Playwright] Test failed: ${formatError(error)}`);
  if (error instanceof Error && error.stack) {
    console.error(error.stack);
  }
  process.exitCode = 1;
});
