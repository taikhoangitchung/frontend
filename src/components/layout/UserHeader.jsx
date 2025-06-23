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
    Library
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

    useEffect(() => {
        const savedEmail = localStorage.getItem("email")
        if (savedEmail) setEmail(savedEmail)
    }, [])

    const handleLogout = () => {
        localStorage.clear()
        router.push("/login")
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

                {/* Middle: Search + Nav */}
                <div className="flex-1 flex items-center justify-center gap-6 px-6">
                    {/* Search */}
                    <div className="flex-1 max-w-xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <Input
                                placeholder="Tìm quiz theo tên, chủ đề..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 rounded-lg text-sm placeholder:text-gray-500 w-full"
                            />

                        </div>
                    </div>

                    {/* Navigation (ẩn ở mobile) */}
                    <nav className="hidden md:flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            className="text-purple-600 border-b-2 border-purple-600"
                        >
                            <Home className="h-4 w-4 mr-2" />
                            Trang chủ
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-gray-600"
                            onClick={() => router.push("/users/histories")}
                        >
                            <History className="h-4 w-4 mr-2" />
                            Lịch sử thi
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-gray-600"
                            onClick={() => router.push("/users/exams")}
                        >
                            <ScrollText className="h-4 w-4 mr-2" />
                            Thư viện Quiz
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-gray-600"
                            onClick={() => router.push("/users/questions")}
                        >
                            <FileQuestion className="h-4 w-4 mr-2" />
                            Thư viện câu hỏi
                        </Button>
                        <Button
                            variant="ghost"
                            className="text-gray-600"
                            onClick={() => router.push("/users/categories")}
                        >
                            <Library className="h-4 w-4 mr-2" />
                            Thư viện danh mục
                        </Button>
                    </nav>
                </div>

                {/* Right side: Button + Avatar */}
                <div className="flex items-center w-auto gap-3">
                    <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => router.push("/users/exams/create")}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo Quiz mới
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 hover:bg-purple-100 rounded-lg px-4 py-2"
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

                            <DropdownMenuItem className="flex items-center gap-2 p-3 hover:bg-purple-50 rounded-lg">
                                <User className="w-5 h-5 text-gray-600" />
                                <button
                                    onClick={() => router.push('/profile')}
                                    className="text-sm text-left w-full"
                                >
                                    Hồ sơ
                                </button>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="flex items-center gap-2 p-3 hover:bg-purple-50 rounded-lg">
                                <Lock className="w-5 h-5 text-gray-600" />
                                <button
                                    onClick={() => router.push('/change-password')}
                                    className="text-sm text-left w-full"
                                >
                                    Đổi mật khẩu
                                </button>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="flex items-center gap-2 p-3 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg">
                                <LogOut className="w-5 h-5" />
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-left w-full"
                                >
                                    Đăng xuất
                                </button>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    )
}
