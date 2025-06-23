"use client"

import { useState, useEffect } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import UserService from "../../../services/UserService"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faUser, faEnvelope, faArrowLeft, faCamera, faUpload } from "@fortawesome/free-solid-svg-icons"

const EditProfile = () => {
    const router = useRouter()
    const [userEmail, setUserEmail] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState("")
    const [initialUsername, setInitialUsername] = useState("")
    const [loading, setLoading] = useState(true)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUserEmail = localStorage.getItem("email");
            if (!storedUserEmail) {
                router.push("/login");
                return;
            }
            setUserEmail(storedUserEmail);
            const storedUsername = localStorage.getItem("username") || "";
            const defaultAvatar = "http://localhost:8080/media/default-avatar.png";
            setInitialUsername(storedUsername);
            setAvatarPreview(defaultAvatar);

            UserService.getProfile(storedUserEmail)
                .then((response) => {
                    const user = response.data;
                    const username = user.username || storedUsername;
                    const avatar = user.avatar || defaultAvatar;
                    setInitialUsername(username);
                    setAvatarPreview(`http://localhost:8080${avatar}`);
                    localStorage.setItem("username", username);
                    localStorage.setItem("avatar", avatar);
                })
                .catch((err) => {
                    console.error("Lỗi khi lấy thông tin user:", err);
                    setAvatarPreview(defaultAvatar);
                })
                .finally(() => {
                    setLoading(false);
                    setIsReady(true);
                });
        }
    }, [router]);

    const validationSchema = Yup.object({
        username: Yup.string().max(50, "Tên hiển thị không được vượt quá 50 ký tự"),
        avatar: Yup.mixed()
            .nullable()
            .test("fileSize", "File quá lớn", (value) => !value || (value && value.size <= 5 * 1024 * 1024))
            .test(
                "fileType",
                "Chỉ hỗ trợ file ảnh",
                (value) => !value || (value && ["image/jpeg", "image/png", "image/gif"].includes(value.type)),
            ),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        try {
            const formData = new FormData();
            formData.append("email", userEmail);
            if (values.username && values.username !== initialUsername) formData.append("username", values.username);
            if (values.avatar && values.avatar instanceof File) formData.append("avatar", values.avatar);

            const response = await UserService.editProfile(formData);
            toast.success(response.data, { autoClose: 1500 });
            if (values.username && values.username !== initialUsername) {
                localStorage.setItem("username", values.username);
            }
            setTimeout(() => router.push("/profile"), 1500);
        } catch (err) {
            const errorMsg = err.response?.data || "Cập nhật không thành công";
            toast.error(errorMsg, { autoClose: 3000 });
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handleAvatarChange = (event, setFieldValue) => {
        const file = event.currentTarget.files[0];
        if (file) {
            setFieldValue("avatar", file);
            const reader = new FileReader();
            reader.onload = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    if (!isReady || loading || !userEmail) {
        return null;
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
                                onClick={() => router.back()}
                                className="flex items-center text-purple-600 hover:text-purple-700 hover:underline mb-6 cursor-pointer transition-all duration-200"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                Quay lại
                            </button>

                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Cập nhật thông tin tài khoản</h1>

                            <Formik
                                initialValues={{ username: initialUsername, avatar: null }}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting, setFieldValue }) => (
                                    <Form className="space-y-6">
                                        {/* Display Email */}
                                        <div className="mb-5 p-4 bg-gray-50 rounded-lg border">
                                            <div className="flex items-center">
                                                <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 mr-3 text-gray-600" />
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
                                                        <img
                                                            src={avatarPreview || "/placeholder.svg"}
                                                            alt="Avatar"
                                                            className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                                                        />
                                                    )}
                                                    <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-2">
                                                        <FontAwesomeIcon icon={faCamera} className="w-3 h-3 text-white" />
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <label className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:shadow-md transition-all duration-200">
                                                        <FontAwesomeIcon icon={faUpload} className="w-4 h-4 mr-2 text-gray-600" />
                                                        <span className="text-sm text-gray-700">Chọn ảnh mới</span>
                                                        <input
                                                            type="file"
                                                            name="avatar"
                                                            accept="image/*"
                                                            onChange={(event) => handleAvatarChange(event, setFieldValue)}
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
                                                <FontAwesomeIcon
                                                    icon={faUser}
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
                                                disabled={isSubmitting}
                                                className="flex-1 bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200"
                                            >
                                                {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleCancel}
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