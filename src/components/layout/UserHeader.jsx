"use client"

import { Search, Home, Activity, Users, CreditCard, Plus, Menu, LogOut, ChevronDown, User, Lock } from "lucide-react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function UserHeader() {
    const router = useRouter()
    const email = localStorage.getItem("email")
    const handleLogout = () => {
        localStorage.clear()
        router.push("/login")
    }
    return (
        <header className="bg-white border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                {/* Logo */}
                <div className="flex items-center space-x-4">
                    <h1 className="text-2xl font-bold text-purple-600">QUIZGYM</h1>
                </div>

                {/* Search Bar */}
                <div className="flex-1 max-w-md mx-8">
                    <div className="relative transition-all duration-300">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 transition-colors duration-300" />
                        <Input
                            placeholder="Tìm quiz theo tên, chủ đề..."
                            className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 focus:bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-300 rounded-lg text-sm placeholder:text-gray-500"
                            onFocus={(e) => e.target.parentElement.classList.add("ring-2", "ring-purple-100")}
                            onBlur={(e) => e.target.parentElement.classList.remove("ring-2", "ring-purple-100")}
                        />
                    </div>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                    <Button
                        variant="ghost"
                        className="text-purple-600 border-b-2 border-purple-600 cursor-pointer transition-all duration-200"
                    >
                        <Home className="h-4 w-4 mr-2" />
                        Trang chủ
                    </Button>
                    <Button variant="ghost" className="text-gray-600 cursor-pointer transition-all duration-200" onClick={() => toast.info("Chức năng này đang được phát triển...")}>
                        <Activity className="h-4 w-4 mr-2" />
                        Hoạt động
                    </Button>
                    <Button variant="ghost" className="text-gray-600 cursor-pointer transition-all duration-200" onClick={() => toast.info("Chức năng này đang được phát triển...")}>
                        <Users className="h-4 w-4 mr-2" />
                        Các lớp học
                    </Button>
                    <Button
                        variant="ghost"
                        className="text-gray-600 cursor-pointer transition-all duration-200"
                        onClick={() => router.push("/users/questions/my")}
                    >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Câu hỏi của tôi
                    </Button>
                </nav>

                {/* Right side buttons */}
                <div className="flex items-center space-x-3">
                    <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                        onClick={() => toast.info("Chức năng này đang được phát triển...")}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Tạo một bài quiz
                    </Button>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-2 hover:bg-purple-100 rounded-lg cursor-pointer transition-all duration-200 disabled:cursor-not-allowed px-4 py-2"
                                aria-label="Menu hồ sơ"
                            >
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">{email[0].toUpperCase()}</span>
                                </div>
                                <ChevronDown className="w-5 h-5 text-gray-500"/>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="w-64 p-3 bg-white rounded-xl shadow-lg border border-gray-100 z-50"
                        >
                            <div className="flex items-center gap-3 p-3 rounded-lg">
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">{email[0].toUpperCase()}</span>
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700">{email}</div>
                                </div>
                            </div>

                            <DropdownMenuSeparator className="my-2 bg-gray-100"/>
                            <DropdownMenuItem className="flex items-center gap-2 p-3 hover:bg-purple-50 cursor-pointer rounded-lg transition-colors duration-200">
                                <User className="w-5 h-5 text-gray-600" />
                                <button
                                    onClick={() => router.push('/profile')}
                                    className="text-sm text-left w-full cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                                >
                                    Hồ sơ
                                </button>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="flex items-center gap-2 p-3 hover:bg-purple-50 cursor-pointer rounded-lg transition-colors duration-200">
                                <Lock className="w-5 h-5 text-gray-600" />
                                <button
                                    onClick={() => router.push('/change-password')}
                                    className="text-sm text-left w-full cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                                >
                                    Đổi mật khẩu
                                </button>
                            </DropdownMenuItem>

                            <DropdownMenuItem className="flex items-center gap-2 p-3 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer rounded-lg transition-colors duration-200">
                                <LogOut className="w-5 h-5" />
                                <button
                                    onClick={handleLogout}
                                    className="text-sm text-left w-full cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
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