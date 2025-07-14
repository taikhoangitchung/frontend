"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit, Mail, Calendar, ArrowLeft } from "lucide-react";
import AvatarUser from "../../components/avatar/AvatarUser";
import { getSupabaseImageUrl } from "../../util/getImageSupabaseUrl";
import { getCurrentUser } from "../../services/authService";

const Profile = () => {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            const currentUser = getCurrentUser();
            if (!currentUser) {
                toast.error("Phiên làm việc hết hạn, chuyển hướng...");
                setTimeout(() => router.push("/login"), 2000);
                return;
            }

            try {
                const data = {
                    ...currentUser,
                    avatar: currentUser.googleId
                        ? currentUser.avatar
                        : getSupabaseImageUrl(process.env.NEXT_PUBLIC_SUPABASE_IMAGE_AVATAR_BUCKET, currentUser.avatar || ""),
                    quizCount: 0, // Có thể fetch từ API nếu cần
                };
                setUserInfo(data);
            } catch (err) {
                toast.error("Không thể tải thông tin profile");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [router]);

    const handleBackToDashboard = () => {
        router.push(userInfo.role === "ADMIN" ? "/admin/dashboard" : "/users/dashboard");
    };

    const handleClickEditProfile = () => {
        if (userInfo.googleId) {
            toast.warning("Bạn đang đăng nhập bằng Google. Không thể sử dụng chức năng này!", { duration: 5000 });
            return;
        }
        router.push("/profile/edit");
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Đang tải...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-6 py-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-6">
                            <AvatarUser path={userInfo.avatar} height={150} width={150} />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{userInfo.username || "Không có tên"}</h1>
                                <div className="space-y-1 mb-4">
                                    <p className="text-gray-600 flex items-center">
                                        <Mail className="w-4 h-4 mr-2" />
                                        {userInfo.email || "Không có email"}
                                    </p>
                                    <p className="text-gray-600 flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        Tham gia: {userInfo.createdAt || "Chưa xác định"}
                                    </p>
                                </div>
                                <button
                                    onClick={handleClickEditProfile}
                                    className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-300 rounded-lg cursor-pointer transition-colors text-sm"
                                >
                                    <Edit className="w-4 h-4 text-gray-600" />
                                    <span className="text-gray-700">Chỉnh sửa Hồ sơ</span>
                                </button>
                            </div>
                        </div>
                        <button
                            onClick={handleBackToDashboard}
                            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive shadow-xs bg-gray-700 text-white hover:bg-gray-600 border border-gray-500 cursor-pointer h-9 px-4 py-2"
                        >
                            <ArrowLeft className="w-4 h-4 text-white" />
                            <span className="text-white">Quay lại</span>
                        </button>
                    </div>
                </div>
            </div>
            {userInfo.role !== "ADMIN" && (
                <>
                    <div className="bg-white border-b border-gray-200">
                        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
                            <div className="flex space-x-8">
                                <button className="py-4 px-2 border-b-2 border-purple-600 text-purple-600 font-medium cursor-pointer">
                                    Thư viện
                                </button>
                            </div>
                            <div className="text-center pt-0">
                                <div className="text-3xl font-bold text-gray-900">{userInfo.quizCount || 0}</div>
                                <div className="text-sm text-gray-600 font-medium">QUIZ</div>
                            </div>
                        </div>
                    </div>
                    <div className="max-w-6xl mx-auto px-6 py-16">
                        <div className="text-center">
                            <div className="mb-12">
                                <h2 className="text-5xl font-bold text-purple-400 mb-8" style={{ fontFamily: "Comic Sans MS, cursive" }}>
                                    LET'S
                                    <br />
                                    CREATE!
                                </h2>
                            </div>
                            <div className="max-w-xl mx-auto">
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">Tạo bài học đầu tiên của bạn</h3>
                                <p className="text-gray-600 mb-8">
                                    Lấy các câu hỏi từ thư viện hoặc đặt câu hỏi của riêng bạn. Thật nhanh chóng và dễ dàng!
                                </p>
                                <button
                                    onClick={() => router.push("/users/exams/create")}
                                    className="bg-purple-600 text-white px-6 py-2 rounded-lg text-md font-medium hover:bg-purple-700 cursor-pointer transition-colors"
                                >
                                    Tạo Quiz Mới
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Profile;