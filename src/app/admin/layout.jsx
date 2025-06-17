'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import {AppSidebar} from "../../components/AppSidebar/sidebarAdmin"
import {AppHeader} from "../../components/AppHeader/headerAdmin"

export default function AdminLayout({ children }) {
    const router = useRouter()

    useEffect(() => {
        const role = localStorage.getItem("role")
        if (role !== "ADMIN") {
            router.replace("/forbidden")
        }
    }, [])

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Sidebar */}
            <AppSidebar />

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                <AppHeader />

                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
