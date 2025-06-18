"use client"

import { Bell, ChevronDown, LogOut, User, Lock } from 'lucide-react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import {Button} from "./ui/button";
import {useRouter} from "next/navigation";

export function AppHeader() {
    const router = useRouter();
    const email = localStorage.getItem("currentUserEmail");
    const handleLogout = () => {
        localStorage.clear();
        router.push("/login");
    }
    return (
        <header className="h-16 border-b bg-white flex items-center justify-end px-6 shadow-sm">
            <div className="flex items-center gap-4">
                {/* Nút thông báo */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 w-10 h-10 hover:bg-purple-100 hover:text-purple-600 rounded-full cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                    title="Thông báo"
                    aria-label="Thông báo"
                >
                    <Bell className="w-6 h-6"/>
                </Button>

                {/* Dropdown hồ sơ */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="flex items-center gap-2 hover:bg-purple-50 rounded-lg cursor-pointer transition-all duration-200 disabled:cursor-not-allowed px-3 py-2"
                            aria-label="Menu hồ sơ"
                        >
                            <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">{email[0].toUpperCase()}</span>
                            </div>
                            <ChevronDown className="w-5 h-5 text-gray-500"/>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-64 p-2">
                        <div className="flex items-center gap-3 p-3 rounded-lg">
                            <div className="w-9 h-9 bg-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">{email[0].toUpperCase()}</span>
                            </div>
                            <div className="flex-1">
                                <div className="text-sm text-gray-500">{email}</div>
                            </div>
                        </div>

                        <DropdownMenuSeparator className="my-1"/>
                        <DropdownMenuItem className="flex items-center gap-2 p-3 hover:bg-purple-50 cursor-pointer rounded-lg">
                            <User className="w-5 h-5 text-gray-600" />
                            <button
                                onClick={() => router.push('/profile')}
                                className="text-sm text-left w-full cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                            >
                                Hồ sơ
                            </button>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="flex items-center gap-2 p-3 hover:bg-purple-50 cursor-pointer rounded-lg">
                            <Lock className="w-5 h-5 text-gray-600" />
                            <button
                                onClick={() => router.push('/change-password')}
                                className="text-sm text-left w-full cursor-pointer transition-all duration-200 disabled:cursor-not-allowed"
                            >
                                Đổi mật khẩu
                            </button>
                        </DropdownMenuItem>

                        <DropdownMenuItem className="flex items-center gap-2 p-3 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer rounded-lg">
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
        </header>
    )
}