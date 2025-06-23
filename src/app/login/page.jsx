"use client"

import {useState, useEffect} from "react"
import {Formik, Form, Field, ErrorMessage} from "formik"
import * as Yup from "yup"
import UserService from "../../services/UserService"
import {useRouter} from "next/navigation"
import {toast} from "sonner"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faEye, faEyeSlash, faEnvelope, faArrowLeft, faLock} from "@fortawesome/free-solid-svg-icons"
import {jwtDecode} from "jwt-decode";
import {useKickSocket} from "../../config/socketConfig";

const Login = () => {
    const router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [isReady, setIsReady] = useState(false)
    const [showEmailForm, setShowEmailForm] = useState(false)
    const [initialValues, setInitialValues] = useState({email: "", password: ""})

    useEffect(() => {
        if (typeof window !== "undefined") {
            const autoLogin = localStorage.getItem("autoLogin")
            if (autoLogin) {
                const {email, password} = JSON.parse(autoLogin)
                setInitialValues({email, password})
            }
            setIsReady(true)
        }
    }, [])

    const validationSchema = Yup.object({
        email: Yup.string().email("Email không hợp lệ").required("Email không được để trống"),
        password: Yup.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự").required("Mật khẩu không được để trống"),
    })

    const handleSubmit = async (values, {setSubmitting}) => {
        try {
            const response = await UserService.login(values)
            toast.success("Đăng nhập thành công", {autoClose: 1500})
            localStorage.setItem("email", values.email)
            const token = response.data
            localStorage.setItem("token", token)
            const userId = jwtDecode(token).id
            const role = jwtDecode(token).role
            const username = jwtDecode(token).username

            localStorage.removeItem("autoLogin")
            localStorage.setItem("id", userId)
            localStorage.setItem("role", role)
            localStorage.setItem("username", username)
            let nextPage = ""

            if (role === "ADMIN") {
                nextPage = "/admin/dashboard"
            } else {
                nextPage = "/users/dashboard"
                useKickSocket({
                    username,
                    onKick:(data) => {
                        if (data === "KICK") {
                            localStorage.removeItem("id");
                            localStorage.removeItem("email");
                            localStorage.removeItem("username");
                            localStorage.removeItem("token");
                            localStorage.removeItem("role");
                            router.push("/");
                        }
                    }
                });
            }
            setTimeout(() => router.push(nextPage), 1500)
        } catch (err) {
            const errorMessage = err.response?.data || "Đăng nhập không thành công. Vui lòng kiểm tra email hoặc mật khẩu."
            toast.error(errorMessage, {autoClose: 3000})
        } finally {
            setSubmitting(false)
        }
    }

    if (!isReady) return null

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            {/* Header */}
            {/* Main Content */}
            <div className="flex items-start justify-center px-6 py-10">
                <div
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex"
                    style={{minHeight: "500px"}}
                >
                    {/* Left Panel - Login Form */}
                    <div className="flex-1 p-5">
                        {!showEmailForm ? (
                            <div className="max-w-md mx-auto py-8">
                                <h1 className="text-2xl font-bold text-gray-900 mb-12">Đăng nhập vào QuizGym</h1>

                                <div className="space-y-6 mb-16">
                                    {/* Google Login Button */}
                                    <button
                                        className="w-full flex items-center justify-between p-5 border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200 cursor-pointer"
                                        onClick={() => {
                                            // Tạm thời chưa triển khai
                                            toast.info("Tính năng đăng nhập với Google sẽ sớm được triển khai")
                                        }}
                                    >
                                        <div className="flex items-center">
                                            <div className="w-5 h-5 mr-3 text-red-500 font-bold">G</div>
                                            <span className="text-gray-700 font-medium">Tiếp tục với Google</span>
                                        </div>
                                        <FontAwesomeIcon icon={faArrowLeft} className="rotate-180 text-gray-400"/>
                                    </button>

                                    {/* Email Login Button */}
                                    <button
                                        className="w-full flex items-center justify-between p-5 border border-gray-300 rounded-lg hover:bg-gray-50 hover:shadow-md transition-all duration-200 cursor-pointer"
                                        onClick={() => setShowEmailForm(true)}
                                    >
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={faEnvelope} className="w-5 h-5 mr-3 text-gray-600"/>
                                            <span className="text-gray-700 font-medium">Tiếp tục với Email</span>
                                        </div>
                                        <FontAwesomeIcon icon={faArrowLeft} className="rotate-180 text-gray-400"/>
                                    </button>
                                </div>

                                <div className="text-center">
                                    <span className="text-gray-600">Không có tài khoản? </span>
                                    <button
                                        type="button"
                                        onClick={() => router.push("/register")}
                                        className="text-purple-600 hover:text-purple-700 hover:underline font-medium cursor-pointer transition-all duration-200"
                                    >
                                        Đăng ký
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // Email Login Form
                            <div className="max-w-md mx-auto py-1">
                                <button
                                    onClick={() => setShowEmailForm(false)}
                                    className="flex items-center text-purple-600 hover:text-purple-700 hover:underline mb-6 cursor-pointer transition-all duration-200"
                                >
                                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2"/>
                                    Quay lại
                                </button>

                                <h1 className="text-2xl font-bold text-gray-900 mb-2">Tiếp tục với email</h1>

                                <Formik initialValues={initialValues} validationSchema={validationSchema}
                                        onSubmit={handleSubmit}>
                                    {({isSubmitting}) => (
                                        <Form className="space-y-4">
                                            <div>
                                                <div className="relative">
                                                    <FontAwesomeIcon
                                                        icon={faEnvelope}
                                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    />
                                                    <Field
                                                        type="email"
                                                        name="email"
                                                        placeholder="Email"
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                                    />
                                                </div>
                                                <ErrorMessage name="email" component="p"
                                                              className="text-red-500 text-sm mt-1"/>
                                            </div>

                                            <div>
                                                <div className="relative">
                                                    <FontAwesomeIcon
                                                        icon={faLock}
                                                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    />
                                                    <Field
                                                        type={showPassword ? "text" : "password"}
                                                        name="password"
                                                        placeholder="Mật khẩu"
                                                        className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer transition-colors duration-200"
                                                    >
                                                        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye}/>
                                                    </button>
                                                </div>
                                                <ErrorMessage name="password" component="p"
                                                              className="text-red-500 text-sm mt-1"/>
                                            </div>

                                            <div className="text-left">
                                                <a
                                                    href="/forgot-password"
                                                    className="text-purple-600 hover:text-purple-700 hover:underline text-sm cursor-pointer transition-all duration-200"
                                                >
                                                    Quên mật khẩu?
                                                </a>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-all duration-200 mt-1"
                                            >
                                                {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
                                            </button>
                                        </Form>
                                    )}
                                </Formik>

                                <div className="mt-4 text-center">
                                    <span className="text-gray-600">Không có tài khoản? </span>
                                    <button
                                        type="button"
                                        onClick={() => router.push("/register")}
                                        className="text-purple-600 hover:text-purple-700 hover:underline font-medium cursor-pointer transition-all duration-200"
                                    >
                                        Đăng ký
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Panel - Hero Image */}
                    <div className="flex-1 bg-gradient-to-br from-orange-100 to-blue-100 relative overflow-hidden">
                        <img src="/photo-login.jpg" alt="Quizizz Hero"
                             className="absolute inset-0 w-full h-full object-cover"/>
                        <div
                            className="absolute bottom-8 left-8 right-8 bg-black bg-opacity-50 text-white p-4 rounded-lg">
                            <div className="flex items-center mb-2">
                                <span className="text-lg">Thầy cô yêu chúng tôi</span>
                                <span className="ml-2">😍</span>
                            </div>
                            <p className="text-sm opacity-90">Tham gia cùng hơn 200 triệu nhà sư phạm và người học trên
                                QuizGym</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
