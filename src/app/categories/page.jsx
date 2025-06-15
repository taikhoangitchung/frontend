'use client';

import React, {useEffect, useState} from 'react';
import CategoryService from '../../services/CategoryService';
import {Pencil, Trash2} from 'lucide-react';
import {toast} from 'sonner';
import {useRouter} from "next/navigation";

const ITEMS_PER_PAGE = 20;

const CategoryTable = () => {
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    const fetchCategories = async () => {
        try {
            const res = await CategoryService.getAll();
            const sorted = res.data.sort((a, b) =>
                a.name.localeCompare(b.name, 'vi', {sensitivity: 'base'})
            );
            setCategories(sorted);
        } catch (err) {
            console.error("Lỗi khi fetch categories:", err);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

        try {
            await CategoryService.delete(id);
            toast.success("Xóa danh mục thành công.");
            await fetchCategories(); // Reload
        } catch (err) {
            console.error(err);
            toast.error("Xóa thất bại. Vui lòng thử lại.");
        }
    };

    const handleEdit = (id) => {
        router.push(`/categories/${id}/edit`);
    };

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
        <div className="max-w-6xl mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4">Danh sách danh mục</h2>
            <table className="w-full border border-gray-300 text-left">
                <thead className="bg-gray-100">
                <tr>
                    <th className="border px-4 py-2">ID</th>
                    <th className="border px-4 py-2">Tên</th>
                    <th className="border px-4 py-2">Mô tả</th>
                    <th className="border px-4 py-2">Số câu hỏi</th>
                    <th className="border px-4 py-2 text-center">Hành động</th>
                </tr>
                </thead>
                <tbody>
                {paginatedCategories.length === 0 ? (
                    <tr>
                        <td colSpan="5" className="text-center py-4">Không có dữ liệu.</td>
                    </tr>
                ) : (
                    paginatedCategories.map((cat) => (
                        <tr key={cat.id} className="hover:bg-gray-50">
                            <td className="border px-4 py-2">{cat.id}</td>
                            <td className="border px-4 py-2 capitalize">{cat.name}</td>
                            <td className="border px-4 py-2">{cat.description || '—'}</td>
                            <td className="border px-4 py-2">{cat.questionCount}</td>
                            <td className="border px-4 py-2 text-center">
                                <button
                                    onClick={() => handleEdit(cat.id)}
                                    className="text-blue-600 hover:text-blue-800 mr-3"
                                    title="Sửa"
                                >
                                    <Pencil size={18}/>
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Xóa"
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </td>
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
