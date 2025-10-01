/**
 * Global setup runs once before all tests
 * This ensures usernames are generated once and shared across all test files via environment variables
 */
export default function globalSetup() {
  console.log("[GLOBAL SETUP] Generating test usernames...");
  const timestamp = Date.now();
  const testUsername = `testuser_${timestamp}`;
  const anotherUsername = `anotheruser_${timestamp}`;

  // Store usernames in environment variables for sharing across all test files
  process.env.TEST_USERNAME = testUsername;
  process.env.ANOTHER_USERNAME = anotherUsername;

  console.log("[GLOBAL SETUP] Usernames generated:", {
    testUsername,
    anotherUsername,
  });
}
