"use client"

import UserHeader from "../../../components/layout/UserHeader"
import { Card, CardContent } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Button } from "../../../components/ui/button"
import { Medal, DoorOpen, Zap, Flame, BookOpen, Target } from "lucide-react"
import { toast } from "sonner"
import ExamSummaryCard from "../../../components/exam/ExamSummaryCard"
import { useEffect, useState } from "react"
import HistoryService from "../../../services/HistoryService"
import { useRouter } from "next/navigation"
import RoomService from "../../../services/RoomService"

export default function Page() {
    const [searchTerm, setSearchTerm] = useState("")
    const [playedCount, setPlayedCount] = useState(0)
    const [accuracy, setAccuracy] = useState(0)
    const [inputQuiz, setInputQuiz] = useState("")
    const router = useRouter()
    const username = localStorage.getItem("username")



    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await HistoryService.getAll()
                const histories = response.data || []
                const played = histories.length
                const totalScore = histories.reduce((sum, h) => sum + h.score, 0)
                const avgScore = played > 0 ? (totalScore / played).toFixed(1) : 0
                setPlayedCount(played)
                setAccuracy(avgScore)
            } catch (e) {
                console.error("Lỗi khi tính thống kê người dùng")
            }
        }
        fetchStats()
    }, [])

    const handleInput = (event) => {
        setInputQuiz(event.target.value.toUpperCase())
    }

    const handleJoinRoom = async () => {
        if (!inputQuiz) {
            return
        }
        try {
            await RoomService.check(inputQuiz)
            router.push(`/users/exams/online/${inputQuiz}`)
        } catch (error) {
            toast.error(error.response.data)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-violet-50 to-indigo-50">
            {/* Header Component */}
            <UserHeader searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex flex-col lg:flex-row gap-8 items-stretch">
                    {/* Left - Join Quiz */}
                    <div className="flex-1 flex flex-col">
                        <Card
                            className="bg-gradient-to-br from-white to-purple-50/30 shadow-xl rounded-2xl border border-purple-100/50 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:scale-105"
                        >
                            <CardContent className="p-0 flex flex-col justify-center">
                                <div className="space-y-5 max-w-md w-full mx-auto">
                                    <div className="text-center mb-3">
                                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl mb-3 shadow-lg">
                                            <BookOpen className="w-7 h-7 text-white" />
                                        </div>
                                    </div>

                                    <Input
                                        placeholder="Nhập mã quiz để vào phòng thi"
                                        className="h-14 text-xl text-center font-mono border-2 border-purple-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 rounded-xl uppercase transition-all duration-300 bg-white/80 backdrop-blur-sm hover:bg-white/90"
                                        maxLength={8}
                                        onChange={handleInput}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleJoinRoom();
                                            }
                                        }}
                                    />
                                    <Button
                                        className="w-full h-14 text-xl font-medium bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-xl shadow-lg hover:shadow-xl cursor-pointer transition-all duration-300 disabled:cursor-not-allowed"
                                        onClick={handleJoinRoom}
                                    >
                                        <Zap className="w-5 h-5 mr-2" />
                                        Tham gia ngay
                                    </Button>

                                    <div className="text-center">
                                        <p className="text-base text-gray-500 mb-3">Hoặc</p>
                                        <Button
                                            variant="outline"
                                            className="text-violet-600 border-2 border-violet-200 hover:bg-violet-50 hover:border-violet-300 text-base font-medium rounded-xl px-6 py-2 cursor-pointer transition-all duration-300 disabled:cursor-not-allowed"
                                            onClick={() => router.push("/users/exams")}
                                        >
                                            <DoorOpen className="w-4 h-4 mr-2" />
                                            Tạo phòng mới
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right - User Info */}
                    <div className="flex-1 flex flex-col">
                        <Card
                            className="flex-1 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-600 border-0 shadow-xl rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105"
                            onClick={()=>router.push("/users/histories")}
                        >
                            <CardContent className="p-6 flex flex-col justify-between h-full relative">
                                {/* Decorative elements */}
                                <div
                                    className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-12 translate-x-12"
                                ></div>
                                <div
                                    className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-10 -translate-x-10"
                                ></div>

                                <div className="relative z-10">
                                    <div className="mb-4 flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm"
                                        >
                                            <Medal className="w-5 h-5 text-yellow-300" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-white/80">Xin chào,</h3>
                                            <h2 className="text-xl font-bold text-white">{username}</h2>
                                        </div>
                                    </div>

                                    <div
                                        className="bg-white/15 rounded-xl p-3 border border-white/20 mb-4 backdrop-blur-sm"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-white/90 font-medium">Thành tích học tập</span>
                                            <Target className="w-5 h-5 text-yellow-300" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Card className="bg-white/95 shadow-lg rounded-xl border-0 backdrop-blur-sm">
                                            <CardContent className="p-3 text-center">
                                                <div
                                                    className="text-2xl font-bold text-purple-600 mb-1"
                                                >
                                                    {playedCount}
                                                </div>
                                                <div className="text-xs text-gray-600 font-medium">
                                                    Bài đã làm
                                                </div>
                                            </CardContent>
                                        </Card>
                                        <Card className="bg-white/95 shadow-lg rounded-xl border-0 backdrop-blur-sm">
                                            <CardContent className="p-3 text-center">
                                                <div className="text-2xl font-bold text-amber-600 mb-1">
                                                    {accuracy}%
                                                </div>
                                                <div className="text-xs text-gray-600 font-medium">
                                                    Độ chính xác
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Quiz Hot Section */}
                <div className="mt-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div
                            className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg"
                        >
                            <Flame className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Quiz Hot</h1>
                            <p className="text-sm text-gray-600">Những bài quiz được yêu thích nhất</p>
                        </div>
                    </div>
                    <ExamSummaryCard search={searchTerm} />
                </div>
            </main>
        </div>
    )
}