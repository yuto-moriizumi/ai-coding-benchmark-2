import { generateUsernames, saveUsernames } from "./tests/constants";

/**
 * Global setup runs once before all tests
 * This ensures usernames are generated once and shared across all test files
 */
export default function globalSetup() {
  console.log("[GLOBAL SETUP] Generating test usernames...");
  const usernames = generateUsernames();
  saveUsernames(usernames);
  console.log("[GLOBAL SETUP] Usernames generated:", usernames);
}
