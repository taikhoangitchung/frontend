'use client'

import {useEffect, useState} from "react"
import { useRouter } from "next/navigation"
import {Loader2} from "lucide-react"
import {jwtDecode} from "jwt-decode"

export default function AdminLayout({ children }) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.replace("/forbidden")
            return
        }

        try {
            const decoded = jwtDecode(token)
            const role = decoded.role

            if (role !== "ADMIN") {
                router.replace("/forbidden")
                return
            }
        } catch (e) {
            console.error("Invalid token:", e)
            router.replace("/forbidden")
            return
        }

        setLoading(false)
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
            </div>
        )
    }

    return <>{children}</>
}
