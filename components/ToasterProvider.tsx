"use client";

import { Toaster } from "react-hot-toast";

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          borderRadius: "0.5rem",
          fontSize: "0.875rem",
        },
        success: {
          style: {
            background: "#ecfdf3",
            color: "#166534",
            border: "1px solid #bbf7d0",
          },
        },
        error: {
          style: {
            background: "#fef2f2",
            color: "#b91c1c",
            border: "1px solid #fecaca",
          },
        },
      }}
    />
  );
}


