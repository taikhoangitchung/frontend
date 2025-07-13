"use client"

import { useState, useEffect } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import UserService from "../../../services/UserService"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
    ArrowLeft,
    Mail,
    Camera,
    Upload,
    User, Loader2
} from "lucide-react";
import AvatarUser from "../../../components/avatar/AvatarUser";
import {validateImage} from "../../../util/validateImage";
import SupabaseService from "../../../services/SupabaseService";
import {getSupabaseImageUrl} from "../../../util/getImageSupabaseUrl";


const validationSchema = Yup.object({
    username: Yup.string().max(50, "Tên hiển thị không được vượt quá 50 ký tự"),
    avatar: Yup.mixed()
        .nullable()
        .test("fileSize", "File quá lớn", (value) => !value || (value && value.size <= 5 * 1024 * 1024))
        .test(
            "fileType",
            "Chỉ hỗ trợ file ảnh",
            (value) => !value || (value && ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(value.type)),
        ),
});

const EditProfile = () => {
    const router = useRouter()
    const [userEmail, setUserEmail] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState("")
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(true)
    const [isReady, setIsReady] = useState(true)
    const [fileImage, setFileImage] = useState();
    const [currentPathAvatar, setCurrentPathAvatar] = useState("");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUserEmail = localStorage.getItem("email");
            if (!storedUserEmail) {
                router.push("/login");
                return;
            }

            UserService.getProfile(storedUserEmail)
                .then((response) => {
                    let {username, email, avatar, googleId} = response.data;
                    setCurrentPathAvatar(avatar)
                    if (!googleId) {
                        avatar = getSupabaseImageUrl(process.env.NEXT_PUBLIC_SUPABASE_IMAGE_AVATAR_BUCKET, avatar)
                    }
                    setUsername(username);
                    setUserEmail(email)
                    setAvatarPreview(avatar);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Lỗi khi lấy thông tin user:", err);
                })
        }
    }, [router]);

    const handleSubmit = async (values) => {
        setIsReady(false);
        try {
            const {username} = values;
            if (fileImage && !validateImage(fileImage)) {
                return;
            }
            const data = {
                email: userEmail,
                username,
                avatar: currentPathAvatar
            }

            if (fileImage) {
                // xoa avatar cu tren supabase
                await SupabaseService.removeFile(avatarPreview, process.env.NEXT_PUBLIC_SUPABASE_IMAGE_AVATAR_BUCKET)

                // upload file supabase
                const fileSupabase = await SupabaseService.uploadFile(fileImage, process.env.NEXT_PUBLIC_SUPABASE_IMAGE_AVATAR_BUCKET, process.env.NEXT_PUBLIC_SUPABASE_IMAGE_AVATAR_BUCKET_PATHPREFIX_TEMP);
                data.avatar = fileSupabase.path
            }

            const response = await UserService.editProfile(data);
            toast.success(response.data, { duration: 1500 })
            router.push("/profile");

        } catch (err) {
            const errorMsg = err.response?.data || "Cập nhật không thành công";
            toast.error(errorMsg, {
                duration: 5000
            });
        }
    };

    const handleAvatarChange = (event) => {
        const file = event.currentTarget.files[0];
        if (file) {
            setFileImage(file);
            const reader = new FileReader();
            reader.onload = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-purple-900">
                <Loader2 className="h-8 w-8 animate-spin text-white"/>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            {/* Main Content */}
            <div className="flex items-start justify-center px-6 py-10">
                <div
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex"
                    style={{ minHeight: "500px" }}
                >
                    {/* Left Panel - Edit Profile Form */}
                    <div className="flex-1 p-5">
                        <div className="max-w-md mx-auto py-1">
                            <button
                                onClick={() => router.push("/profile")}
                                className="flex items-center text-purple-600 hover:text-purple-700 hover:underline mb-6 cursor-pointer transition-all duration-200"
                            >
                                <ArrowLeft className="mr-2" />
                                Quay lại
                            </button>

                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Cập nhật thông tin tài khoản</h1>

                            <Formik
                                initialValues={{ username: username }}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting, setFieldValue }) => (
                                    <Form className="space-y-6">
                                        {/* Display Email */}
                                        <div className="mb-5 p-4 bg-gray-50 rounded-lg border">
                                            <div className="flex items-center">
                                                <Mail className="w-5 h-5 mr-3 text-gray-600" />
                                                <div>
                                                    <p className="text-sm text-gray-600">Email tài khoản</p>
                                                    <p className="font-medium text-gray-900">{userEmail}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Avatar Section */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Avatar</label>
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    {avatarPreview && (
                                                        <AvatarUser path={avatarPreview} width={50} height={50}/>
                                                    )}
                                                    <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-2">
                                                        <Camera className="w-3 h-3 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all duration-200">
                                                        <Upload className="w-4 h-4 mr-2 text-gray-600" />
                                                        <span className="text-sm text-gray-700">Chọn ảnh mới</span>
                                                        <input
                                                            type="file"
                                                            name="avatar"
                                                            accept="image/*"
                                                            onChange={(event) => handleAvatarChange(event)}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                    <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF tối đa 5MB</p>
                                                </div>
                                            </div>
                                            <ErrorMessage name="avatar" component="p" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Username */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên hiển thị</label>
                                            <div className="relative">
                                                <User
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                />
                                                <Field
                                                    type="text"
                                                    name="username"
                                                    placeholder="Nhập tên hiển thị"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                                />
                                            </div>
                                            <ErrorMessage name="username" component="p" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex space-x-4">
                                            <button
                                                type="submit"
                                                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
                                            >
                                                {!isReady ? "Đang cập nhật..." : "Cập nhật"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => router.push("/profile")}
                                                className="flex-1 bg-white text-gray-700 py-2 rounded-lg font-medium border border-gray-300 hover:bg-gray-50 hover:shadow-md cursor-pointer transition-all duration-200"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>

                    {/* Right Panel - Hero Image */}
                    <div className="flex-1 bg-gradient-to-br from-orange-100 to-blue-100 relative overflow-hidden">
                        <img src="/photo-login.jpg" alt="QuizGym Hero" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute bottom-8 left-8 right-8 bg-black bg-opacity-50 text-white p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <span className="text-lg">Cá nhân hóa tài khoản</span>
                                <span className="ml-2">✨</span>
                            </div>
                            <p className="text-sm opacity-90">Cập nhật thông tin để có trải nghiệm tốt nhất trên QuizGym</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditProfile