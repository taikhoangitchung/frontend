"use client"

import jwt_decode from "jwt-decode";
import { useFormik } from "formik"
import * as Yup from "yup"
import {useEffect, useState} from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "../../../components/ui/card"
import { Label } from "../../../components/ui/label"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Button } from "../../../components/ui/button"
import { Separator } from "../../../components/ui/separator"
import { toast } from "sonner"
import { ArrowLeft, Plus, FileText, AlignLeft, Save, X } from "lucide-react"
import CategoryService from "../../../services/CategoryService"

export default function CreateCategoryForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const formik = useFormik({
        initialValues: {
            name: "",
            description: "",
        },
        validationSchema: Yup.object({
            name: Yup.string()
                .required("Tên danh mục là bắt buộc")
                .matches(/^[A-ZÀ-Ỹ]/, "Tên danh mục phải bắt đầu bằng chữ cái in hoa"),
        }),
        onSubmit: async (values, { resetForm }) => {
            setIsSubmitting(true)
            try {
                const response = await CategoryService.create(values)
                toast.success(response.data)
                resetForm()
            } catch (error) {
                toast.error(error.response.data)
            } finally {
                setIsSubmitting(false)
            }
        },
        validateOnChange: true,
        validateOnBlur: false,
    })


    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/categories")} className="p-2">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-2xl font-semibold text-gray-900">Thêm danh mục mới</h1>
                </div>
            </div>

            <Separator />

            {/* Form Card */}
            <Card className="border border-gray-200">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <Plus className="w-5 h-5 text-purple-600" />
                        <span className="text-lg font-medium">Thông tin danh mục</span>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={formik.handleSubmit} className="space-y-6">
                        {/* Form Fields */}
                        <div className="space-y-4">
                            {/* Name Field */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                                        Tên danh mục
                                    </Label>
                                    <span className="text-red-500">*</span>
                                </div>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Nhập tên danh mục..."
                                    value={formik.values.name}
                                    onChange={formik.handleChange}
                                    className={`w-full ${
                                        formik.errors.name && formik.values.name ? "border-red-500 focus:border-red-500" : ""
                                    }`}
                                />
                                {formik.errors.name && formik.values.name && (
                                    <p className="text-sm text-red-500 flex items-center gap-1">
                                        <X className="w-3 h-3" />
                                        {formik.errors.name}
                                    </p>
                                )}
                            </div>

                            {/* Description Field */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <AlignLeft className="w-4 h-4 text-gray-500" />
                                    <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                                        Mô tả
                                    </Label>
                                    <span className="text-gray-400 text-xs">(Tùy chọn)</span>
                                </div>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="Nhập mô tả cho danh mục..."
                                    value={formik.values.description}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    className="w-full min-h-[100px] resize-none"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                <span className="text-red-500">*</span> Trường bắt buộc
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/categories")}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {isSubmitting ? "Đang tạo..." : "Tạo danh mục"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Preview Card */}
            <Card className="border border-gray-200 bg-gray-50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600">Xem trước</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <div className="text-lg font-medium">{formik.values.name || "Tên danh mục"}</div>
                    </div>

                    {/* Preview as card like in the list */}
                    <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                        <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="flex items-center gap-2 p-2 rounded border bg-blue-50 border-blue-200">
                                    <span className="text-xs font-medium">Mô tả:</span>
                                    <span className="text-xs">{formik.values.description || "—"}</span>
                                </div>
                                <div className="flex items-center gap-2 p-2 rounded border bg-green-50 border-green-200">
                                    <span className="text-xs font-medium">Số câu hỏi:</span>
                                    <span className="text-xs font-semibold">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
