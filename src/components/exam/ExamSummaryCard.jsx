import React, {useEffect, useState} from 'react';
import CategoryService from "../../services/CategoryService";
import ExamService from "../../services/ExamService";
import ExamPrePlayCard from './ExamPrePlayCard';
import {Crown, Star, Search} from "lucide-react";


export default function ExamSummaryCard({search}) {
    const [categories, setCategories] = useState([]);
    const [examsByCategory, setExamsByCategory] = useState({});
    const [showForm, setShowForm] = useState({visible: false, exam: null});

    useEffect(() => {
        CategoryService.getAll()
            .then((response) => {
                setCategories(response.data);
                response.data.forEach((category) => {
                    ExamService.getByCategory(category.id)
                        .then((res) => {
                            setExamsByCategory((prev) => ({
                                ...prev,
                                [category.id]: res.data,
                            }));
                        })
                        .catch((error) => {
                            console.error(`Lỗi khi lấy exam cho category ${category.id}:`, error);
                        });
                });
            })
            .catch((error) => {
                console.error("Lỗi khi lấy danh mục:", error);
            });
    }, []);

    const handleCardClick = (exam) => {
        setShowForm({visible: true, exam});
    };

    const handleCloseForm = () => {
        setShowForm({visible: false, exam: null});
    };

    const allFilteredExamsEmpty = categories.every((category) => {
        const lowerSearch = search?.toLowerCase() || "";
        const isCategoryMatch = category.name.toLowerCase().includes(lowerSearch);

        return (examsByCategory[category.id] || []).filter(
            (exam) =>
                isCategoryMatch || exam.title.toLowerCase().includes(lowerSearch)
        ).length === 0;
    });

    return (
        <div className="flex flex-col gap-5 px-4 pb-5">
            {allFilteredExamsEmpty ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Search className="w-12 h-12 mb-4 text-purple-400"/>
                    <p className="text-lg font-medium">Không tìm thấy bài quiz phù hợp</p>
                    <p className="text-sm">Hãy thử nhập lại tên hoặc chọn danh mục khác</p>
                </div>
            ) : (categories.map((category) => {
                const lowerSearch = search?.toLowerCase() || "";

                const isCategoryMatch = category.name.toLowerCase().includes(lowerSearch);

                const filteredExams = (examsByCategory[category.id] || []).filter(
                    (exam) =>
                        isCategoryMatch || exam.title.toLowerCase().includes(lowerSearch)
                ).sort((a, b) => b.playedTimes - a.playedTimes);

                if (filteredExams.length === 0) return null;

                return (
                    <div key={category.id} className="mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 pb-2">
                            {category.name}
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                            {filteredExams.map((exam, index) => {
                                const icon = index === 0
                                    ? <Crown className="w-4 h-4 text-yellow-500"/>
                                    : index === 1
                                        ? <Star className="w-4 h-4 text-orange-500"/>
                                        : <Star className="w-4 h-4 text-gray-400"/>;

                                const bgColor = index === 0
                                    ? "bg-yellow-100"
                                    : index === 1
                                        ? "bg-orange-100"
                                        : "bg-gray-200";

                                return (
                                    <div
                                        key={exam.id}
                                        className="w-full bg-white shadow-lg rounded-xl p-0 transform transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden cursor-pointer"
                                        onClick={() => handleCardClick(exam)}
                                    >
                                        <div className="w-full h-32 rounded-t-xl overflow-hidden relative group">
                                            <img
                                                src="/cardquiz.png"
                                                alt={exam.title}
                                                className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                                            />
                                            <div
                                                className="absolute top-2 left-2 bg-white/80 rounded px-2 py-1 text-xs font-semibold">
                                                {exam.questionCount} Câu hỏi
                                            </div>
                                            <div
                                                className="absolute top-2 right-2 bg-white/80 rounded px-2 py-1 text-xs font-semibold flex items-center gap-1">
                                                <div
                                                    className={`p-1 rounded-full ${bgColor} bg-opacity-40 flex items-center justify-center`}>
                                                    {icon}
                                                </div>
                                                {exam.playedTimes.toLocaleString()} lượt chơi
                                            </div>
                                            <div
                                                className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                                        </div>
                                        <div className="p-4">
                                            <div
                                                className="text-center text-base text-gray-800 hover:text-gray-900 transition-colors duration-300">
                                                {exam.title}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            }))}
            {showForm.visible && (
                <div
                    className="fixed inset-0 bg-opacity-5 backdrop-blur-xs flex items-center justify-center z-50"
                    onClick={handleCloseForm}
                >
                    <ExamPrePlayCard exam={showForm.exam} onClose={handleCloseForm}/>
                </div>
            )}
        </div>
    )
}