'use client'

import { useFormik } from 'formik'
import * as Yup from 'yup'
import { useState } from 'react'

import { Card, CardContent } from '../../../components/ui/card'
import { Label } from '../../../components/ui/label'
import { Input } from '../../../components/ui/input'
import { Textarea } from '../../../components/ui/textarea'
import { Button } from '../../../components/ui/button'
import { toast } from 'sonner'
import CategoryService from "../../../services/CategoryService";

export default function CreateCategoryForm() {
    const [isSubmitting, setIsSubmitting] = useState(false)

    const formik = useFormik({
        initialValues: {
            name: '',
            description: '',
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Tên danh mục là bắt buộc'),
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
    })

    return (
        <Card className="max-w-md mx-auto mt-6 shadow-xl p-4">
            <CardContent>
                <h2 className="text-xl font-semibold mb-4">Thêm danh mục mới</h2>
                <form onSubmit={formik.handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="name">Tên danh mục</Label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="Nhập tên danh mục"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                        {formik.touched.name && formik.errors.name && (
                            <p className="text-sm text-red-500 mt-1">{formik.errors.name}</p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="description">Mô tả</Label>
                        <Textarea
                            id="description"
                            name="description"
                            placeholder="(Tùy chọn) Mô tả danh mục"
                            value={formik.values.description}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                        />
                    </div>

                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Đang lưu...' : 'Tạo danh mục'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
