const { chromium } = require("playwright");

(async () => {
    const browser = await chromium.launch({ headless: true });
    try {
        const page = await browser.newPage();
        let response;

        for (let attempt = 1; attempt <= 30; attempt += 1) {
            try {
                response = await page.goto("http://php/", {
                    waitUntil: "networkidle",
                    timeout: 10000,
                });
                if (response && response.status() === 200) {
                    break;
                }
            } catch (error) {
                if (attempt === 30) {
                    throw error;
                }
            }
            await new Promise((resolve) => setTimeout(resolve, 2000));
        }

        if (!response || response.status() !== 200) {
            throw new Error(`Unexpected HTTP status: ${response?.status()}`);
        }

        await page.getByText("DB接続成功！").waitFor({ timeout: 10000 });
        await page.getByText("継続的デプロイが成功！").waitFor({ timeout: 10000 });
        await page.getByText("1: Taro Yamada").waitFor({ timeout: 10000 });
        await page.getByText("2: Hanako Suzuki").waitFor({ timeout: 10000 });

        console.log("Playwright test passed: app/index.php is displayed.");
    } finally {
        await browser.close();
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});