import React, { useEffect, useState } from 'react';
import CategoryService from "../../services/CategoryService";
import ExamService from "../../services/ExamService";
import { Crown, Star, Search } from "lucide-react";

export default function ExamSummaryCard({ search, onExamClick }) {
    const [categories, setCategories] = useState([]);
    const [examsByCategory, setExamsByCategory] = useState({});

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

    const allFilteredExamsEmpty = categories.every((category) => {
        const lowerSearch = search?.toLowerCase() || "";
        const isCategoryMatch = category.name.toLowerCase().includes(lowerSearch);

        return (examsByCategory[category.id] || []).filter(
            (exam) =>
                isCategoryMatch || exam.title.toLowerCase().includes(lowerSearch)
        ).length === 0;
    });

    return (
        <div className="container mx-auto px-4 py-6">
            {allFilteredExamsEmpty ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <Search className="w-12 h-12 mb-4 text-purple-400" />
                    <p className="text-lg font-medium">Không tìm thấy bài quiz phù hợp</p>
                    <p className="text-sm">Hãy thử nhập lại tên hoặc chọn danh mục khác</p>
                </div>
            ) : (
                categories.map((category) => {
                    const lowerSearch = search?.toLowerCase() || "";
                    const isCategoryMatch = category.name.toLowerCase().includes(lowerSearch);

                    const filteredExams = (examsByCategory[category.id] || []).filter(
                        (exam) =>
                            isCategoryMatch || exam.title.toLowerCase().includes(lowerSearch)
                    ).sort((a, b) => b.playedTimes - a.playedTimes);

                    if (filteredExams.length === 0) return null;

                    return (
                        <section
                            key={category.id}
                            className="mb-8"
                            aria-labelledby={`category-${category.id}`}
                        >
                            <h2
                                id={`category-${category.id}`}
                                className="text-2xl font-bold text-gray-800 mb-4"
                            >
                                {category.name}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredExams.map((exam, index) => {
                                    const icon = index === 0
                                        ? <Crown className="w-5 h-5 text-yellow-500" />
                                        : index === 1
                                            ? <Star className="w-5 h-5 text-orange-500" />
                                            : <Star className="w-5 h-5 text-gray-400" />;

                                    const bgColor = index === 0
                                        ? "bg-yellow-100"
                                        : index === 1
                                            ? "bg-orange-100"
                                            : "bg-gray-200";

                                    return (
                                        <article
                                            key={exam.id}
                                            className="relative bg-white shadow-md rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            onClick={() => onExamClick(exam)}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" || e.key === " ") {
                                                    onExamClick(exam);
                                                }
                                            }}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={`Chọn bài thi ${exam.title}`}
                                        >
                                            <div className="relative h-32 w-full overflow-hidden group">
                                                <img
                                                    src="/cardquiz.png"
                                                    alt={exam.title}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                    loading="lazy"
                                                />
                                                <div className="absolute top-3 left-3 bg-white/90 rounded-lg px-2 py-1 text-xs font-semibold text-gray-700">
                                                    {exam.questionCount} Câu hỏi
                                                </div>
                                                <div className="absolute top-3 right-3 bg-white/90 rounded-lg px-2 py-1 text-xs font-semibold flex items-center gap-1 text-gray-700">
                                                    <span
                                                        className={`p-1 rounded-full ${bgColor} bg-opacity-40 flex items-center justify-center`}
                                                    >
                                                        {icon}
                                                    </span>
                                                    {exam.playedTimes.toLocaleString()} lần chơi
                                                </div>
                                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            </div>
                                            <div className="p-4 text-center">
                                                <p className="text-base font-medium text-gray-800 group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
                                                    {exam.title}
                                                </p>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })
            )}
        </div>
    );
}