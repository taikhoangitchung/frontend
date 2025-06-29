"use client"

import { useFormik } from "formik"
import * as Yup from "yup"
import { useRouter } from "next/navigation"
import { ArrowLeft, Mail } from "lucide-react"
import EmailService from "../../services/EmailService"
import { toast } from "sonner"
import EmailTemplate from "../../util/emailTemplate"
import { ReactDOMServerEdge } from "next/dist/server/route-modules/app-page/vendored/ssr/entrypoints"
import { useState } from "react"

const ForgotPassword = () => {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const ForgotPasswordSchema = Yup.object({
        email: Yup.string().email("Email không hợp lệ").required("Email không được để trống"),
    })

    const formik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: ForgotPasswordSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true)
            const idLoading = toast.loading("Đang gửi thông tin về Email của bạn")
            const token = crypto.randomUUID()
            localStorage.setItem("token_recover_password", token)
            localStorage.setItem("currentUserEmail", values.email)
            const htmlString = ReactDOMServerEdge.renderToStaticMarkup(
                <EmailTemplate
                    data={`http://localhost:3000/recover-password`}
                    title={"Yêu cầu đặt lại mật khẩu"}
                    description={
                        "Nhấn nút bên dưới để tiến hành đặt lại mật khẩu:"
                    }
                    openButton={true}
                />
            )
            const params = {
                to: values.email,
                subject: "Recover Password",
                html: htmlString,
                token: token,
            }
            try {
                const response = await EmailService.sendMail(params);
                toast.success(response.data, { id: idLoading })
                router.push("/")
            } catch (error) {
                const message = error?.response?.data;
                toast.error(message);
            } finally {
                setIsSubmitting(false)
            }
        },
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            <div className="flex items-start justify-center px-6 py-10">
                <div
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex"
                    style={{ minHeight: "500px" }}
                >
                    <div className="flex-1 p-5">
                        <div className="max-w-md mx-auto py-1">
                            <button
                                onClick={() => router.push("/login")}
                                className="flex items-center text-purple-600 hover:text-purple-700 hover:underline mb-6 cursor-pointer transition-all duration-200"
                            >
                                <ArrowLeft className="mr-2" />
                                Quay lại
                            </button>

                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Khôi phục mật khẩu
                            </h1>
                            <p className="text-gray-600 mb-4">
                                Nhập email của bạn để nhận liên kết đặt lại mật khẩu qua email.
                            </p>

                            <form onSubmit={formik.handleSubmit} className="space-y-4">
                                <div>
                                    <div className="relative">
                                        <Mail
                                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                                        />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            disabled={isSubmitting}
                                            placeholder="Email"
                                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                        />
                                    </div>
                                    {formik.touched.email && formik.errors.email && (
                                        <p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 mt-1"
                                >
                                    {isSubmitting ? "Đang gửi..." : "Gửi"}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="flex-1 bg-gradient-to-br from-orange-100 to-blue-100 relative overflow-hidden">
                        <img
                            src="/photo-login.jpg"
                            alt="Quizizz Hero"
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute bottom-8 left-8 right-8 bg-black bg-opacity-50 text-white p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <span className="text-lg">Thầy cô yêu chúng tôi</span>
                                <span className="ml-2">😍</span>
                            </div>
                            <p className="text-sm opacity-90">
                                Tham gia cùng hơn 200 triệu nhà sư phạm và người học trên QuizGym
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword
