"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import UserService from "../../../services/UserService"
import { toast } from "sonner"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEdit, faEnvelope, faCalendarAlt } from "@fortawesome/free-solid-svg-icons"

const Profile = () => {
    const router = useRouter()
    const [userInfo, setUserInfo] = useState({
        email: "",
        username: "",
        avatar: "",
        quizCount: 0,
        createdAt: null, // Thêm trạng thái cho createdAt
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

            // Set initial data from localStorage
            const storedUsername = localStorage.getItem("currentUserUsername") || ""
            const storedAvatar = localStorage.getItem("currentUserAvatar") || ""
            const defaultAvatar = "http://localhost:8080/media/default-avatar.png"

            setUserInfo((prev) => ({
                ...prev,
                email: storedUserEmail,
                username: storedUsername,
                avatar: storedAvatar || defaultAvatar,
            }))

            // Fetch complete profile data
            UserService.getProfile(storedUserEmail)
                .then((response) => {
                    const user = response.data
                    setUserInfo({
                        email: storedUserEmail,
                        username: user.username || storedUsername || "Người dùng",
                        avatar: user.avatar ? `http://localhost:8080${user.avatar}` : defaultAvatar,
                        quizCount: user.quizCount || 0,
                        createdAt: user.createdAt || null, // Lấy createdAt từ response
                    })
                })
                .catch((err) => {
                    console.error("Lỗi khi lấy thông tin profile:", err)
                    toast.error("Không thể tải thông tin profile")
                })
                .finally(() => {
                    setLoading(false)
                    setIsReady(true)
                })
        }
    }, [router])

    const formatDate = (dateString) => {
        if (!dateString) return "Không xác định";
        try {
            const date = new Date(dateString);
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
            const year = date.getFullYear();
            return `${day}-${month}-${year}`;
        } catch (error) {
            return "Không xác định";
        }
    };

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
                        {/* Left side - Avatar and Name */}
                        <div className="flex items-center space-x-6">
                            <img
                                src={userInfo.avatar || "/placeholder.svg"}
                                alt="Avatar"
                                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-md"
                            />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{userInfo.username}</h1>
                                <div className="space-y-1">
                                    <p className="text-gray-600 flex items-center">
                                        <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 mr-2" />
                                        {userInfo.email}
                                    </p>
                                    <p className="text-gray-600 flex items-center">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 mr-2" />
                                        Tham gia: {formatDate(userInfo.createdAt)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Edit button and Quiz count */}
                        <div className="flex items-center space-x-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-gray-900">{userInfo.quizCount}</div>
                                <div className="text-sm text-gray-600 font-medium">QUIZ</div>
                            </div>
                            <button
                                onClick={() => router.push("/users/edit")}
                                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                                <FontAwesomeIcon icon={faEdit} className="w-4 h-4 text-gray-600" />
                                <span className="text-gray-700">Chỉnh sửa Hồ sơ</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex space-x-8">
                        <button className="py-4 px-2 border-b-2 border-purple-600 text-purple-600 font-medium cursor-pointer">
                            Thư viện
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
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
                            className="bg-purple-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-purple-700 cursor-pointer transition-colors">
                            Tạo Quiz Mới
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Profile