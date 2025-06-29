"use client"

import { Bell, ChevronDown, LogOut, User, Lock, Loader2 } from 'lucide-react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useState } from "react"

export function AdminHeader() {
    const router = useRouter()
    const email = localStorage.getItem("email")
    const [isLoading, setIsLoading] = useState({
        profile: false,
        changePassword: false,
        logout: false,
        notifications: false
    })

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

    const handleNotifications = () => {
        setIsLoading(prev => ({ ...prev, notifications: true }))
        toast.info("Chức năng này đang được phát triển...")
        setTimeout(() => {
            setIsLoading(prev => ({ ...prev, notifications: false }))
        }, 1000)
    }

    return (
        <header className="min-h-[50px] border-b bg-white flex items-center justify-end px-6 shadow-sm">
            <div className="flex items-center gap-4">
                {/* Nút thông báo */}
                <Button
                    onClick={handleNotifications}
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 w-10 h-10 hover:bg-purple-100 hover:text-purple-600 rounded-full cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                    title="Thông báo"
                    aria-label="Thông báo"
                    disabled={isLoading.notifications}
                >
                    {isLoading.notifications ? (
                        <Loader2 className="w-6 h-6 animate-spin"/>
                    ) : (
                        <Bell className="w-6 h-6"/>
                    )}
                </Button>

                {/* Dropdown hồ sơ */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 hover:bg-purple-100 rounded-lg cursor-pointer transition-all duration-200 disabled:cursor-not-allowed px-4 py-2"
                            aria-label="Menu hồ sơ"
                            disabled={isLoading.profile || isLoading.changePassword || isLoading.logout}
                        >
                            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">{email?.[0]?.toUpperCase()}</span>
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
                                <span className="text-white font-semibold text-sm">{email?.[0]?.toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                                <div className="text-sm font-medium text-gray-700">{email}</div>
                            </div>
                        </div>

                        <DropdownMenuSeparator className="my-2 bg-gray-100"/>

                        <DropdownMenuItem
                            onClick={() => handleNavigation("profile", "/profile")}
                            className="flex items-center gap-2 p-3 hover:bg-purple-50 cursor-pointer rounded-lg transition-colors duration-200"
                            disabled={isLoading.profile}
                        >
                            {isLoading.profile ? (
                                <Loader2 className="w-5 h-5 text-gray-600 animate-spin"/>
                            ) : (
                                <User className="w-5 h-5 text-gray-600"/>
                            )}
                            <span className="text-sm text-left w-full">Hồ sơ</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => handleNavigation("changePassword", "/change-password")}
                            className="flex items-center gap-2 p-3 hover:bg-purple-50 cursor-pointer rounded-lg transition-colors duration-200"
                            disabled={isLoading.changePassword}
                        >
                            {isLoading.changePassword ? (
                                <Loader2 className="w-5 h-5 text-gray-600 animate-spin"/>
                            ) : (
                                <Lock className="w-5 h-5 text-gray-600"/>
                            )}
                            <span className="text-sm text-left w-full">Đổi mật khẩu</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={handleLogout}
                            className="flex items-center gap-2 p-3 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer rounded-lg transition-colors duration-200"
                            disabled={isLoading.logout}
                        >
                            {isLoading.logout ? (
                                <Loader2 className="w-5 h-5 animate-spin"/>
                            ) : (
                                <LogOut className="w-5 h-5"/>
                            )}
                            <span className="text-sm text-left w-full">Đăng xuất</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}