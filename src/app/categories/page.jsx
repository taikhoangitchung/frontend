'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {toast} from 'sonner';
import {Card, CardContent} from '../../components/ui/card';
import {Button} from '../../components/ui/button';
import {Pencil, Trash2, Plus} from 'lucide-react';
import CategoryService from '../../services/CategoryService';

const ITEMS_PER_PAGE = 20;

const CategoryTable = () => {
    const [categories, setCategories] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();

    const fetchCategories = async () => {
        try {
            const res = await CategoryService.getAll();
            const sorted = res.data.sort((a, b) =>
                a.name.localeCompare(b.name, 'vi', { sensitivity: 'base' })
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
            await fetchCategories();
        } catch (err) {
            console.error(err);
            toast.error("Xóa thất bại. Vui lòng thử lại.");
        }
    };

    const handleEdit = (id) => {
        router.push(`/categories/${id}/edit`);
    };

    const handleCreate = () => {
        router.push(`/categories/create`);
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
        <div className="max-w-6xl mx-auto mt-8 px-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-foreground">Danh mục</h2>
                <Button onClick={handleCreate} className="gap-2">
                    <Plus size={16} />
                    Thêm danh mục
                </Button>
            </div>

            <Card className="rounded-xl shadow-sm border">
                <CardContent className="p-0">
                    <table className="w-full text-sm">
                        <thead className="bg-muted text-muted-foreground border-b">
                        <tr>
                            <th className="text-left px-4 py-3 font-medium">ID</th>
                            <th className="text-left px-4 py-3 font-medium">Tên</th>
                            <th className="text-left px-4 py-3 font-medium">Mô tả</th>
                            <th className="text-left px-4 py-3 font-medium">Số câu hỏi</th>
                            <th className="text-center px-4 py-3 font-medium">Hành động</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedCategories.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="text-center py-6 text-muted-foreground">
                                    Không có dữ liệu.
                                </td>
                            </tr>
                        ) : (
                            paginatedCategories.map(cat => (
                                <tr key={cat.id} className="hover:bg-accent transition-colors border-b">
                                    <td className="px-4 py-3">{cat.id}</td>
                                    <td className="px-4 py-3 capitalize">{cat.name}</td>
                                    <td className="px-4 py-3 text-muted-foreground">{cat.description || '—'}</td>
                                    <td className="px-4 py-3">{cat.questionCount}</td>
                                    <td className="px-4 py-3 text-center space-x-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(cat.id)}
                                            className="text-primary"
                                        >
                                            <Pencil size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleDelete(cat.id)}
                                            className="text-destructive"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-6 text-sm text-muted-foreground">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Trang trước
                    </Button>
                    <span className="font-medium">
            Trang {currentPage} / {totalPages}
          </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Trang sau
                    </Button>
                </div>
            )}
        </div>
    );
};

export default CategoryTable;
