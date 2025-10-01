import path from "path";

export const TESTUSER_FILE = path.join(
  __dirname,
  "../playwright/.auth/user.json"
);
export const ANOTHERUSER_FILE = path.join(
  __dirname,
  "../playwright/.auth/anotheruser.json"
);

// Get usernames from environment variables (set in global setup)
export function getTestUsername(): string {
  const username = process.env.TEST_USERNAME;
  if (!username) {
    throw new Error(
      "TEST_USERNAME environment variable not found. Make sure global setup has run."
    );
  }
  return username;
}

export function getAnotherUsername(): string {
  const username = process.env.ANOTHER_USERNAME;
  if (!username) {
    throw new Error(
      "ANOTHER_USERNAME environment variable not found. Make sure global setup has run."
    );
  }
  return username;
}
