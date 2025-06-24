'use client'

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/button';
import { useState } from 'react';

export default function LandingPage() {
    const router = useRouter();
    // Trạng thái loading cho từng nút
    const [isLoginLoading, setIsLoginLoading] = useState(false);
    const [isRegisterLoading, setIsRegisterLoading] = useState(false);

    // Hàm xử lý chuyển trang với độ trễ giả lập để thấy hiệu ứng loading
    const handleNavigation = (path, setLoading) => {
        setLoading(true);
        setTimeout(() => {
            router.push(path);
            setLoading(false);
        }, 1000); // Độ trễ 1 giây để thấy spinner, có thể điều chỉnh
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-gray-50 via-purple-gray-50 to-pink-gray-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 h-32 rounded-3xl rotate-12 opacity-60"></div>
                <div className="absolute top-40 right-20 w-24 h-20 bg-purple-200 rounded-2xl -rotate-12 opacity-60"></div>
                <div className="absolute bottom-40 left-20 w-40 w-28 h-28 bg-pink-200 h-28 rounded-3xl rotate-45 opacity-60"></div>
                <div className="absolute bottom-20 right-40 w-20 h-20 bg-yellow-200 rounded-2xl -rotate-45 opacity-60"></div>
                <div className="absolute top-60 left-1/3 w-16 h-16 bg-green-200 rounded-xl rotate-12 opacity-60"></div>
                <div className="absolute top-80 right-1/3 w-36 h-36 bg-indigo-200 rounded-3xl -rotate-12 opacity-40"></div>
            </div>
            {/* Header */}
            <header className="relative z-10 px-6 py-6">
                <nav className="flex items-center justify-between max-w-7xl mx-auto">
                    {/* Logo */}
                    <div className="flex items-center">
                        <Image
                            src="/logofixed.png"
                            alt="QuizGym Logo"
                            width={120}
                            height={40}
                            priority
                        />
                    </div>

                    {/* Navigation Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => router.push("#")}
                            className="text-gray-700 hover:text-purple-600 transition-colors"
                        >
                            Trường học & Khu vực
                        </button>
                        <button
                            onClick={() => router.push("#")}
                            className="text-gray-700 hover:text-purple-600 transition-colors"
                        >
                            Các kế hoạch
                        </button>
                        <button
                            onClick={() => router.push("#")}
                            className="text-gray-700 hover:text-purple-600 transition-colors"
                        >
                            Trường hợp sử dụng
                        </button>
                        <button
                            onClick={() => router.push("#")}
                            className="text-gray-700 hover:text-purple-600 transition-colors"
                        >
                            Dành cho Doanh nghiệp
                        </button>
                        <button
                            onClick={() => router.push("#")}
                            className="text-gray-700 hover:text-purple-600 transition-colors"
                        >
                            Thư viện
                        </button>
                    </div>

                    {/* Right side buttons */}
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            className="cursor-pointer border-purple-600 text-purple-600 hover:bg-purple-50 relative"
                            onClick={() => handleNavigation('/login', setIsLoginLoading)}
                            disabled={isLoginLoading}
                        >
                            {isLoginLoading ? (
                                <span className="flex items-center">
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-purple-600"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Đang tải...
                                </span>
                            ) : (
                                'Đăng nhập'
                            )}
                        </Button>

                        <Button
                            className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white relative"
                            onClick={() => handleNavigation('/register', setIsRegisterLoading)}
                            disabled={isRegisterLoading}
                        >
                            {isRegisterLoading ? (
                                <span className="flex items-center">
                                    <svg
                                        className="animate-spin h-5 w-5 mr-2 text-white"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        ></circle>
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        ></path>
                                    </svg>
                                    Đang tải...
                                </span>
                            ) : (
                                'Đăng ký'
                            )}
                        </Button>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-6 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Introducing text */}
                    <div className="mb-8">
                        <span className="text-gray-600 text-lg">Khám phá </span>
                        <span className="text-purple-600 text-lg font-semibold">Bộ Công Cụ Giảng Dạy Thông Minh</span>
                    </div>

                    {/* Main heading */}
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        {'"QuizGym: Biến điều không thể thành có thể!"'}
                    </h1>

                    {/* Attribution */}
                    <p className="text-gray-500 text-lg mb-12">- Giáo viên & học sinh trên khắp thế giới</p>

                    {/* Description */}
                    <p className="text-gray-700 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                        Thiết kế và triển khai tài liệu giảng dạy toàn diện, giúp mọi học sinh chinh phục mục tiêu học tập.
                    </p>
                </div>
            </main>
        </div>
    );
}