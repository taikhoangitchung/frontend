"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import HistoryService from "../../../services/HistoryService";
import { toast } from "sonner";

const HistoryPage = () => {
    const router = useRouter();
    const [historyList, setHistoryList] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const response = await HistoryService.getHistory(currentPage);
                setHistoryList(response.data.content);
                setTotalPages(response.data.totalPages);
            } catch (error) {
                toast.error("Không thể tải lịch sử bài thi");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [currentPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Lịch sử bài thi</h1>
                {historyList.length === 0 ? (
                    <p className="text-gray-600">Bạn chưa thực hiện bài thi nào.</p>
                ) : (
                    <>
                        <div className="bg-white shadow rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tên bài thi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thời gian thi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Thời gian làm bài
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Điểm (%)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Lượt thi
                                    </th>
                                    <th className="px-6 py-3"></th>
                                </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                {historyList.map((history) => (
                                    <tr key={history.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {history.examTitle}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(history.finishedAt).toLocaleString("vi-VN")}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {history.timeTakenFormatted}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {history.scorePercentage.toFixed(2)}%
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {history.attemptNumber}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                            <button
                                                onClick={() => router.push(`/users/history/${history.id}`)}
                                                className="text-purple-600 hover:text-purple-900"
                                            >
                                                Xem chi tiết
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-center">
                            <nav className="inline-flex rounded-md shadow">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handlePageChange(i)}
                                        className={`px-4 py-2 border border-gray-300 text-sm font-medium ${
                                            currentPage === i
                                                ? "bg-purple-600 text-white"
                                                : "bg-white text-gray-700 hover:bg-gray-50"
                                        } ${i === 0 ? "rounded-l-md" : ""} ${
                                            i === totalPages - 1 ? "rounded-r-md" : ""
                                        }`}
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
    );
};

export default HistoryPage;