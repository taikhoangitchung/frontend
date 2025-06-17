"use client"

import HeaderUser from "../../../components/AppHeader/headerUser";
import {Card, CardContent} from "../../../components/ui/card";
import {Input} from "../../../components/ui/input";
import {Button} from "../../../components/ui/button";
import { Badge, Edit, Users, Zap } from 'lucide-react';
import {Avatar, AvatarImage, AvatarFallback} from "../../../components/ui/avatar";

export default function Page() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Header Component */}
            <HeaderUser />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left side - Join Quiz */}
                    <div className="lg:col-span-2">
                        <div className="text-center mb-8">
                            <h1 className="text-4xl font-bold text-gray-900 mb-3">Tham gia QuizGym ngay!</h1>
                            <p className="text-lg text-gray-600">Nhập mã quiz để bắt đầu trải nghiệm học tập thú vị</p>
                        </div>

                        <Card className="bg-white shadow-xl border-0 overflow-hidden">
                            <CardContent className="p-12">
                                <div className="max-w-md mx-auto">
                                    <div className="space-y-6">
                                        <div className="relative">
                                            <Input
                                                placeholder="Nhập mã tham gia "
                                                className="h-16 text-xl text-center font-mono tracking-wider border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 rounded-xl transition-all duration-300 uppercase"
                                                maxLength={8}
                                                onChange={(e) => {
                                                    e.target.value = e.target.value.toUpperCase()
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl pointer-events-none"></div>
                                        </div>

                                        <Button className="w-full h-16 text-xl font-semibold bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl">
                                            <Zap className="h-6 w-6 mr-3" />
                                            Tham gia ngay
                                        </Button>
                                    </div>

                                    <div className="mt-8 text-center">
                                        <p className="text-sm text-gray-500 mb-4">Hoặc</p>
                                        <Button variant="outline" className="text-purple-600 border-purple-200 hover:bg-purple-50">
                                            <Users className="h-4 w-4 mr-2" />
                                            Tạo phòng mới
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right side - User Info */}
                    <div className="lg:col-span-1">
                        <Card className="bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600 border-0 relative overflow-hidden shadow-2xl" style={{ marginTop: '100px' }}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                            <CardContent className="p-6 relative">
                                {/* Edit button */}
                                <Button
                                    size="icon"
                                    className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-sm rounded-full h-10 w-10 transition-all duration-300"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>

                                {/* User greeting */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-medium text-white/90">Xin chào,</h3>
                                    <h2 className="text-2xl font-bold text-white">Name</h2>
                                </div>

                                {/* Stats */}
                                <div className="space-y-3 mb-6">

                                    <div className="bg-white/15 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/90 text-sm">Thành tích</span>
                                            <Badge className="bg-orange-400 text-orange-900 hover:bg-orange-400">
                                                <span className="mr-1">🏆</span>
                                                Cấp 5
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="mt-6 grid grid-cols-2 gap-4">
                                        <Card className="bg-white shadow-lg border-0">
                                            <CardContent className="p-4 text-center">
                                                <div className="text-2xl font-bold text-purple-600">12</div>
                                                <div className="text-sm text-gray-600">Quiz đã chơi</div>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-white shadow-lg border-0">
                                            <CardContent className="p-4 text-center">
                                                <div className="text-2xl font-bold text-green-600">85%</div>
                                                <div className="text-sm text-gray-600">Tỷ lệ đúng</div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Stats */}

                    </div>
                </div>
            </main>
        </div>
    )
}