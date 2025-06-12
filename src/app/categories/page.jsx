'use client';
import React, { useEffect, useState } from 'react';
import CategoryService from '../../services/CategoryService';

const ITEMS_PER_PAGE = 20;

const CategoryTable = () => {
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        CategoryService.getAll()
            .then((res) => {
                const sorted = res.data.sort((a, b) =>
                    a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
                );
                setCategories(sorted);
            })
            .catch((err) => console.error("Lỗi khi fetch categories:", err));
    }, []);

    const totalPages = Math.ceil(categories.length / ITEMS_PER_PAGE);

    const paginatedCategories = categories.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4">Danh sách chuyên mục</h2>
            <table className="w-full border border-gray-300 text-left">
                <thead className="bg-gray-100">
                <tr>
                    <th className="border px-4 py-2">ID</th>
                    <th className="border px-4 py-2">Tên</th>
                    <th className="border px-4 py-2">Mô tả</th>
                    <th className="border px-4 py-2">Số câu hỏi</th>
                </tr>
                </thead>
                <tbody>
                {paginatedCategories.length === 0 ? (
                    <tr>
                        <td colSpan="4" className="text-center py-4">Không có dữ liệu.</td>
                    </tr>
                ) : (
                    paginatedCategories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">{cat.id}</td>
                            <td className="border px-4 py-2 capitalize">{cat.name}</td>
                            <td className="border px-4 py-2">{cat.description || '—'}</td>
                            <td className="border px-4 py-2">{cat.questionCount}</td>
                        </tr>
                    ))
                )}
                </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-4">
                <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Trang trước
                </button>
                <span className="px-2">
          Trang {currentPage} / {totalPages}
        </span>
                <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Trang sau
                </button>
            </div>
        </div>
    );
};

export default CategoryTable;
