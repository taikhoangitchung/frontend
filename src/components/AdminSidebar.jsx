"use client"

import { FolderOpen, BarChart3, Users, AlertTriangle, Tags } from 'lucide-react'
import Image from "next/image";

const menuItems = [
    {title: "Quản lý người dùng", icon: Users, component: "users", active: false},
    {title: "Quản lý danh mục", icon: FolderOpen, component: "categories", active: false},
    {title: "Quản lý thể loại", icon: Tags, component: "types", active: false},
    {title: "Quản lý độ khó", icon: BarChart3, component: "difficulties", active: false},
]

export function AdminSidebar({ onSelectMenu }) {
    return (
        <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col shadow-sm">
            {/* Logo */}
            <div className="flex items-center">
                <Image
                    src="/logo.png"
                    alt="QuizGym Logo"
                    width={120}
                    height={0}
                    priority
                />
            </div>

            {/* Menu điều hướng */}
            <div className="flex-1 px-2">
                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.title}
                            onClick={() => onSelectMenu(item)}
                            className={`w-full flex items-center gap-3 px-3 py-3 text-gray-700 rounded-lg cursor-pointer transition-all duration-200 ease-in-out transform hover:translate-x-1 disabled:cursor-not-allowed ${
                                item.active
                                    ? "bg-purple-100 text-purple-700 border-l-4 border-purple-500"
                                    : "hover:bg-purple-50 hover:text-purple-700 hover:border-l-4 hover:border-purple-500"
                            }`}
                            aria-label={item.title}
                        >
                            <item.icon className="w-6 h-6 transition-colors duration-150"/>
                            <span className="text-base font-medium">{item.title}</span>
                            {item.hasWarning && <AlertTriangle className="w-5 h-5 ml-auto text-orange-500"/>}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    )
}