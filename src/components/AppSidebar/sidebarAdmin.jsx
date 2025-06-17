"use client"

import { Plus, FolderOpen, BarChart3, Users, Info, AlertTriangle, HelpCircle, Tags } from "lucide-react"
import { Button } from "../ui/button"
import Image from "next/image"
import { useRouter } from "next/navigation"

const menuItems = [
    { title: "Quản lý người dùng", icon: Users, url: "/admin/users", active: false },
    { title: "Quản lý câu hỏi", icon: HelpCircle, url: "/admin/questions", active: false },
    { title: "Quản lý danh mục", icon: FolderOpen, url: "/admin/categories", active: false },
    { title: "Quản lý thể loại", icon: Tags, url: "/admin/types", active: false },
    { title: "Quản lý độ khó", icon: BarChart3, url: "/admin/difficulties", active: false },
]

export function AppSidebar() {
    const router = useRouter()

    const handleMenuClick = (url) => {
        if (url !== "#") {
            router.push(url)
        }
    }

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
            {/* Logo */}
            <div className="flex items-center">
                <Image src="/logo.png" alt="QuizGym Logo" width={120} height={0} priority />
            </div>

            {/* Nút Tạo Quiz */}
            <div className="p-4">
                <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 hover:shadow-xl hover:scale-105 text-white rounded-lg h-12 text-base font-semibold transition-all duration-200 ease-in-out cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Tạo quiz mới"
                >
                    <Plus className="w-6 h-6 mr-2" />
                    Quiz
                </Button>
            </div>

            {/* Menu điều hướng */}
            <div className="flex-1 px-2">
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.title}
                            onClick={() => handleMenuClick(item.url)}
                            className={`w-full flex items-center gap-3 px-3 py-3 text-gray-700 rounded-lg transition-all duration-200 ease-in-out transform hover:translate-x-1 cursor-pointer disabled:cursor-not-allowed ${
                                item.active
                                    ? "bg-purple-100 text-purple-700 border-l-4 border-purple-500"
                                    : "hover:bg-purple-50 hover:text-purple-700 hover:border-l-4 hover:border-purple-500"
                            }`}
                            aria-label={item.title}
                        >
                            <item.icon className="w-6 h-6 transition-all duration-200" />
                            <span className="text-base font-medium">{item.title}</span>
                            {item.hasWarning && <AlertTriangle className="w-5 h-5 ml-auto text-orange-500" />}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Footer */}
            <div className="p-4 space-y-3">
                <div
                    className="flex items-center gap-2 text-sm text-gray-600 px-2"
                    title="Bạn đã sử dụng 0/20 hoạt động miễn phí"
                >
                    <span>0/20 hoạt động được tạo ra</span>
                    <Info className="w-5 h-5" />
                </div>
                <Button
                    className="w-full bg-yellow-400 hover:bg-yellow-500 hover:shadow-xl hover:scale-105 text-black rounded-lg h-12 text-base font-semibold transition-all duration-200 ease-in-out cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Nâng cấp tài khoản"
                >
                    🏆 Nâng cấp
                </Button>
            </div>
        </div>
    )
}