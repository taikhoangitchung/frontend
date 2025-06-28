"use client"

import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "../ui/alert-dialog"
import {useState} from "react"

export default function ConfirmDialog({
                                          trigger = null,
                                          triggerLabel = "",
                                          triggerClass = "bg-red-600 text-white px-4 py-2 rounded",
                                          disabled = false,
                                          open: controlledOpen,
                                          setOpen: setControlledOpen,
                                          title = "Bạn có chắc chắn?",
                                          description = "Hành động này không thể hoàn tác.",
                                          cancelLabel = "Hủy",
                                          actionLabel = "Xác nhận",
                                          onConfirm = () => {
                                          },
                                          actionClass = "bg-red-600 hover:bg-red-700 text-white",
                                          cancelClass = "bg-gray-100 hover:bg-gray-200 text-gray-800 border-0",
                                      }) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
    const isControlled = controlledOpen !== undefined && setControlledOpen !== undefined
    const open = isControlled ? controlledOpen : uncontrolledOpen
    const setOpen = isControlled ? setControlledOpen : setUncontrolledOpen

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            {trigger && (
                <AlertDialogTrigger asChild>
                    {trigger}
                </AlertDialogTrigger>
            )}

            {!trigger && triggerLabel && (
                <AlertDialogTrigger asChild>
                    <button disabled={disabled} className={`${triggerClass} hover:cursor-pointer`}>
                        {triggerLabel}
                    </button>
                </AlertDialogTrigger>
            )}

            <AlertDialogContent
                className="z-[9999] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-2xl border-0 max-w-md w-full mx-4">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg font-semibold">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 mt-2">{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="mt-6 flex gap-3">
                    <AlertDialogCancel
                        onClick={() => setOpen(false)}
                        className={`flex-1 ${cancelClass} hover:cursor-pointer`}
                    >
                        {cancelLabel}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => {
                            onConfirm()
                            setOpen(false)
                        }}
                        className={`flex-1 ${actionClass} hover:cursor-pointer`}
                    >
                        {actionLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
