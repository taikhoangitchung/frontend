"use client"

import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./ui/alert-dialog";

const DialogConfirm = ({open, setIsOpen, handleConfirm}) => {
    return (
        <AlertDialog open={open} onOpenChange={setIsOpen}>
            <AlertDialogContent className={"bg-black text-white"}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Xóa người dùng này ?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Không thể hoàn tác hành động này. Thao tác này sẽ xóa vĩnh viễn
                        tài khoản và xóa dữ liệu khỏi máy chủ.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className={"bg-white text-black hover:bg-gray-400"}
                                       onClick={() => handleConfirm(false)}>Hủy</AlertDialogCancel>
                    <AlertDialogAction className={"bg-red-500 text-white hover:bg-red-700"}
                                        onClick={() => handleConfirm(true)}>Xóa</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default DialogConfirm;
