import "./globals.css";
import React from "react"

export const metadata = {
    title: "Quiz App",
    description: "A quiz application built with Next.js and Material-UI",
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body>
        {children}
        </body>
        </html>
    );
}
