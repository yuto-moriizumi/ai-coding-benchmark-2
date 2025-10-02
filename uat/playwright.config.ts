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
        env: {
          NEXT_PUBLIC_DISABLE_DEV_OVERLAY: '1',
        },
      },
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "NEXT_PUBLIC_DISABLE_DEV_OVERLAY=1 npm run dev",
    port: 3000,
    cwd: process.env.WEB_APP_PATH,
    reuseExistingServer: true,
    env: {
      NEXT_PUBLIC_DISABLE_DEV_OVERLAY: '1',
    },
  },
};

export default config;
