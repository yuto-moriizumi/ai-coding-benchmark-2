"use client";

import { register } from "../actions/auth";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const result = await register(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8">Register</h1>
      {error && (
        <div className="max-w-md mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <form action={handleSubmit} className="max-w-md space-y-4">
        <div>
          <label htmlFor="username" className="block mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            name="username"
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
      <div className="mt-4">
        <Link href="/" className="text-blue-600 hover:underline">
          Back to Blog
        </Link>
      </div>
    </div>
  );
}
