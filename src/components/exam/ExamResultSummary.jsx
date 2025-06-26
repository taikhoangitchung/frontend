"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "../ui/button"
import { useRouter } from "next/navigation"
import { Eye, RefreshCw, LogOut, X } from "lucide-react"
import HistoryService from "../../services/HistoryService"
import ExamDetailPanel from "./ExamDetailPanel"
import RankStars from "../icon/rank"

export default function ExamResultSummary({ isOnline, onReplay, historyId, onClose }) {
    const [showPanel, setShowPanel] = useState(false)
    const router = useRouter()
    const [data, setData] = useState(null)
    const username = localStorage.getItem("username")
    const [loading, setLoading] = useState(true)
    const panelRef = useRef(null)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await HistoryService.getHistoryDetail(historyId)
                console.log(response.data)
                setData(response.data)
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [historyId])

    const handleOverlayClick = (e) => {
        if (panelRef.current && !panelRef.current.contains(e.target)) {
            if (onClose) onClose()
        }
    }

    const avgTimePerQ =
        data && data.correct + data.wrong > 0
            ? Math.round(data.timeTaken / (data.correct + data.wrong))
            : 0

    const showDetail = () => {
        setShowPanel(true)
    }

    if (loading || !data) {
        return (
            <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                <div className="text-white">Đang tải...</div>
            </div>
        )
    }

    return (
        <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            <button
                onClick={() => router.push("/users/dashboard")}
                className="absolute top-6 left-6 rounded-full p-2 text-white transition-colors duration-200 ease-in-out hover:bg-red-500 focus:outline-none z-50 cursor-pointer">
                <X className="w-12 h-12" />
            </button>

            <div ref={panelRef} className="relative">
                <div className="bg-purple-900 w-full max-w-xl rounded-xl p-6 shadow-lg text-center space-y-6">
                    <h2 className="text-lg text-purple-200">
                        Chúc mừng <span className="font-bold text-white">{username}</span> đã hoàn thành bài thi!
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 text-sm w-full">
                        <div className="bg-emerald-500 p-4 rounded-xl text-center">
                            <p className="text-purple-200 text-xs mb-1">Câu đúng</p>
                            <p className="font-bold text-xl text-white">{data.correct}</p>
                        </div>

                        <div className="bg-red-500 p-4 rounded-xl text-center">
                            <p className="text-purple-200 text-xs mb-1">Câu sai</p>
                            <p className="font-bold text-xl text-white">{data.wrong}</p>
                        </div>

                        <div className="bg-purple-700 p-4 rounded-xl text-center">
                            <p className="text-purple-200 text-xs mb-1">Điểm số</p>
                            <p className="font-bold text-xl text-white">{data.score?.toFixed(1)}</p>
                        </div>

                        <div className="bg-cyan-700 p-4 rounded-xl text-center">
                            <p className="text-purple-200 text-xs mb-1">Tốc độ</p>
                            <p className="font-bold text-xl text-white">{avgTimePerQ}s / câu</p>
                        </div>

                        <div className="bg-orange-400 p-4 rounded-xl text-center">
                            <p className="text-purple-200 text-xs mb-1">Thời gian hoàn thành</p>
                            <p className="font-bold text-xl text-white">{data.timeTaken}s</p>
                        </div>

                        {isOnline && data.rankResponse?.rankings?.length > 0 && (
                            <div className="bg-black/40 p-4 rounded-xl text-left col-span-full w-full">
                                <p className="text-purple-200 text-xs mb-2 text-center">Bảng xếp hạng</p>
                                <div className="space-y-1 text-sm">
                                    {data.rankResponse.rankings.map((r, i) => {
                                        const isCurrentUser = r.username === username
                                        return (
                                            <div
                                                key={i}
                                                className={`flex justify-between items-center px-3 py-1 rounded ${
                                                    isCurrentUser
                                                        ? "bg-yellow-200/30 text-white font-semibold"
                                                        : "text-white"
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <span>{r.rank}.</span>
                                                    <span>{r.username}</span>
                                                </div>
                                                <RankStars rank={r.rank} />
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-2 mt-6">
                        <Button
                            onClick={showDetail}
                            className="bg-white text-purple-900 rounded-full px-6 py-2 font-semibold mt-2 flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Eye size={18} />
                            Xem chi tiết
                        </Button>

                        {!isOnline && (
                            <Button
                                onClick={onReplay}
                                className="bg-purple-500 hover:bg-purple-600 text-white rounded-full font-semibold py-2 flex items-center gap-2 justify-center cursor-pointer"
                            >
                                <RefreshCw size={18} />
                                Chơi lại
                            </Button>
                        )}

                        <Button
                            className="bg-white text-purple-900 rounded-full font-semibold py-2 flex items-center justify-center gap-2 cursor-pointer"
                            onClick={() => router.push("/users/dashboard")}
                        >
                            <LogOut size={18} />
                            Thoát
                        </Button>
                    </div>
                </div>

                {showPanel && (
                    <ExamDetailPanel
                        data={data.fullQuestions.map((q) => ({
                            ...q,
                            selectedAnswerIds:
                                data.choices.find((c) => c.questionId === q.id)?.selectedAnswerIds || [],
                        }))}
                        onClose={() => setShowPanel(false)}
                    />
                )}
            </div>
        </div>
    )
}
