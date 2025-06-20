import React, { useEffect, useState } from 'react';
import CategoryService from "../../services/CategoryService";
import ExamService from "../../services/ExamService";
import ExamForm from '../exam/ExamForm';

function CategoryCard() {
    const [categories, setCategories] = useState([]);
    const [examsByCategory, setExamsByCategory] = useState({});
    const [showForm, setShowForm] = useState({ visible: false, exam: null });

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
        setShowForm({ visible: true, exam });
    };

    const handleCloseForm = () => {
        setShowForm({ visible: false, exam: null });
    };

    return (
        <div className="flex flex-col gap-8 p-4 relative">
            {categories.map((category) => (
                <div key={category.id} className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 pb-2">
                        {category.name}
                    </h2>
                    <div className="flex gap-4 overflow-x-auto scrollbar-hidden">
                        {(examsByCategory[category.id] || []).map((exam) => (
                            <div
                                key={exam.id}
                                className="w-64 min-w-[16rem] bg-white shadow-lg rounded-xl p-0 transform transition-all duration-300 hover:shadow-2xl hover:scale-105 relative overflow-hidden cursor-pointer"
                                onClick={() => handleCardClick(exam)}
                            >
                                <div className="w-full h-32 rounded-t-xl overflow-hidden relative group">
                                    <img
                                        src="/cardquiz.png"
                                        alt={exam.title}
                                        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90"
                                    />
                                    <div
                                        className="absolute top-2 left-2 bg-white/80 rounded px-2 py-1 text-xs font-semibold border-none outline-none ring-0 shadow-none transition-colors group-hover:bg-white/90"
                                    >
                                        {exam.questionCount} Qs
                                    </div>
                                    <div
                                        className="absolute top-2 right-2 bg-white/80 rounded px-2 py-1 text-xs font-semibold text-purple-700 border-none outline-none ring-0 shadow-none transition-colors group-hover:bg-white/90"
                                    >
                                        {exam.playedTimes.toLocaleString()} lần chơi
                                    </div>
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                                </div>
                                <div className="p-4">
                                    <div className="text-center text-base text-gray-800 hover:text-gray-900 transition-colors duration-300">
                                        {exam.title}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {showForm.visible && (
                <div
                    className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50"
                    onClick={handleCloseForm}
                >
                    <ExamForm exam={showForm.exam} onClose={handleCloseForm} />
                </div>
            )}
        </div>
    );
}

export default CategoryCard;