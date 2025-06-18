'use client'

import Image from 'next/image';

import {useRouter} from "next/navigation";
import {Button} from "./ui/button";

export default function LandingPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-10 w-32 h-32 bg-blue-200 rounded-3xl rotate-12 opacity-60"></div>
                <div
                    className="absolute top-40 right-20 w-24 h-24 bg-purple-200 rounded-2xl -rotate-12 opacity-60"></div>
                <div
                    className="absolute bottom-40 left-20 w-28 h-28 bg-pink-200 rounded-3xl rotate-45 opacity-60"></div>
                <div
                    className="absolute bottom-20 right-40 w-20 h-20 bg-yellow-200 rounded-2xl -rotate-45 opacity-60"></div>
                <div className="absolute top-60 left-1/3 w-16 h-16 bg-green-200 rounded-xl rotate-12 opacity-60"></div>
                <div
                    className="absolute top-80 right-1/3 w-36 h-36 bg-indigo-200 rounded-3xl -rotate-12 opacity-40"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 px-6 py-4">
                <nav className="flex items-center justify-between max-w-7xl mx-auto">
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

                    {/* Navigation Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <button
                            onClick={() => router.push("#")}
                            className="text-gray-700 hover:text-purple-600 transition-colors"
                        >
                            School & District
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
                            Use Cases
                        </button>
                        <button
                            onClick={() => router.push("#")}
                            className="text-gray-700 hover:text-purple-600 transition-colors"
                        >
                            Cho doanh nghiệp
                        </button>
                        <button
                            onClick={() => router.push("#")}
                            className="text-gray-700 hover:text-purple-600 transition-colors"
                        >
                            Library
                        </button>
                    </div>

                    {/* Right side buttons */}
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="outline"
                            className="border-purple-600 text-purple-600 hover:bg-purple-50 cursor-pointer"
                            onClick={() => router.push("/login")}
                        >
                            Đăng nhập
                        </Button>

                        <Button
                            className="bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                            onClick={() => router.push("/register")}
                        >
                            Đăng ký
                        </Button>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className="relative z-10 px-6 py-16">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Introducing text */}
                    <div className="mb-8">
                        <span className="text-gray-600 text-lg">Introducing </span>
                        <span className="text-purple-600 text-lg font-semibold">Instructional Suite</span>
                    </div>

                    {/* Main heading */}
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                        {'"I had no idea QuizGym could do that."'}
                    </h1>

                    {/* Attribution */}
                    <p className="text-gray-500 text-lg mb-12">- Almost everybody</p>

                    {/* Description */}
                    <p className="text-gray-700 text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                        Create and deliver bell-to-bell curriculum resources that meet the needs of every student.
                    </p>
                </div>
            </main>
        </div>
    )
}
