import { getCurrentUser } from "./auth";

export async function getServerSideCurrentUser() {
  return getCurrentUser();
}
