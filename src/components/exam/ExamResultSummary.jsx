"use client"

import { useEffect, useState } from "react"
import { Button } from "../ui/button"
import {useParams, useRouter} from "next/navigation";
import { RotateCcw, Search,FileText } from "lucide-react"

export default function ExamResultSummary({ result, onReview, onReplay }) {
    const router = useRouter()
    const [username, setUsername] = useState("")
    const {id} = useParams()

    useEffect(() => {
        const storedName = localStorage.getItem("username")
        if (storedName) {
            setUsername(storedName)
        }
    }, [])

    if (!result) return null

    const total = result.correct + result.wrong
    const correctRatio = total > 0 ? (result.correct / total) * 100 : 0
    const avgTimePerQ = total > 0 ? Math.round(result.timeTaken / total) : 0

    return (
        <div className="flex flex-col items-center gap-6 text-white px-4">
            <div className="bg-purple-900 w-full max-w-xl rounded-xl p-6 shadow-lg text-center space-y-6">
                <h2 className="text-lg text-purple-200">
                    Chúc mừng <span className="font-bold text-white">{username || "Người dùng"}</span> đã hoàn thành bài thi!
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4 text-sm w-full">
                    <div className="bg-emerald-500 p-4 rounded-xl text-center">
                        <p className="text-purple-200 text-xs mb-1">Câu đúng</p>
                        <p className="font-bold text-xl text-white">{result.correct}</p>
                    </div>

                    <div className="bg-red-500 p-4 rounded-xl text-center">
                        <p className="text-purple-200 text-xs mb-1">Câu sai</p>
                        <p className="font-bold text-xl text-white">{result.wrong}</p>
                    </div>

                    <div className="bg-purple-700 p-4 rounded-xl text-center">
                        <p className="text-purple-200 text-xs mb-1">Điểm số</p>
                        <p className="font-bold text-xl text-white">{result.score.toFixed(1)}</p>
                    </div>

                    <div className="bg-cyan-700 p-4 rounded-xl text-center">
                        <p className="text-purple-200 text-xs mb-1">Tốc độ</p>
                        <p className="font-bold text-xl text-white">{avgTimePerQ}s / câu</p>
                    </div>

                    <div className="bg-orange-400 p-4 rounded-xl text-center">
                        <p className="text-purple-200 text-xs mb-1">Thời gian hoàn thành</p>
                        <p className="font-bold text-xl text-white">{result.timeTaken}s</p>
                    </div>

                    <div className="bg-black/40 p-4 rounded-xl text-center">
                        <p className="text-purple-200 text-xs mb-1">Thứ hạng</p>
                        <p className="font-bold text-xl text-white">- / -</p>
                    </div>
                </div>


                {/* Action Buttons */}
                <div className="flex flex-col gap-2 mt-6">
                    <Button
                        onClick={onReplay}
                        className="bg-purple-500 hover:bg-purple-600 text-white rounded-full font-semibold py-2 flex items-center gap-2"
                    >
                        <RotateCcw size={18} />
                        Chơi lại
                    </Button>

                    <Button className="bg-white text-purple-900 rounded-full font-semibold py-2"
                    onClick={()=>router.push("/users/dashboard")}>
                        <Search size={18} />
                        Tìm quiz mới
                    </Button>
                    <Button
                        onClick={onReview}
                        className="bg-white text-purple-900 rounded-full px-6 py-2 font-semibold mt-2"
                    >
                        <FileText size={18} />
                        Xem chi tiết
                    </Button>
                </div>
            </div>
        </div>
    )
}
