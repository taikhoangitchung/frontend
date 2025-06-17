"use client"

import { useState, useEffect } from "react"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import UserService from "../../../services/UserService"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faEyeSlash, faLock, faEnvelope, faArrowLeft } from "@fortawesome/free-solid-svg-icons"

const ChangePassword = () => {
    const router = useRouter()
    const [showOldPassword, setShowOldPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [userEmail, setUserEmail] = useState(null)
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        if (typeof window !== "undefined") {
            const storedUserEmail = localStorage.getItem("currentUserEmail")
            if (!storedUserEmail) {
                router.push("/login")
                return
            }
            setUserEmail(storedUserEmail)
            setIsReady(true)
        }
    }, [router])

    const validationSchema = Yup.object({
        oldPassword: Yup.string().required("Mật khẩu cũ không được để trống"),
        newPassword: Yup.string()
            .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
            .notOneOf([Yup.ref("oldPassword"), null], "Mật khẩu mới không được giống mật khẩu cũ")
            .required("Mật khẩu mới không được để trống"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("newPassword"), null], "Mật khẩu nhập lại không khớp")
            .required("Vui lòng nhập lại mật khẩu"),
    })

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            await UserService.changePassword({
                email: userEmail,
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
            })
            toast.success("Đổi mật khẩu thành công! Chuyển đến trang đăng nhập...", {
                autoClose: 1500,
            })
            setTimeout(() => router.push("/login"), 1500)
        } catch (err) {
            const errorMsg = err.response?.data || "Đổi mật khẩu không thành công"
            setFieldError("oldPassword", errorMsg)
            toast.error(errorMsg, { autoClose: 3000 })
        } finally {
            setSubmitting(false)
        }
    }

    if (!isReady || !userEmail) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            {/* Main Content */}
            <div className="flex items-start justify-center px-6 py-10">
                <div
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex"
                    style={{ minHeight: "500px" }}
                >
                    {/* Left Panel - Change Password Form */}
                    <div className="flex-1 p-5">
                        <div className="max-w-md mx-auto py-1">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center text-purple-600 hover:text-purple-700 hover:underline mb-6 cursor-pointer transition-all duration-200"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                                Quay lại
                            </button>

                            <h1 className="text-2xl font-bold text-gray-900 mb-4">Đổi mật khẩu</h1>

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

                            <Formik
                                initialValues={{ oldPassword: "", newPassword: "", confirmPassword: "" }}
                                validationSchema={validationSchema}
                                onSubmit={handleSubmit}
                            >
                                {({ isSubmitting }) => (
                                    <Form className="space-y-4">
                                        {/* Old Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mật khẩu cũ <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <FontAwesomeIcon
                                                    icon={faLock}
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                />
                                                <Field
                                                    type={showOldPassword ? "text" : "password"}
                                                    name="oldPassword"
                                                    placeholder="Nhập mật khẩu cũ"
                                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-all duration-200"
                                                >
                                                    <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
                                                </button>
                                            </div>
                                            <ErrorMessage name="oldPassword" component="p" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* New Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Mật khẩu mới <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <FontAwesomeIcon
                                                    icon={faLock}
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                />
                                                <Field
                                                    type={showNewPassword ? "text" : "password"}
                                                    name="newPassword"
                                                    placeholder="Nhập mật khẩu mới"
                                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-all duration-200"
                                                >
                                                    <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                                                </button>
                                            </div>
                                            <ErrorMessage name="newPassword" component="p" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Confirm Password */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nhập lại mật khẩu <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <FontAwesomeIcon
                                                    icon={faLock}
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                />
                                                <Field
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    placeholder="Nhập lại mật khẩu mới"
                                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-all duration-200"
                                                >
                                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                                </button>
                                            </div>
                                            <ErrorMessage name="confirmPassword" component="p" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 mt-2"
                                        >
                                            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                                        </button>
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
                                <span className="text-lg">Bảo mật tài khoản</span>
                                <span className="ml-2">🔒</span>
                            </div>
                            <p className="text-sm opacity-90">Thay đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChangePassword