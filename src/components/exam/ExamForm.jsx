import React from 'react';
import {toast} from "sonner";
import {useRouter} from "next/navigation";

function ExamForm({ exam, onClose }) {

    const router = useRouter()



    return (
        <div
            className="w-118 bg-white shadow-lg rounded-xl p-0 relative overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-2xl hover:scale-105"
            onClick={(e) => e.stopPropagation()} // Ngăn sự kiện click lan ra ngoài
        >
            <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                onClick={onClose}
            >
                ✕
            </button>
            <div className="w-full h-78 bg-purple-500 rounded-t-xl overflow-hidden relative flex items-center justify-center">
                <img
                    src="/cardquiz.png"
                    alt={exam.title}
                    className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300"
                />
                <div className="absolute top-2 left-2 bg-white bg-opacity-80 rounded-full px-3 py-1.5 text-sm font-semibold text-gray-700">
                    {exam.questionCount} Qs
                </div>
                <div className="absolute top-2 right-2 bg-white bg-opacity-80 rounded-full px-3 py-1.5 text-sm font-semibold text-purple-700">
                    {exam.playedTimes.toLocaleString()} lần chơi
                </div>
            </div>
            <div className="p-6 text-center">
                <h5 className="text-left text-base font-medium text-blue-500 mb-2">Cấp độ khó: {exam.difficulty.name}</h5>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">{exam.title}</h2>
                <div className="flex justify-between px-4 mt-4">
                    <button
                        className="bg-green-500 text-white w-48 h-12 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 hover:scale-105 transition-all duration-300 text-lg"
                        onClick={() => router.push(`/users/exams/${exam.id}/play`)}
                    >
                        Thực hành <span>▶️</span>
                    </button>
                    <button
                        className="bg-purple-500 text-white w-48 h-12 rounded-lg flex items-center justify-center gap-2 hover:bg-purple-600 hover:scale-105 transition-all duration-300 text-lg"
                        onClick={()=>toast.info("Chức năng này đang được phát triển...")}
                    >
                        Thách đấu với bạn bè <span>👥</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ExamForm;