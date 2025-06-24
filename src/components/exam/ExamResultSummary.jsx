"use client"

import {useEffect, useState} from "react"
import {Button} from "../ui/button"
import { useRouter} from "next/navigation";
import {RotateCcw, Search, FileText} from "lucide-react"
import HistoryService from "../../services/HistoryService";
import ExamDetailPanel from "./ExamDetailPanel";
import RankStars from "../icon/rank";

export default function ExamResultSummary({isOnline, onReplay, historyId }) {
    const [showPanel, setShowPanel] = useState(false);
    const router = useRouter()
    const [data, setData] = useState(null)
    const username= localStorage.getItem("username")
    const [loading, setLoading] = useState(true)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await HistoryService.getHistoryDetail(historyId);
                console.log(response.data)
                setData(response.data)
            }catch (error) {
                console.error(error)
            }finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [historyId])

    const avgTimePerQ = data && data.correct + data.wrong > 0
        ? Math.round(data.timeTaken / (data.correct + data.wrong))
        : 0;

    const showDetail = () => {
        setShowPanel(true);
    };

    if (loading || !data) return <div className="text-white">Đang tải...</div>;

    return (
        <div className="flex flex-col items-center gap-6 text-white px-4">
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
                                    const isCurrentUser = r.username === username;

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
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
                {/* Action Buttons */}
                <div className="flex flex-col gap-2 mt-6">
                    {!isOnline && (
                        <Button
                            onClick={onReplay}
                            className="bg-purple-500 hover:bg-purple-600 text-white rounded-full font-semibold py-2 flex items-center gap-2"
                        >
                            <RotateCcw size={18}/>
                            Chơi lại
                        </Button>
                    )}

                    <Button className="bg-white text-purple-900 rounded-full font-semibold py-2"
                            onClick={() => router.push("/users/dashboard")}>
                        <Search size={18}/>
                        Tìm quiz mới
                    </Button>
                    <Button
                        onClick={showDetail}
                        className="bg-white text-purple-900 rounded-full px-6 py-2 font-semibold mt-2"
                    >
                        <FileText size={18}/>
                        Xem chi tiết
                    </Button>
                </div>
            </div>
            {showPanel && (
                <ExamDetailPanel
                    data={data.fullQuestions.map((q) => ({
                        ...q,
                        selectedAnswerIds: data.choices.find(c => c.questionId === q.id)?.selectedAnswerIds || []
                    }))}
                    onClose={() => setShowPanel(false)}
                />
            )}
        </div>

    )
}
