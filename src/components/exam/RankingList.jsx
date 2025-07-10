"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import HistoryService from "../../services/HistoryService";
import ExamDetailPanel from "../exam/ExamDetailPanel";
import { config } from "../../config/url.config";
import { defaultAvatar } from "../../config/backendBaseUrl";

export default function RoomRankingPanel({ code }) {
    const [email, setEmail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [detailData, setDetailData] = useState(null);
    const [showPanel, setShowPanel] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            setEmail(localStorage.getItem("email"));
        }
    }, []);

    const fetchData = async () => {
        try {
            const response = await HistoryService.getRankByRoomCode(code);
            setData(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [code]); // Thêm code làm dependency để refetch khi code thay đổi

    const showDetail = async (historyId) => {
        try {
            const res = await HistoryService.getHistoryDetail(historyId);
            const detail = res.data;
            const mappedQuestions = detail.fullQuestions.map((q) => ({
                ...q,
                selectedAnswerIds: detail.choices.find((c) => c.questionId === q.id)?.selectedAnswerIds || [],
            }));
            setDetailData(mappedQuestions);
            setShowPanel(true);
        } catch (err) {
            console.error("Lỗi khi lấy chi tiết:", err);
        }
    };

    const getSuffix = (rank) => {
        if (rank === 1) return "st";
        if (rank === 2) return "nd";
        if (rank === 3) return "rd";
        return "th";
    };

    const getProgressColor = (percent) => {
        if (percent >= 100) return "bg-green-400";
        if (percent >= 50) return "bg-yellow-400";
        return "bg-red-400";
    };

    if (!code) return null; // Tránh render nếu không có code

    return (
        <div className="relative">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-lg text-white space-y-4 w-full h-full">
                <p className="text-purple-200 text-base font-semibold mb-4 text-center">Bảng xếp hạng</p>
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-8 w-8 animate-spin text-white" />
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center text-gray-400 italic">Không có thí sinh nào nộp bài</div>
                ) : (
                    <div className="space-y-4 text-base">
                        {data.map((rank) => {
                            const isCurrentUser = rank.email === email;
                            return (
                                <div
                                    key={rank.historyId}
                                    className={`flex items-center gap-4 p-4 rounded-xl ${
                                        isCurrentUser ? "bg-purple-800/30 ring-2 ring-white/10" : "bg-purple-900/30"
                                    }`}
                                >
                                    <div className="flex items-center gap-3 w-1/3 min-w-[180px]">
                                        <div className="text-white text-2xl font-bold leading-none w-10 text-right">
                                            {rank.rank}
                                            <span className="text-sm align-super ml-0.5">{getSuffix(rank.rank)}</span>
                                        </div>
                                        <img
                                            src={rank.avatarUrl ? `${config.apiBaseUrl}${rank.avatarUrl}` : `${config.apiBaseUrl}${defaultAvatar}`}
                                            alt=""
                                            className="w-10 h-10 rounded-full object-cover border border-white/20"
                                        />
                                        <span className="text-white text-lg font-semibold truncate">
                                            {rank.username}
                                        </span>
                                    </div>
                                    <div className="flex-1 max-w-[300px]">
                                        <div className="relative w-full h-6 bg-gray-700 rounded-full overflow-hidden flex items-center px-2 text-base text-white font-semibold">
                                            <div
                                                className={`absolute top-0 left-0 h-full rounded-full z-0 transition-all duration-300 ${getProgressColor(rank.score)}`}
                                                style={{ width: `${(rank.score).toFixed(1)}%` }}
                                            />
                                            <div className="relative z-10 w-full text-center">
                                                {(rank.score).toFixed(1)}%
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ml-auto">
                                        <button
                                            onClick={() => showDetail(rank.historyId)}
                                            className="text-sm text-purple-300 hover:text-purple-100 cursor-pointer underline font-medium"
                                        >
                                            Xem chi tiết
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {showPanel && detailData && <ExamDetailPanel data={detailData} onClose={() => setShowPanel(false)} />}
        </div>
    );
}