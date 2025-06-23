"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"

export default function AuthInitializer() {
    const router = useRouter()

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get("accessToken")
        const refreshToken = params.get("refreshToken")

        if (token && refreshToken) {
            try {
                const decoded = jwtDecode(token)

                localStorage.setItem("token", token)
                localStorage.setItem("refreshToken", refreshToken)
                localStorage.setItem("email", decoded.sub)
                localStorage.setItem("id", decoded.id)
                localStorage.setItem("role", decoded.role)
                localStorage.setItem("username", decoded.username)

                // ✅ Clean URL
                const cleanUrl = window.location.origin + window.location.pathname
                window.history.replaceState({}, document.title, cleanUrl)

                // ✅ Redirect người dùng vào dashboard sau 1 chút
                const target =
                    decoded.role === "ADMIN"
                        ? "/admin/dashboard"
                        : "/users/dashboard"

                setTimeout(() => {
                    router.push(target)
                }, 100)
            } catch (e) {
                console.error("Token không hợp lệ:", e)
            }
        }
    }, [router])

    return null
}