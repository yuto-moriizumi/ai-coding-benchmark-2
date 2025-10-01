import type { PlaywrightTestConfig } from "@playwright/test";
import { devices } from "@playwright/test";

const config: PlaywrightTestConfig = {
  testDir: "./tests",
  timeout: 5 * 1000,
  expect: {
    timeout: 5000,
  },
  fullyParallel: true,
  retries: 0,
  workers: 1,
  reporter: [["html", { open: "never" }]],
  use: {
    actionTimeout: 0,
    trace: "on-first-retry",
  },
  projects: [
    // Setup project
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    port: 3000,
    cwd: process.env.WEB_APP_PATH,
    reuseExistingServer: true,
  },
};

export default config;
