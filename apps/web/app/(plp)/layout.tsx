import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "PLP",
  description: "product list page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <header className="main-header">header</header>

      <main className="main-content">{children}</main>

      <footer className="main-footer">footer</footer>
    </div>
  );
}
