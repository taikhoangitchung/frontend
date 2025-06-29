"use client"

import {FolderOpen, Users} from 'lucide-react'
import Image from "next/image"
import {useRouter} from "next/navigation"

const menuItems = [
    {title: "Quản lý người dùng", icon: Users, tab: "users"},
    {title: "Quản lý danh mục", icon: FolderOpen, tab: "categories"},
]

export function AdminSidebar({currentTab}) {
    const router = useRouter()

    return (
        <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
            <div className="flex items-center justify-center py-4">
                <Image
                    src="/logofixed.png"
                    alt="QuizGym Logo"
                    width={120}
                    height={0}
                    priority
                />
            </div>

            <div className="flex-1 px-2">
                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = currentTab === item.tab
                        return (
                            <button
                                key={item.tab}
                                onClick={() => router.push(`/admin/dashboard?tab=${item.tab}`)}
                                className={`w-full flex items-center gap-3 px-3 py-3 text-gray-700 rounded-lg transition-all duration-200 transform hover:translate-x-1 ${
                                    isActive
                                        ? "bg-purple-100 text-purple-700 border-l-4 border-purple-500"
                                        : "hover:bg-purple-50 hover:text-purple-700 hover:border-l-4 hover:border-purple-500"
                                }`}
                                aria-label={item.title}
                            >
                                <item.icon className="w-6 h-6"/>
                                <span className="text-base font-medium">{item.title}</span>
                            </button>
                        )
                    })}
                </nav>
            </div>
        </div>
    )
}
