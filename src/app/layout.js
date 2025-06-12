import "./globals.css";
import Navbar from "../components/Navbar";
import React from "react"

export const metadata = {
    title: "Quiz App",
    description: "A quiz application built with Next.js and Material-UI",
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body>
        <Navbar/>
        {children}
        </body>
        </html>
    );
}
