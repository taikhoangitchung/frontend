import "./globals.css";
import React from "react";
import { Toaster } from "sonner";
import AuthInitializer from "../components/authInit/AuthInitializer";

export const metadata = {
    title: "Quiz App",
    description: "A quiz application.....",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className="scroll-smooth">
        <head>
            <title>{metadata.title}</title>
        </head>
        <body className="min-h-screen bg-white text-gray-900 antialiased">
        <AuthInitializer /> {/* ✅ Thêm vào đây */}
        {children}
        <Toaster richColors position="top-right" />
        </body>
        </html>
    );
}