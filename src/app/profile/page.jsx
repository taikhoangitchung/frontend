"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import UserService from "../../services/UserService"
import { toast } from "sonner"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {faEdit, faEnvelope, faCalendarAlt, faArrowLeft} from "@fortawesome/free-solid-svg-icons"

const Profile = () => {
    const router = useRouter()
    const [userInfo, setUserInfo] = useState({
        email: "",
        username: "",
        avatar: "",
        quizCount: 0,
        createdAt: null,
        role: "" // Thêm role vào state
    })
    const [loading, setLoading] = useState(true)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUserEmail = localStorage.getItem("currentUserEmail")
            if (!storedUserEmail) {
                router.push("/login")
                return
            }

            const storedUsername = localStorage.getItem("currentUserUsername") || ""
            const storedAvatar = localStorage.getItem("currentUserAvatar") || ""
            const storedRole = localStorage.getItem("role") || "" // Lấy role từ localStorage
            const defaultAvatar = "http://localhost:8080/media/default-avatar.png"

            setUserInfo((prev) => ({
                ...prev,
                email: storedUserEmail,
                username: storedUsername,
                avatar: storedAvatar || defaultAvatar,
                role: storedRole // Gán role từ localStorage
            }))

            UserService.getProfile(storedUserEmail)
                .then((response) => {
                    const user = response.data
                    setUserInfo({
                        email: storedUserEmail,
                        username: user.username || storedUsername || "Người dùng",
                        avatar: user.avatar ? `http://localhost:8080${user.avatar}` : defaultAvatar,
                        quizCount: user.quizCount || 0,
                        createdAt: user.createdAt || null,
                        role: user.role || storedRole // Ưu tiên role từ response, nếu không có thì dùng từ localStorage
                    })
                })
                .catch((err) => {
                    toast.error("Không thể tải thông tin profile")
                })
                .finally(() => {
                    setLoading(false)
                    setIsReady(true)
                })
        }
    }, [router])

    const handleBackToDashboard = () => {
        const roleFromStorage = localStorage.getItem("userRole") ||
            localStorage.getItem("role") ||
            localStorage.getItem("user_role")

        if (roleFromStorage === "ADMIN" || roleFromStorage === "admin") {
            router.push("/admin/dashboard")
        } else {
            router.push("/users/dashboard")
        }
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Không xác định"
        try {
            const date = new Date(dateString)
            const day = String(date.getDate()).padStart(2, '0')
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const year = date.getFullYear()
            return `${day}-${month}-${year}`
        } catch (error) {
            return "Không xác định"
        }
    }

    if (!isReady || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Profile Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex items-start justify-between">
                        {/* Left side - Avatar, Name, and Edit Button */}
                        <div className="flex items-center space-x-6">
                            <img
                                src={userInfo.avatar || "/placeholder.svg"}
                                alt="Avatar"
                                className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{userInfo.username}</h1>
                                <div className="space-y-1 mb-4">
                                    <p className="text-gray-600 flex items-center">
                                        <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
                                        {userInfo.email}
                                    </p>
                                    <p className="text-gray-600 flex items-center">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mr-2" />
                                        Tham gia: {formatDate(userInfo.createdAt)}
                                    </p>
                                </div>
                                <button
                                    onClick={() => router.push("/profile/edit")}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-lg cursor-pointer transition-colors text-sm"
                                >
                                    <FontAwesomeIcon icon={faEdit} className="w-4 h-4 text-gray-600" />
                                    <span className="text-gray-700">Chỉnh sửa Hồ sơ</span>
                                </button>
                            </div>
                        </div>

                        {/* Right side - Back to Dashboard Button */}
                        <div className="flex items-center">
                            <button
                                onClick={() => handleBackToDashboard()}
                                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 cursor-pointer transition-colors h-9 px-4 py-2"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 text-white"/>
                                <span className="text-white">Quay lại</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs and Quiz Count - Chỉ hiển thị nếu role khác ADMIN */}
            {userInfo.role !== "ADMIN" && (
                <>
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
                            <div className="flex space-x-8">
                                <button
                                    className="py-4 px-2 border-b-2 border-purple-600 text-purple-600 font-medium cursor-pointer">
                                    Thư viện
                                </button>
                            </div>
                            <div className="text-center pt-0">
                                <div className="text-3xl font-bold text-gray-900">{userInfo.quizCount}</div>
                                <div className="text-sm text-gray-600 font-medium">QUIZ</div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Chỉ hiển thị nếu role khác ADMIN */}
                    <div className="max-w-6xl mx-auto px-6 py-16">
                        <div className="text-center">
                            {/* Let's Create Section */}
                            <div className="mb-12">
                                <h2 className="text-5xl font-bold text-purple-400 mb-8" style={{ fontFamily: "Comic Sans MS, cursive" }}>
                                    LET'S
                                    <br />
                                    CREATE!
                                </h2>
                            </div>

                            {/* Description */}
                            <div className="max-w-1xl mx-auto">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Tạo quiz hoặc bài học đầu tiên của bạn</h3>
                                <p className="text-gray-600 mb-8">
                                    Lấy các câu hỏi từ thư viện Quizizz hoặc đặt câu hỏi của riêng bạn. Thật nhanh chóng và dễ dàng!
                                </p>

                                {/* Create Button */}
                                <button
                                    onClick={() => router.push("/users/questions/create")}
                                    className="bg-purple-600 text-white px-6 py-2 rounded-lg text-md font-medium hover:bg-purple-700 cursor-pointer transition-colors"
                                >
                                    Tạo Quiz Mới
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Profile