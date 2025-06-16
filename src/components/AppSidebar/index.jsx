"use client"

import { Plus, Home, FolderOpen, BarChart3, Users, Settings, Sparkles, Info, AlertTriangle } from "lucide-react"
import {Button} from "../ui/button";


const menuItems = [
    { title: "Khám phá", icon: Home, url: "#", active: false },
    { title: "Thư viện", icon: FolderOpen, url: "#", active: false },
    { title: "Báo cáo", icon: BarChart3, url: "#", active: false },
    { title: "Các lớp học", icon: Users, url: "#", hasWarning: true, active: false },
    { title: "Tùy chỉnh phù hợp", icon: Settings, url: "#", active: false },
    { title: "Quizizz AI", icon: Sparkles, url: "#", active: false },
]

export function AppSidebar() {
    return (
        <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
            {/* Logo */}
            <div className="p-4 border-b border-gray-100 hover:bg-purple-50 transition-all duration-150">
                <div className="flex items-center gap-2">
                    <div className="text-2xl font-bold text-purple-600">QUIZIZZ</div>
                    <span className="text-sm text-gray-500 font-medium">BASIC</span>
                </div>
            </div>

            {/* Nút Tạo Quiz */}
            <div className="p-4">
                <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 hover:shadow-xl hover:scale-105 text-white rounded-lg h-12 text-base font-semibold transition-all duration-200 ease-in-out"
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
                        <a
                            key={item.title}
                            href={item.url}
                            className={`flex items-center gap-3 px-3 py-3 text-gray-700 rounded-lg transition-all duration-150 ease-in-out transform hover:translate-x-1 ${
                                item.active
                                    ? "bg-purple-100 text-purple-700 border-l-4 border-purple-500"
                                    : "hover:bg-purple-50 hover:text-purple-700 hover:border-l-4 hover:border-purple-500"
                            }`}
                            aria-label={item.title}
                        >
                            <item.icon className="w-6 h-6 transition-colors duration-150" />
                            <span className="text-base font-medium">{item.title}</span>
                            {item.hasWarning && <AlertTriangle className="w-5 h-5 ml-auto text-orange-500" />}
                        </a>
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
                    className="w-full bg-yellow-400 hover:bg-yellow-500 hover:shadow-xl hover:scale-105 text-black rounded-lg h-12 text-base font-semibold transition-all duration-200 ease-in-out"
                    aria-label="Nâng cấp tài khoản"
                >
                    🏆 Nâng cấp
                </Button>
            </div>
        </div>
    )
}
