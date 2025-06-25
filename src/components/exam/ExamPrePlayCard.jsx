'use client';

import React from 'react';
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Play, Globe } from "lucide-react";
import RoomService from "../../services/RoomService";

function ExamPrePlayCard({ exam, onClose }) {
    const router = useRouter();

    async function handleCreateRoom(id) {
        try {
            const response = await RoomService.create(id);
            router.push(`/users/exams/online/${response.data}`);
        } catch (error) {
            console.error(error);
            toast.error("Đã xảy ra lỗi khi tạo phòng thi!");
        }
    }

    return (
        <div
            className="w-118 bg-white shadow-lg rounded-2xl p-0 relative overflow-hidden transform transition-all duration-200 hover:shadow-2xl hover:scale-105 cursor-pointer"
            onClick={(e) => e.stopPropagation()}
        >
            <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl transition-all duration-200 disabled:cursor-not-allowed"
                onClick={onClose}
            >
                ✕
            </button>

            <div className="w-full h-78 bg-purple-500 rounded-t-2xl overflow-hidden relative flex items-center justify-center">
                <img
                    src="/cardquiz.png"
                    alt={exam.title}
                    className="w-full h-full object-cover opacity-50 transition-all duration-200"
                />
                <div className="absolute top-2 left-2 bg-white bg-opacity-80 rounded-full px-3 py-1.5 text-sm font-semibold text-gray-700">
                    {exam.questionCount} Câu hỏi
                </div>
                <div className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full px-3 py-1.5 text-sm font-semibold">
                    {exam.playedTimes.toLocaleString()} lượt chơi
                </div>
            </div>

            <div className="p-6 text-center">
                <h5 className="text-left text-base font-medium mb-2">
                    Cấp độ khó: {exam.difficulty.name}
                </h5>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                    {exam.title}
                </h2>

                <div className="flex justify-between px-2 mt-6 gap-4">
                    <button
                        className="flex-1 bg-green-500 text-white h-12 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-green-600 hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed cursor-pointer"
                        onClick={() => router.push(`/users/exams/${exam.id}/play`)}
                    >
                        <Play className="w-5 h-5" />
                        Thực hành
                    </button>

                    <button
                        className="flex-1 bg-purple-500 text-white h-12 rounded-xl shadow-md flex items-center justify-center gap-2 hover:bg-purple-600 hover:scale-105 transition-all duration-200 disabled:cursor-not-allowed cursor-pointer"
                        onClick={() => handleCreateRoom(exam.id)}
                    >
                        <Globe className="w-5 h-5" />
                        Thách đấu bạn bè
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExamPrePlayCard;