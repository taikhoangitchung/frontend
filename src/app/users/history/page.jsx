"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const HistoryPage = () => {
    const router = useRouter();
    const [history, setHistory] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem("id");

    useEffect(() => {
        fetchHistory();
    }, [page]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:8080/exams/history/user/${userId}`,
                {
                    params: { page, size: 20 },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setHistory(response.data.content);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (id) => {
        router.push(`/users/history/${id}`);
    };

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold mb-4">Lịch sử thi của bạn</h1>
            <div className="bg-white p-4 rounded-lg shadow">
                {history.length === 0 ? (
                    <p>Chưa có lịch sử thi.</p>
                ) : (
                    <table className="w-full text-left">
                        <thead>
                        <tr className="border-b">
                            <th className="p-2">Tên bài thi</th>
                            <th className="p-2">Thời gian thi</th>
                            <th className="p-2">Thời gian làm bài</th>
                            <th className="p-2">Điểm</th>
                            <th className="p-2">Lượt thi</th>
                            <th className="p-2">Trạng thái</th>
                            <th className="p-2">Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {history.map((item) => (
                            <tr key={item.id} className="border-b">
                                <td className="p-2">{item.examName}</td>
                                <td className="p-2">
                                    {new Date(item.completedAt).toLocaleString("vi-VN")}
                                </td>
                                <td className="p-2">{item.timeTaken} giây</td>
                                <td className="p-2">{item.score}</td>
                                <td className="p-2">{`${item.attempts}`}</td>
                                <td className="p-2">{item.passed ? "Đậu" : "Trượt"}</td>
                                <td className="p-2">
                                    <button
                                        onClick={() => handleViewDetail(item.id)}
                                        className="text-blue-500 hover:underline"
                                    >
                                        Xem chi tiết
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
                <div className="mt-4 flex justify-center space-x-2">
                    <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                        disabled={page === 0}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 flex items-center"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Trước
                    </button>
                    <span>
            Trang {page + 1} / {totalPages}
          </span>
                    <button
                        onClick={() => setPage((prev) => (prev + 1 < totalPages ? prev + 1 : prev))}
                        disabled={page + 1 >= totalPages}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 flex items-center"
                    >
                        Sau
                        <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HistoryPage;