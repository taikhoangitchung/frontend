"use client"

import {useEffect, useState} from "react"
import {useParams, useRouter} from "next/navigation"
import HistoryService from "../../../../../services/HistoryService"
import {Button} from "../../../../../components/ui/button"
import {
    Loader2,
    BarChart2,
    Clock,
    User,
    Award,
    CheckCircle,
    XCircle,
} from "lucide-react";


export default function ExamHistoryPage() {
    const {id} = useParams()
    const router = useRouter()
    const [histories, setHistories] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistories = async () => {
            try {
                const res = await HistoryService.getByExamId(id)
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
                    <BarChart2 className="w-6 h-6 text-purple-700" />
                    Lịch sử bài thi: <span className="text-gray-800">"{histories[0]?.title || '...'}"</span>
                </h1>
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                    Quay lại
                </Button>
            </div>

            {histories.length === 0 ? (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-center text-gray-500 text-lg flex flex-col items-center gap-3">
                    <XCircle className="w-8 h-8 text-gray-400" />
                    Chưa có học viên nào tham gia bài thi này.
                </div>

            ) : (
                <div className="rounded-2xl border border-gray-200 overflow-hidden shadow-md">
                    <table className="w-full text-base text-left bg-white">
                        <thead className="bg-purple-100 text-purple-800 text-lg font-semibold">
                        <tr>
                            <th className="p-4 border-b border-gray-200 text-center">#</th>
                            <th className="p-4 border-b border-gray-200">
                                <div className="flex items-center gap-1"><Clock className="w-5 h-5" /> Thời gian thi</div>
                            </th>
                            <th className="p-4 border-b border-gray-200">
                                <div className="flex items-center gap-1"><User className="w-5 h-5" /> Học viên</div>
                            </th>
                            <th className="p-4 border-b border-gray-200">
                                <div className="flex items-center gap-1"><Award className="w-5 h-5" /> Điểm</div>
                            </th>
                            <th className="p-4 border-b border-gray-200">
                                <div className="flex items-center gap-1"><CheckCircle className="w-5 h-5" /> Câu đúng / Tổng</div>
                            </th>
                        </tr>
                        </thead>

                        <tbody className="text-gray-700 font-medium">
                        {histories.map((h, index) => (
                            <tr key={index} className="even:bg-gray-50 hover:bg-gray-100 transition">
                                <td className="p-4 border-b text-center text-base">{index + 1}</td>
                                <td className="p-4 border-b">{new Date(h.finishedAt).toLocaleString("vi-VN")}</td>
                                <td className="p-4 border-b">{h.username}</td>
                                <td className="p-4 border-b text-purple-700 font-semibold">{h.score}</td>
                                <td className="p-4 border-b">{h.correctAnswers}/{h.totalQuestions}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
