"use client"

import { Trash2 } from "lucide-react"
import ConfirmDialog from "./ConfirmDialog"

export default function DeleteButton({
                                                    id,
                                                    handleDelete,
                                                    disabled = false,
                                                }) {
    return (
        <ConfirmDialog
            trigger={
                <button
                    className="text-red-600 hover:text-red-800 p-2 disabled:opacity-50"
                    title="Xoá"
                    disabled={disabled}
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            }
            title="Xác nhận xoá"
            description="Bạn có chắc chắn muốn xoá mục này? Hành động này không thể hoàn tác."
            actionLabel="Xoá"
            actionClass="bg-red-600 hover:bg-red-700 text-white"
            onConfirm={() => handleDelete(id)}
        />
    )
}
