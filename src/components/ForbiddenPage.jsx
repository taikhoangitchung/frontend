import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function Custom403() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 md:p-12 max-w-md text-center">
                <div className="flex justify-center mb-6 text-red-500">
                    <ShieldAlert className="w-16 h-16" />
                </div>
                <h1 className="text-4xl font-bold text-gray-800 mb-4">403 - Truy cập bị từ chối</h1>
                <p className="text-gray-600 text-base mb-6">
                    Bạn không có quyền truy cập trang này.
                </p>
                <Link
                    href="/"
                    className="inline-block px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition"
                >
                    Quay về trang chủ
                </Link>
            </div>
        </div>
    );
}
