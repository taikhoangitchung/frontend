"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import HistoryService from "../../../services/HistoryService"
import { toast } from "sonner"

const HistoryPage = () => {
    const router = useRouter()
    const [historyList, setHistoryList] = useState([])
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true)
            try {
                const response = await HistoryService.getHistory(currentPage)
                setHistoryList(response.data.content)
                setTotalPages(response.data.totalPages)
            } catch (error) {
                toast.error("Không thể tải lịch sử bài thi")
            } finally {
                setLoading(false)
            }
        }
        fetchHistory()
    }, [currentPage])

    const handlePageChange = (page) => {
        setCurrentPage(page)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Lịch sử bài thi</h1>

                {historyList.length === 0 ? (
                    <p className="text-gray-600">Bạn chưa thực hiện bài thi nào.</p>
                ) : (
                    <>
                        {/* Quiz Cards Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                            {historyList.map((history) => (
                                <div
                                    key={history.id}
                                    className="w-64 min-w-[16rem] bg-white shadow-lg rounded-xl p-0 transform transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden cursor-pointer"
                                    onClick={() => router.push(`/users/history/${history.id}`)}
                                >
                                    <div className="w-full h-32 rounded-t-xl overflow-hidden relative group">
                                        <img
                                            src="/cardquiz.png"
                                            alt={history.examTitle}
                                            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                                        />
                                        <div className="absolute top-2 left-2 bg-white/80 rounded px-2 py-1 text-xs font-semibold border-none outline-none ring-0 shadow-none transition-colors group-hover:bg-white/90">
                                            {history.totalQuestions || "N/A"} Qs
                                        </div>
                                        <div className="absolute top-2 right-2 bg-white/80 rounded px-2 py-1 text-xs font-semibold text-purple-700 border-none outline-none ring-0 shadow-none transition-colors group-hover:bg-white/90">
                                            Lượt thi {history.attemptNumber}
                                        </div>
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                                    </div>

                                    <div className="p-4">
                                        <div className="text-center text-base text-gray-800 hover:text-gray-900 transition-colors duration-300 mb-4">
                                            {history.examTitle}
                                        </div>

                                        {/* Fixed width progress bar */}
                                        <div className="mb-4">
                                            <div
                                                className={`w-full h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                                    history.scorePercentage === 100 ? "bg-[#5de2a5]" : "bg-[#e2be5d]"
                                                }`}
                                            >
                                                Độ chính xác {history.scorePercentage.toFixed(0)}%
                                            </div>
                                        </div>

                                        {/* Date info */}
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>Ngày thi:</span>
                                            <span>{new Date(history.finishedAt).toLocaleDateString("vi-VN")}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination - giữ nguyên logic ban đầu */}
                        <div className="mt-4 flex justify-center">
                            <nav className="inline-flex rounded-md shadow">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i)}
                                        className={`px-4 py-2 border border-gray-300 text-sm font-medium ${
                                            currentPage === i ? "bg-purple-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                                        } ${i === 0 ? "rounded-l-md" : ""} ${i === totalPages - 1 ? "rounded-r-md" : ""}`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default HistoryPage