"use client"

import { useFormik } from "formik"
import { Save, X, FileText, ListChecks, Plus, Edit, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import React, { useEffect, useState } from "react"
import CategoryService from "../../services/CategoryService"
import { Button } from "../ui/button"
import { Separator } from "../ui/separator"
import { Card, CardContent, CardHeader } from "../ui/card"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { categorySchema } from "../../yup/categorySchema"

export default function CategoryForm({ mode = "create", categoryId = null }) {
    const router = useRouter()
    const isEditMode = mode === "edit"
    const [loading, setLoading] = useState(isEditMode)
    const [initialValues, setInitialValues] = useState({ name: "", description: "" })

    useEffect(() => {
        if (isEditMode && categoryId) {
            CategoryService.getById(categoryId)
                .then((res) => setInitialValues(res.data))
                .catch(() => toast.error("Không thể tải danh mục"))
                .finally(() => setLoading(false))
        }
    }, [isEditMode, categoryId])

    const formik = useFormik({
        initialValues,
        enableReinitialize: true,
        validationSchema: categorySchema,
        validateOnChange: true,
        onSubmit: async (values, { resetForm }) => {
            try {
                if (isEditMode) {
                    await CategoryService.update(categoryId, values)
                    toast.success("Cập nhật danh mục thành công!")
                } else {
                    await CategoryService.create(values)
                    toast.success("Tạo danh mục thành công!")
                    resetForm()
                }
                router.push("/admin/dashboard?tab=categories")
            } catch (err) {
                toast.error(err.response?.data || "Đã có lỗi xảy ra")
            }
        },
    })

    if (loading) {
        return <div className="p-6 text-gray-500 animate-pulse">Đang tải danh mục...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-4 pb-8">
            <div className="max-w-4xl w-full p-4 space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {isEditMode ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
                    </h1>
                    <button
                        onClick={() => router.push(`/admin/dashboard?tab=categories`)}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 cursor-pointer h-9 px-4 py-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-white">Quay lại</span>
                    </button>
                </div>

                <Separator />

                <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            {isEditMode ? <Edit className="text-purple-600" /> : <Plus className="text-purple-600" />}
                            <span className="text-lg font-medium">Thông tin danh mục</span>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 pb-3">
                        <form onSubmit={formik.handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Tên danh mục</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formik.values.name}
                                        onChange={formik.handleChange}
                                        className={formik.errors.name ? "border-red-500 focus:ring-gray-300 focus:border-gray-200" : "bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-200 border border-gray-500"}
                                        placeholder="Nhập tên danh mục..."
                                    />
                                    {formik.errors.name && (
                                        <p className="text-sm text-red-500">{formik.errors.name}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Mô tả</Label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formik.values.description}
                                        onChange={formik.handleChange}
                                        placeholder="Nhập mô tả danh mục..."
                                        className="resize-none bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-200 border border-gray-500"
                                    />
                                </div>
                            </div>

                            <Separator />

                            <div className="flex justify-end gap-3">
                                <Button
                                    type="button"
                                    onClick={() => router.back()}
                                    disabled={formik.isSubmitting}
                                    className="flex items-center gap-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 shadow-sm transition-all duration-200 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={formik.isSubmitting}
                                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 shadow-md transition-all duration-200 cursor-pointer"
                                >
                                    <Save className="w-4 h-4" />
                                    {isEditMode ? "Lưu thay đổi" : "Tạo danh mục"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Preview */}
                <Card className="bg-white shadow-sm border border-gray-200">
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-gray-900">Xem trước</h2>
                    </CardHeader>
                    <CardContent className="p-6 space-y-3 pt-0">
                        <div className="text-lg font-semibold text-purple-800">
                            {formik.values.name || "Tên danh mục"}
                        </div>
                        <div className="flex gap-2 text-sm text-gray-700">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span>{formik.values.description || "—"}</span>
                        </div>
                        <div className="flex gap-2 text-sm text-gray-700">
                            <ListChecks className="w-4 h-4 text-green-600" />
                            <span className="font-semibold">0 câu hỏi</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}