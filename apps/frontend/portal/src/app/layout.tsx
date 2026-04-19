import { ReactNode } from 'react';
import "./globals.css";

// This layout is a minimal wrapper. 
// Standard localized tags are provided by [locale]/layout.tsx
// Global error/not-found tags are provided by the specific error components.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
