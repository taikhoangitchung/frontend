"use client"

import { Trash2 } from "lucide-react"
import ConfirmDialog from "./ConfirmDialog"
import { Button } from "../ui/button"

export default function DeleteButton({
    id,
    handleDelete,
    ...props
}) {
    return (
        <ConfirmDialog
            trigger={
                <Button {...props} title="Xoá" className="cursor-pointer text-red-500 hover:text-red-600 hover:bg-red-100 px-2 py-1 transition-all duration-200">
                    <Trash2 className="w-4 h-4" />
                </Button>
            }
            title="Xác nhận xoá"
            description="Bạn có chắc chắn muốn xoá mục này? Hành động này không thể hoàn tác."
            actionLabel="Xoá"
            actionClass="bg-red-600 hover:bg-red-700 text-white"
            onConfirm={() => handleDelete(id)}
        />
    )
}