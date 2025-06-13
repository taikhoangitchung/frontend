import "./globals.css";
import React from "react"
import {Toaster} from "sonner";

export const metadata = {
    title: "Quiz App",
    description: "A quiz application built with Next.js and Material-UI",
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body>
        {children}
        <Toaster richColors position="top-center" />
        </body>
        </html>
    );
}
