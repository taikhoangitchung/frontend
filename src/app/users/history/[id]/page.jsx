"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import HistoryService from "../../../../services/HistoryService";
import { toast } from "sonner";

const HistoryDetailPage = () => {
    const router = useRouter();
    const { id } = useParams();
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistoryDetail = async () => {
            setLoading(true);
            try {
                const response = await HistoryService.getHistoryDetail(id);
                setHistory(response.data);
            } catch (error) {
                toast.error("Không thể tải chi tiết bài thi");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchHistoryDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    if (!history) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Không tìm thấy bài thi.</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Chi tiết bài thi</h1>
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
                                <span className="font-medium">Thời gian làm bài:</span>{" "}
                                {history.timeTakenFormatted}
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
                                <span className="font-medium">Kết quả:</span>{" "}
                                {history.passed ? "Đạt" : "Không Đạt"}
                            </p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Câu hỏi</h3>
                        {/* Placeholder - Cần API bổ sung để lấy danh sách câu hỏi */}
                        <div className="space-y-4">
                            <p className="text-gray-600">Danh sách câu hỏi chưa được tích hợp.</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={() => router.push("/users/history")}
                            className="bg-purple-600 text-white px-6 py-2 rounded-lg text-md font-medium hover:bg-purple-700 cursor-pointer transition-colors"
                        >
                            Quay lại lịch sử
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HistoryDetailPage;