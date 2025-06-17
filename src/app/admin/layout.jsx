'use client'

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AdminLayout({ children }) {
    const router = useRouter()

    useEffect(() => {
        const role = localStorage.getItem("role")
        if (role !== "ADMIN") {
            router.replace("/forbidden")
        }
    }, [])

    return <>{children}</>
}
