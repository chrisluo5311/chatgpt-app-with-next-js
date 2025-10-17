// app/(widgets)/hello/page.tsx
"use client";

import React, { useState } from "react";

export default function HelloPage({
  searchParams,
}: {
  searchParams: { name?: string };
}) {
  const name = searchParams?.name ?? "friend";
  const [n, setN] = useState(0);

  return (
    <main style={{ padding: 16, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ margin: 0 }}>👋 Hello, {name}</h1>
      <p style={{ marginTop: 8 }}>
        This widget is rendered from your Next.js app inside ChatGPT via MCP.
      </p>
      <div style={{ marginTop: 12 }}>
        <button
          onClick={() => setN((x) => x + 1)}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
        >
          Clicks: {n}
        </button>
      </div>
    </main>
  );
}
