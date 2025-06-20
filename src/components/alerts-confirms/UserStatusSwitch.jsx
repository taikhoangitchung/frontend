"use client"

import { useEffect, useState } from "react"
import ConfirmDialog from "./ConfirmDialog"

export default function UserStatusSwitch({ user, onToggle }) {
    const [checked, setChecked] = useState(user.active)
    const [showDialog, setShowDialog] = useState(false)
    const [pendingAction, setPendingAction] = useState(null)

    useEffect(() => {
        setChecked(user.active)
    }, [user.active])

    const handleSwitchClick = () => {
        const nextState = !checked
        setPendingAction(nextState)
        setShowDialog(true)
    }

    const handleConfirm = async () => {
        if (pendingAction !== null) {
            setChecked(pendingAction)
            await onToggle(user, pendingAction)
            setPendingAction(null)
            setShowDialog(false)
        }
    }

    const userLabel = user.name || user.email

    return (
        <>
            <button
                role="switch"
                aria-checked={checked}
                onClick={handleSwitchClick}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                    checked ? "bg-green-500" : "bg-red-500"
                }`}
            >
        <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                checked ? "translate-x-6" : "translate-x-1"
            }`}
        />
            </button>

            <ConfirmDialog
                open={showDialog}
                setOpen={setShowDialog}
                title="Xác nhận thay đổi trạng thái"
                description={
                    pendingAction ? (
                        <>
                            Bạn có chắc chắn muốn{" "}
                            <span className="font-semibold text-green-600">kích hoạt</span> tài khoản của{" "}
                            <span className="font-semibold">{userLabel}</span>?
                        </>
                    ) : (
                        <>
                            Bạn có chắc chắn muốn{" "}
                            <span className="font-semibold text-red-600">vô hiệu hóa</span> tài khoản của{" "}
                            <span className="font-semibold">{userLabel}</span>?
                        </>
                    )
                }
                actionLabel={pendingAction ? "Kích hoạt" : "Vô hiệu hóa"}
                actionClass={
                    pendingAction
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                }
                cancelClass="bg-gray-100 hover:bg-gray-200 text-gray-800 border-0"
                onConfirm={handleConfirm}
            />
        </>
    )
}
