"use client"

import {
    Search,
    Home,
    History,
    FileQuestion,
    Plus,
    Menu,
    LogOut,
    ChevronDown,
    User,
    Lock,
    ScrollText,
    Library,
    Loader2
} from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../ui/dropdown-menu"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function UserHeader({ searchTerm, setSearchTerm }) {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const [isLoading, setIsLoading] = useState({
        createQuiz: false,
        menu: false,
        profile: false,
        changePassword: false,
        logout: false,
        histories: false,
        exams: false,
        questions: false,
        categories: false
    })

    useEffect(() => {
        const savedEmail = localStorage.getItem("email")
        if (savedEmail) setEmail(savedEmail)
    }, [])

    const handleNavigation = async (key, path) => {
        setIsLoading(prev => ({ ...prev, [key]: true }))
        try {
            await router.push(path)
        } catch (error) {
            console.error("Lỗi khi chuyển trang:", error)
            setIsLoading(prev => ({ ...prev, [key]: false }))
        }
    }

    const handleLogout = async () => {
        setIsLoading(prev => ({ ...prev, logout: true }))
        try {
            localStorage.clear()
            await router.push("/login")
        } catch (error) {
            console.error("Lỗi khi đăng xuất:", error)
            setIsLoading(prev => ({ ...prev, logout: false }))
        }
    }

    return (
        <header className="bg-white border-b border-gray-200 px-4 py-3 w-full">
            <div className="flex items-center w-full max-w-full">
                {/* Logo */}
                <div className="flex items-center w-auto">
                    <Image
                        src="/logofixed.png"
                        alt="QUIZGYM Logo"
                        width={120}
                        height={40}
                        className="object-contain"
                    />
                </div>

                {/* Giữa: Tìm kiếm + Điều hướng */}
                <div className="flex-1 flex items-center justify-center gap-6 px-6">
                    {/* Tìm kiếm */}
                    <div className="flex-1 max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Tìm quiz theo tên, chủ đề..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-lg text-sm placeholder:text-gray-500 w-full cursor-pointer transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Điều hướng (ẩn trên mobile) */}
                    <nav className="hidden md:flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            className="text-purple-600 border-b-2 border-purple-600 cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                            onClick={() => handleNavigation("home", "/users")}
                            disabled={isLoading.home}
                        >
                            {isLoading.home ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Home className="h-4 w-4 mr-2" />
                            )}
                            Trang chủ
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-gray-600 cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                            onClick={() => handleNavigation("histories", "/users/histories")}
                            disabled={isLoading.histories}
                        >
                            {isLoading.histories ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <History className="h-4 w-4 mr-2" />
                            )}
                            Lịch sử thi
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-gray-600 cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                            onClick={() => handleNavigation("exams", "/users/exams")}
                            disabled={isLoading.exams}
                        >
                            {isLoading.exams ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <ScrollText className="h-4 w-4 mr-2" />
                            )}
                            Thư viện Quiz
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-gray-600 cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                            onClick={() => handleNavigation("questions", "/users/questions")}
                            disabled={isLoading.questions}
                        >
                            {isLoading.questions ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <FileQuestion className="h-4 w-4 mr-2" />
                            )}
                            Thư viện câu hỏi
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-gray-600 cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                            onClick={() => handleNavigation("categories", "/users/categories")}
                            disabled={isLoading.categories}
                        >
                            {isLoading.categories ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                                <Library className="h-4 w-4 mr-2" />
                            )}
                            Thư viện danh mục
                        </Button>
                    </nav>
                </div>

                {/* Bên phải: Nút + Avatar */}
                <div className="flex items-center w-auto gap-3">
                    <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                        onClick={() => handleNavigation("createQuiz", "/users/exams/create")}
                        disabled={isLoading.createQuiz}
                    >
                        {isLoading.createQuiz ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Plus className="h-4 w-4 mr-2" />
                        )}
                        Tạo Quiz mới
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                        onClick={() => handleNavigation("menu", "/users/menu")}
                        disabled={isLoading.menu}
                    >
                        {isLoading.menu ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 hover:bg-purple-100 rounded-lg px-4 py-2 cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                                disabled={isLoading.profile || isLoading.changePassword || isLoading.logout}
                            >
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {email?.[0]?.toUpperCase()}
                                    </span>
                                </div>
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-64 p-3 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
                        >
                            <div className="flex items-center gap-3 p-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {email?.[0]?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700">{email}</div>
                                </div>
                            </div>

                            <DropdownMenuSeparator className="my-2 bg-gray-100" />

                            <DropdownMenuItem
                                onClick={() => handleNavigation("profile", "/profile")}
                                className="flex items-center gap-2 p-3 hover:bg-purple-50 rounded-lg cursor-pointer transition-all duration-200"
                                disabled={isLoading.profile}
                            >
                                {isLoading.profile ? (
                                    <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                                ) : (
                                    <User className="w-5 h-5 text-gray-600" />
                                )}
                                <span className="text-sm text-left w-full">Hồ sơ</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => handleNavigation("changePassword", "/change-password")}
                                className="flex items-center gap-2 p-3 hover:bg-purple-50 rounded-lg cursor-pointer transition-all duration-200"
                                disabled={isLoading.changePassword}
                            >
                                {isLoading.changePassword ? (
                                    <Loader2 className="w-5 h-5 text-gray-600 animate-spin" />
                                ) : (
                                    <Lock className="w-5 h-5 text-gray-600" />
                                )}
                                <span className="text-sm text-left w-full">Đổi mật khẩu</span>
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="flex items-center gap-2 p-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg cursor-pointer transition-all duration-200"
                                disabled={isLoading.logout}
                            >
                                {isLoading.logout ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <LogOut className="w-5 h-5" />
                                )}
                                <span className="text-sm text-left w-full">Đăng xuất</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}