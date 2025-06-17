"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import CategoryService from "../../../../../services/CategoryService"
import { Input } from "../../../../../components/ui/input"
import { Button } from "../../../../../components/ui/button"
import { Card, CardContent, CardHeader } from "../../../../../components/ui/card"
import { Separator } from "../../../../../components/ui/separator"
import { toast } from "sonner"
import { ArrowLeft, Save, X, Edit, FileText } from "lucide-react"
import * as Yup from "yup"

export default function EditCategoryForm() {
    const router = useRouter()
    const { id } = useParams()
    const [form, setForm] = useState({ name: "", description: "" })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    const schema = Yup.object().shape({
        name: Yup.string()
            .required("Tên danh mục là bắt buộc")
            .matches(/^[A-ZÀ-Ỹ]/, "Tên danh mục phải bắt đầu bằng chữ cái in hoa"),
    })

    useEffect(() => {
        const fetchCategory = async () => {
            try {
                const response = await CategoryService.getById(id)
                setForm(response.data)
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        }
        fetchCategory()
    }, [id])

    const handleChange = async (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))

        // Re-validate field immediately
        try {
            await schema.validateAt(name, { ...form, [name]: value })
            setErrors((prev) => ({ ...prev, [name]: undefined }))
        } catch (err) {
            setErrors((prev) => ({ ...prev, [name]: err.message }))
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await schema.validate(form, { abortEarly: false })
            setSubmitting(true)
            await CategoryService.update(id, form)
            toast.success("Cập nhật thành công!")
        } catch (err) {
            if (err.name === "ValidationError") {
                const newErrors = {}
                err.inner.forEach((e) => {
                    newErrors[e.path] = e.message
                })
                setErrors(newErrors)
            } else {
                toast.error(err.response?.data || "Lỗi không xác định")
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="space-y-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" onClick={() => router.push("/admin/dashboard")} className="p-2">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h1 className="text-2xl font-semibold text-gray-900">Chỉnh sửa danh mục</h1>
                </div>
            </div>

            <Separator />

            <Card className="border border-gray-200">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                        <Edit className="w-5 h-5 text-purple-600" />
                        <span className="text-lg font-medium">Thông tin danh mục</span>
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <label className="text-sm font-medium text-gray-700">Tên danh mục</label>
                                    <span className="text-red-500">*</span>
                                </div>
                                <Input
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    placeholder="Nhập tên danh mục..."
                                    className={`w-full ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-gray-500" />
                                    <label className="text-sm font-medium text-gray-700">Mô tả</label>
                                </div>
                                <Input
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="Nhập mô tả cho danh mục..."
                                    className="w-full"
                                />
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                                <span className="text-red-500">*</span> Trường bắt buộc
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push("/admin/dashboard")}
                                    disabled={submitting}
                                    className="flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card className="border border-gray-200 bg-gray-50">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium text-gray-600">Xem trước</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="space-y-2">
                        <div className="text-lg font-medium">{form.name || "Tên danh mục"}</div>
                        <div className="text-sm text-gray-600">{form.description || "Mô tả danh mục"}</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
