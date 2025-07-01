"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import HistoryService from "../../../../../services/HistoryService"
import { Button } from "../../../../../components/ui/button"
import {
    Loader2,
    Clock,
    User,
    Award,
    CheckCircle2,
    TimerReset,
    Repeat2,
    XCircle,
    ArrowLeft,
} from "lucide-react"

export default function ExamHistoryPage() {
    const { id } = useParams()
    const router = useRouter()
    const [histories, setHistories] = useState([])
    const [loading, setLoading] = useState(true)

    const formatDate = (dateArray) => {
        if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 3) return "Không xác định"
        try {
            const [yyyy, mm, dd] = dateArray // Lấy năm, tháng, ngày từ mảng
            return `${String(dd).padStart(2, '0')}-${String(mm).padStart(2, '0')}-${yyyy}`
        } catch (error) {
            console.error("Lỗi định dạng ngày:", dateArray, error)
            return "Không xác định"
        }
    }

    useEffect(() => {
        const fetchHistories = async () => {
            try {
                const res = await HistoryService.getSummaryByExamId(id)
                setHistories(res.data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchHistories()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <Loader2 className="h-8 w-8 animate-spin text-purple-700"/>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-purple-900 flex items-center gap-2">
                    Lịch sử bài thi <span className="text-gray-800">"{histories[0]?.examTitle}"</span>
                </h1>
                <Button
                    onClick={() => router.push("/users/exams")}
                    className="bg-gray-700 hover:bg-gray-600 cursor-pointer text-white"
                >
                    <ArrowLeft className="mr-2 w-2 h-4"/>
                    Quay lại
                </Button>
            </div>

            {histories.length === 0 ? (
                <div
                    className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-500 text-lg flex flex-col items-center gap-3">
                    <XCircle className="w-8 h-8 text-gray-400"/>
                    Chưa có học viên nào tham gia bài thi này.
                </div>
            ) : (
                <div className="rounded-2xl border border-gray-200 overflow-x-auto shadow-md">
                    <table className="w-full text-base text-left bg-white">
                        <thead className="bg-purple-100 text-purple-800 text-lg font-semibold">
                        <tr>
                            <th className="p-4 border-b text-center">#</th>
                            <th className="p-4 border-b">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-5 h-5"/> Ngày chơi
                                </div>
                            </th>
                            <th className="p-4 border-b">
                                <div className="flex items-center gap-1">
                                    <User className="w-5 h-5"/> Người chơi
                                </div>
                            </th>
                            <th className="p-4 border-b">
                                <div className="flex items-center gap-1">
                                    <Award className="w-5 h-5"/> Điểm
                                </div>
                            </th>
                            <th className="p-4 border-b">
                                <div className="flex items-center gap-1">
                                    <CheckCircle2 className="w-5 h-5"/> Số câu đúng
                                </div>
                            </th>
                            <th className="p-4 border-b">
                                <div className="flex items-center gap-1">
                                    <TimerReset className="w-5 h-5"/> Thời gian
                                </div>
                            </th>
                            <th className="p-4 border-b">
                                <div className="flex items-center gap-1">
                                    <Repeat2 className="w-5 h-5"/> Lượt chơi
                                </div>
                            </th>
                        </tr>
                        </thead>

                        <tbody className="text-gray-700 font-medium">
                        {histories.map((h, index) => (
                            <tr key={index} className="even:bg-white odd:bg-gray-50 hover:bg-gray-100 transition">
                                <td className="p-4 border-b text-center">{index + 1}</td>
                                <td className="p-4 border-b">{formatDate(h.finishedAt)}</td>
                                <td className="p-4 border-b">{h.username}</td>
                                <td className="p-4 border-b text-center">
                                    <span className={`px-2 py-1 rounded font-semibold 
                                    ${h.score === 100 ? "bg-green-100 text-green-700"
                                        : h.score >= 50
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-red-100 text-red-700"}`}>
                                        {h.score.toFixed(1)}
                                    </span>
                                </td>

                                <td className="p-4 border-b text-center">{h.correctAnswers}/{h.totalQuestions}</td>
                                <td className="p-4 border-b">{Math.floor(h.timeTaken / 60)}p {h.timeTaken % 60}s</td>
                                <td className="p-4 border-b text-center">{h.attemptCount}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}