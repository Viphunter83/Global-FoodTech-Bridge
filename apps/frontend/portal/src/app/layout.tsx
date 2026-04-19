import React from "react";

// This is the absolute root layout for Next.js.
// It must exist to prevent Next.js from auto-generating a layout with its own <html> and <body> tags.
// Since we have those tags in our localized [locale]/layout.tsx, this root layout should simply pass through the children.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
