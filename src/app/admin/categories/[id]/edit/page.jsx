"use client"

import { useParams } from "next/navigation"
import CategoryForm from "../../../../../components/category/CategoryForm";

export default function EditCategoryForm() {
    const { id } = useParams()
    return <CategoryForm mode="edit" categoryId={id} />
}
