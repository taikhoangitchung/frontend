'use client'

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {Loader2} from "lucide-react"
import {jwtDecode} from "jwt-decode"
import {kickSocket} from "../../config/socketConfig"
import UserService from "../../services/UserService"

export default function UserLayout({children}) {
    const router = useRouter()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const init = async () => {
            const token = localStorage.getItem("token")
            if (!token) return redirectHome()

            try {
                const decoded = jwtDecode(token)
                if (decoded.role !== "USER") return redirectHome()

                const email = localStorage.getItem("email")
                if (!email) return redirectHome()
                try {
                    const res = await UserService.getAvatar()
                    localStorage.setItem("avatar", res.data)
                } catch (err) {
                    console.warn("Không thể lấy avatar:", err)
                }
                const disconnect = kickSocket({
                    email,
                    onKick: (data) => {
                        if (data === "KICK") {
                            localStorage.clear()
                            router.push("/")
                        }
                    }
                })
                return () => disconnect()
            } catch (err) {
                console.error("Token không hợp lệ:", err)
                return redirectHome()
            } finally {
                setLoading(false)
            }
        }

        const redirectHome = () => {
            router.replace("/forbidden")
        }
        init()
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
