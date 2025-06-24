"use client"

import { useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faEyeSlash, faLock, faPaperPlane, faArrowLeft } from "@fortawesome/free-solid-svg-icons"
import { Formik, Form, Field, ErrorMessage } from "formik"
import * as Yup from "yup"
import UserService from "../../services/UserService"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import EmailService from "../../services/EmailService"
import { ReactDOMServerEdge } from "next/dist/server/route-modules/app-page/vendored/ssr/entrypoints"
import EmailTemplate from "../../util/emailTemplate"

export default function RecoverPassword() {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(null)
    const [token, setToken] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSending, setIsSending] = useState(false)

    useEffect(() => {
        try {
            setIsLoading(true)
            const token = localStorage.getItem("token_recover_password")
            setToken(token)
            UserService.checkToken(token)
                .then((res) => {
                    if (res.data !== true) {
                        toast.warning(res.data)
                        router.push("/")
                    }
                })
                .catch((err) => console.log(err.toString()))
        } catch (error) {
            toast.error(error)
        } finally {
            setIsLoading(false)
        }
    }, [])

    const ResetPasswordSchema = Yup.object().shape({
        password: Yup.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").required("Mật khẩu không được để trống"),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref("password"), null], "Mật khẩu xác nhận không khớp")
            .required("Mật khẩu xác nhận không được để trống"),
        code: Yup.string().required("Code không được để trống"),
    })

    const handleSubmit = async (values) => {
        setIsSubmitting(true)
        const email = localStorage.getItem("currentUserEmail")
        const code = localStorage.getItem("code")
        const param = { email: email, password: values.password, token: token }

        if (code !== values.code) {
            toast.warning("Code không chính xác")
            setIsSubmitting(false)
            return
        }

        try {
            const resp1 = await UserService.checkDuplicatePassword(param)
            if (resp1.data.duplicate) {
                toast.warning(resp1.data.message)
                setIsSubmitting(false)
            } else {
                const resp2 = await UserService.recoverPassword(param)
                if (resp2 !== undefined) {
                    toast.success(resp2.data)
                    localStorage.removeItem("token_recover_password")
                    localStorage.removeItem("currentUserEmail")
                    localStorage.removeItem("code")
                    router.push("/")
                }
            }
        } catch (err) {
            toast.error(err.toString())
            setIsSubmitting(false)
        }
    }

    const sendCode = () => {
        setIsSending(true)
        const idLoading = toast.loading("Code đang được gửi đến Email của bạn")

        const code = crypto.randomUUID()
        localStorage.setItem("code", code)
        const email = localStorage.getItem("currentUserEmail")
        const htmlString = ReactDOMServerEdge.renderToStaticMarkup(
            <EmailTemplate data={code} title={"Code Xác Nhận Lấy Lại Mật Khẩu"} description={""} openButton={false} />,
        )
        const params = {
            to: email,
            subject: "Code Recover Password",
            html: htmlString,
        }
        EmailService.sendCode(params)
            .then((res) => {
                if (res !== undefined) {
                    toast.success(res.data, { id: idLoading })
                    setIsSending(false)
                }
            })
            .catch((err) => {
                toast.error(err.toString(), { id: idLoading })
                setIsSending(false)
            })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            <div className="flex items-start justify-center px-6 py-10">
                <div
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex"
                    style={{ minHeight: "500px" }}
                >
                    <div className="flex-1 p-5">
                        <div className="max-w-md mx-auto py-1">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Tạo mật khẩu mới</h1>
                            <p className="text-gray-600 mb-4">Nhập mật khẩu mới của bạn để hoàn tất việc đặt lại.</p>

                            <Formik
                                initialValues={{ password: "", confirmPassword: "", code: "" }}
                                validationSchema={ResetPasswordSchema}
                                onSubmit={handleSubmit}
                            >
                                {() => (
                                    <Form className="space-y-4">
                                        <div>
                                            <div className="relative">
                                                <FontAwesomeIcon
                                                    icon={faLock}
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                />
                                                <Field
                                                    type={showPassword ? "text" : "password"}
                                                    name="password"
                                                    placeholder="Nhập mật khẩu mới"
                                                    required
                                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-all duration-200"
                                                >
                                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                                </button>
                                            </div>
                                            <ErrorMessage name="password" component="p" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <div>
                                            <div className="relative">
                                                <FontAwesomeIcon
                                                    icon={faLock}
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                />
                                                <Field
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    name="confirmPassword"
                                                    placeholder="Nhập lại mật khẩu mới"
                                                    required
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

                                        <div className="text-sm text-gray-500 space-y-1">
                                            <p>Mật khẩu phải có ít nhất:</p>
                                            <ul className="list-disc list-inside space-y-1 ml-2">
                                                <li>6 ký tự</li>
                                            </ul>
                                        </div>

                                        <div>
                                            <div className="relative">
                                                <Field
                                                    type="text"
                                                    name="code"
                                                    placeholder={isSending ? "Code đang được gửi đến email ..." : "Nhập code"}
                                                    required
                                                    className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={sendCode}
                                                    disabled={isSending}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-purple-600 cursor-pointer transition-all duration-200"
                                                >
                                                    <FontAwesomeIcon icon={faPaperPlane} />
                                                </button>
                                            </div>
                                            <ErrorMessage name="code" component="p" className="text-red-500 text-sm mt-1" />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 mt-1"
                                        >
                                            {isSubmitting ? "Đang thực hiện..." : "Đặt lại mật khẩu"}
                                        </button>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>

                    <div className="flex-1 bg-gradient-to-br from-orange-100 to-blue-100 relative overflow-hidden">
                        <img src="/photo-login.jpg" alt="Quizizz Hero" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute bottom-8 left-8 right-8 bg-black bg-opacity-50 text-white p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <span className="text-lg">Thầy cô yêu chúng tôi</span>
                                <span className="ml-2">😍</span>
                            </div>
                            <p className="text-sm opacity-90">Tham gia cùng hơn 200 triệu nhà sư phạm và người học trên QuizGym</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
