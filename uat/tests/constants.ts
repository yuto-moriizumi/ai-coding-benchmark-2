import path from "path";
import fs from "fs";

export const TESTUSER_FILE = path.join(
  __dirname,
  "../playwright/.auth/user.json"
);
export const ANOTHERUSER_FILE = path.join(
  __dirname,
  "../playwright/.auth/anotheruser.json"
);

// File to store usernames generated during setup
const USERNAMES_FILE = path.join(
  __dirname,
  "../playwright/.auth/usernames.json"
);

// Generate unique usernames for testing
export function generateUsernames() {
  const timestamp = Date.now();
  return {
    testUsername: `testuser_${timestamp}`,
    anotherUsername: `anotheruser_${timestamp}`,
  };
}

// Save usernames to file (called during setup)
export function saveUsernames(usernames: {
  testUsername: string;
  anotherUsername: string;
}) {
  const dir = path.dirname(USERNAMES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(USERNAMES_FILE, JSON.stringify(usernames, null, 2));
}

// Load usernames from file (called during tests)
export function loadUsernames(): {
  testUsername: string;
  anotherUsername: string;
} {
  if (!fs.existsSync(USERNAMES_FILE)) {
    throw new Error(
      `Usernames file not found at ${USERNAMES_FILE}. Make sure setup tests have run.`
    );
  }
  const content = fs.readFileSync(USERNAMES_FILE, "utf-8");
  return JSON.parse(content);
}
