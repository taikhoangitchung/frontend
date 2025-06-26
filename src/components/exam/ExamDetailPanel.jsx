"use client"

import { useRef } from "react"
import {X} from "lucide-react"

export default function ExamDetailPanel({ data, onClose }) {
    const panelRef = useRef(null)
    console.log(data)
    const handleOverlayClick = (e) => {
        if (panelRef.current && !panelRef.current.contains(e.target)) {
            onClose()
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
             onClick={handleOverlayClick}
        >

            <div
                ref={panelRef}
                className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto text-black relative"
            >
                {/* Nút X ở góc trên bên phải */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-full p-1 text-gray-500 transition-colors duration-200 ease-in-out hover:bg-red-500 hover:text-white focus:outline-none z-50 cursor-pointer"
                    aria-label="Đóng"
                >
                    <X size={20} />
                </button>

                <h2 className="text-2xl font-bold mb-4 text-purple-900">Chi tiết bài làm</h2>

                <div className="space-y-6">
                    {data.map((question, index) => (
                        <div key={question.id} className="bg-purple-50 p-4 rounded-xl shadow-sm border">
                            <p className="font-semibold mb-4 text-purple-800">
                                {index + 1}. {question.content}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {question.answers.map((answer) => {
                                    const isSelected = question.selectedAnswerIds.includes(answer.id)
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
                                                    Đã chọn
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
            </div>
        </div>
    )
}
