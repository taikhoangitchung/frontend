"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

const HistoryDetailPage = () => {
    const router = useRouter();
    const { id } = useParams(); // id là historyId
    const [history, setHistory] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = localStorage.getItem("id");

    useEffect(() => {
        fetchHistoryDetail();
    }, []);

    const fetchHistoryDetail = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(
                `http://localhost:8080/exams/history/${id}/user/${userId}`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setHistory(response.data);
        } catch (error) {
            console.error("Error fetching history detail:", error);
            if (error.response) {
                if (error.response.status === 403) {
                    setError("Bạn không có quyền truy cập vào lần thi này.");
                } else if (error.response.status === 404) {
                    setError("Không tìm thấy lần thi này.");
                } else {
                    setError("Đã xảy ra lỗi khi tải chi tiết lần thi.");
                }
            } else {
                setError("Không thể kết nối đến máy chủ.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Đang tải...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;
    if (!history) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-2xl font-bold mb-4">Chi tiết lần thi</h1>
            <div className="bg-white p-4 rounded-lg shadow">
                <p><strong>Tên bài thi:</strong> {history.examName}</p>
                <p><strong>Thời gian thi:</strong> {new Date(history.completedAt).toLocaleString("vi-VN")}</p>
                <p><strong>Thời gian làm bài:</strong> {history.timeTaken} giây</p>
                <p><strong>Điểm:</strong> {history.score}</p>
                <p><strong>Lượt thi:</strong> {`${history.attempts}`}</p>
                <p><strong>Trạng thái:</strong> {history.passed ? "Đậu" : "Trượt"}</p>
                <p><strong>Người làm:</strong> {history.username}</p>

                {/* Lịch sử trả lời các câu hỏi */}
                <div className="mt-4">
                    <h2 className="text-xl font-semibold">Lịch sử trả lời</h2>
                    {history.userAnswers && history.userAnswers.map((answer, index) => (
                        <div key={index} className="mt-2 p-2 border rounded">
                            <p><strong>{index + 1}. Câu hỏi:</strong> {answer.question.content}</p>
                            <p><strong>Đáp án đúng:</strong> {answer.correct_answer_ids.split(',').map(id =>
                                answer.question.answers.find(a => a.id === parseInt(id)).content).join(', ')}</p>
                            <p><strong>Đáp án đã chọn:</strong> {answer.selected_answer_ids.split(',').map(id =>
                                answer.question.answers.find(a => a.id === parseInt(id)).content).join(', ')}</p>
                            <p><strong>Điểm:</strong> {answer.score}</p>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => router.push("/users/history")}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Quay lại
                </button>
            </div>
        </div>
    );
};

export default HistoryDetailPage;