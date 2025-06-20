"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import HistoryService from "../../../../services/HistoryService"
import { toast } from "sonner"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";

const HistoryDetailPage = () => {
    const router = useRouter()
    const { id } = useParams()
    const [history, setHistory] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistoryDetail = async () => {
            setLoading(true)
            try {
                const response = await HistoryService.getHistoryDetail(id)
                setHistory(response.data)
            } catch (error) {
                toast.error("Không thể tải chi tiết bài thi")
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchHistoryDetail()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        )
    }

    if (!history) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Không tìm thấy bài thi.</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-6">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Chi tiết bài thi</h1>
                    <button
                        onClick={() => router.push("/users/histories")}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 cursor-pointer transition-colors h-9 px-4 py-2"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="w-4 h-4 text-white"/>
                        <span className="text-white">Quay lại</span>
                    </button>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{history.examTitle}</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-600">
                                <span className="font-medium">Người làm:</span> {history.username}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Thời gian thi:</span>{" "}
                                {new Date(history.finishedAt).toLocaleString("vi-VN")}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Thời gian làm bài:</span> {history.timeTakenFormatted}
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-600">
                                <span className="font-medium">Điểm:</span> {history.scorePercentage.toFixed(2)}%
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Lượt thi:</span> {history.attemptNumber}
                            </p>
                            <p className="text-gray-600">
                                <span className="font-medium">Kết quả:</span> {history.passed ? "Đạt" : "Không Đạt"}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Câu hỏi</h3>

                        {/* Questions and Answers Display */}
                        {history.questions && history.questions.length > 0 ? (
                            <div className="space-y-6">
                                {history.questions.map((question, index) => (
                                    <div key={index} className="bg-purple-50 p-4 rounded-xl shadow-sm border">
                                        <p className="font-semibold mb-4 text-purple-800">
                                            {index + 1}. {question.content}
                                        </p>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {question.answers.map((answer) => {
                                                const isSelected = question.selectedAnswerIds?.includes(answer.id)
                                                const isCorrect = answer.correct

                                                const borderColor = isCorrect ? "border-green-500" : "border-red-400"
                                                const bgColor = isCorrect ? "bg-green-50" : "bg-red-50"

                                                return (
                                                    <div
                                                        key={answer.id}
                                                        className={`relative border rounded-lg px-4 py-3 min-h-[4rem] ${borderColor} ${bgColor}`}
                                                    >
                                                        {isSelected && (
                                                            <div className="absolute top-0 right-2 -translate-y-1/2 bg-white border border-purple-500 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded shadow-sm z-10">
                                                                Bạn chọn
                                                            </div>
                                                        )}

                                                        <span className="font-medium">{answer.content}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="text-gray-600">Danh sách câu hỏi chưa được tích hợp.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HistoryDetailPage