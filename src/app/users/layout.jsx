'use client'

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {Loader2} from "lucide-react"
import {jwtDecode} from "jwt-decode"
import {useKickSocket} from "../../config/socketConfig";

export default function UserLayout({children}) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [email, setEmail] = useState("")

    useEffect(() => {
        const token = localStorage.getItem("token")
        if (!token) {
            router.replace("/forbidden")
            return
        }
        try {
            const decoded = jwtDecode(token)
            const role = decoded.role
            if (role !== "USER") {
                router.replace("/forbidden")
                return
            }
            localStorage.removeItem("hostEmail")
            const email = localStorage.getItem("email")
            setEmail(email)
        } catch (e) {
            console.error("Invalid token:", e)
            router.replace("/forbidden")
            return
        }
        setLoading(false)
    }, [])

    if (email !== "") {
        useKickSocket({
            email,
            onKick: (data) => {
                if (data === "KICK") {
                    localStorage.clear()
                    router.push("/");
                }
            }
        });
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
            </div>
        )
    }

    return <>{children}</>
}
