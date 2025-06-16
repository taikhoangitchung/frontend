'use client';

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
} from "./ui/alert-dialog";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";

export default function DeleteButton({ item, handleDelete }) {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="p-1"
                >
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>

            <AlertDialogContent className="bg-white text-gray-900 border border-gray-200 shadow-xl z-50">

            <AlertDialogHeader>
                    <AlertDialogTitle>Bạn có chắc muốn xóa?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Hành động này không thể hoàn tác. Nội dung sẽ bị xóa vĩnh viễn.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => handleDelete(item.id)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                    >
                        Xóa
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
