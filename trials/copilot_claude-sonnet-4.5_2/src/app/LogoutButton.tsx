"use client";

import { logout } from "./actions/auth";

export default function LogoutButton() {
  return (
    <button onClick={() => logout()} className="text-blue-600 hover:underline">
      Logout
    </button>
  );
}
