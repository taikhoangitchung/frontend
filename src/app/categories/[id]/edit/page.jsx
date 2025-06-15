'use client';
import React, {useEffect, useState} from 'react';
import {useParams, useRouter} from 'next/navigation';
import CategoryService from '../../../../services/CategoryService';
import {Input} from '../../../../components/ui/input';
import {Button} from '../../../../components/ui/button';
import {toast} from 'sonner';

export default function EditCategoryForm() {
    const router = useRouter();
    const {id} = useParams();
    const [form, setForm] = useState({name: '', description: ''});

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await CategoryService.getById(id);
                setForm(response.data);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCategory();
    }, [id]);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await CategoryService.update(id, form);
            toast.success('Cập nhật thành công!');
        } catch (err) {
            console.error(err);
            toast.error(err.response.data);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="max-w-xl mx-auto mt-10">
            <h2 className="text-2xl font-bold mb-4">Chỉnh sửa chuyên mục</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium mb-1">Tên</label>
                    <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Mô tả</label>
                    <Input
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                    />
                </div>
                <div className="flex gap-2">
                    <Button type="submit">Lưu</Button>
                    <Button type="button" variant="outline" onClick={() => router.push("/categories")}>Hủy</Button>
                </div>
            </form>
        </div>
    );
}
