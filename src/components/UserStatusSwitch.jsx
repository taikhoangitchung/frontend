"use client"

import { useEffect, useState } from "react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog"

export default function UserStatusSwitch({ user, onToggle }) {
    const [checked, setChecked] = useState(user.active)
    const [showDialog, setShowDialog] = useState(false)
    const [pendingAction, setPendingAction] = useState(null)

    useEffect(() => {
        setChecked(user.active)
    }, [user.active])

    const handleChange = async () => {
        const newChecked = !checked
        setPendingAction(newChecked)
        setShowDialog(true)
    }

    const handleConfirm = async () => {
        if (pendingAction !== null) {
            setChecked(pendingAction)
            await onToggle(user, pendingAction)
            setPendingAction(null)
        }
        setShowDialog(false)
    }

    const handleCancel = () => {
        setPendingAction(null)
        setShowDialog(false)
    }

    return (
        <>
            <button
                role="switch"
                aria-checked={checked}
                onClick={handleChange}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring
          ${checked ? "bg-green-500" : "bg-red-500"}`}
            >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
            ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
            </button>

            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <div className={`fixed inset-0 z-[9998] ${showDialog ? "block" : "hidden"}`}>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCancel} />
                </div>
                <AlertDialogContent className="z-[9999] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-2xl border-0 max-w-md w-full mx-4">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg font-semibold">Xác nhận thay đổi trạng thái</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-600 mt-2">
                            {pendingAction ? (
                                <>
                                    Bạn có chắc chắn muốn <span className="font-semibold text-green-600">kích hoạt</span> tài khoản của{" "}
                                    <span className="font-semibold">{user.name || user.email}</span>?
                                </>
                            ) : (
                                <>
                                    Bạn có chắc chắn muốn <span className="font-semibold text-red-600">vô hiệu hóa</span> tài khoản của{" "}
                                    <span className="font-semibold">{user.name || user.email}</span>?
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 flex gap-3">
                        <AlertDialogCancel
                            onClick={handleCancel}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 border-0"
                        >
                            Hủy
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            className={`flex-1 text-white border-0 ${
                                pendingAction ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
                            }`}
                        >
                            {pendingAction ? "Kích hoạt" : "Vô hiệu hóa"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
