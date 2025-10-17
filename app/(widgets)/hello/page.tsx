// app/(widgets)/hello/page.tsx
import React from "react";

export default function HelloPage({
  searchParams,
}: {
  searchParams: { name?: string };
}) {
  const name = searchParams?.name ?? "friend";
  return (
    <main style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1>👋 Hello, {name}</h1>
      <p>This widget is rendered inside ChatGPT via MCP.</p>
      <Counter />
    </main>
  );
}

"use client";
import { useState } from "react";

function Counter() {
  const [n, setN] = useState(0);
  return (
    <div style={{ marginTop: 12 }}>
      <button
        onClick={() => setN((x) => x + 1)}
        style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ccc" }}
      >
        Clicks: {n}
      </button>
    </div>
  );
}
