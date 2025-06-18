"use client"

import {useFormik} from "formik"
import * as Yup from "yup"
import {useRouter} from "next/navigation"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons"
import {Label} from "@radix-ui/react-label"
import {Input} from "../../components/ui/input"
import {Button} from "../../components/ui/button"
import EmailService from "../../services/EmailService";
import {toast} from "sonner";
import EmailTemplate from "../../components/EmailTemplate";
import {ReactDOMServerEdge} from "next/dist/server/route-modules/app-page/vendored/ssr/entrypoints";
import {useState} from "react";

const ForgotPassword = () => {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false);

    const ForgotPasswordSchema = Yup.object({
        email: Yup.string().email("Email không hợp lệ").required("Email không được để trống"),
    })

    const formik = useFormik({
        initialValues: {
            email: "",
        },
        validationSchema: ForgotPasswordSchema,
        onSubmit: (values) => {
            setIsSubmitting(true);
            const token = crypto.randomUUID();
            localStorage.setItem("token_recover_password", token);
            localStorage.setItem("currentUserEmail", values.email);
            const htmlString = ReactDOMServerEdge.renderToStaticMarkup(
                <EmailTemplate data={`http://localhost:3000/recover-password`}
                               title={"Yêu cầu đặt lại mật khẩu"}
                               description={"Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n" +
                                            "         Nhấn nút bên dưới để tiến hành đặt lại mật khẩu:"}
                               openButton={true}/>
            );
            const params = {
                to: values.email,
                subject: "Recover Password",
                html: htmlString,
                token: token
            }
            EmailService.sendMail(params)
                .then(res => {
                    toast.success(res.data);
                    router.push("/");
                })
                .catch(err => {
                    toast.error(err.response.data);
                    setIsSubmitting(false);
                });
        },
    })

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
            {/* Header */}
            {/* Main Content */}
            <div className="flex items-start justify-center px-6 py-5">
                <div
                    className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-4xl w-full flex"
                    style={{minHeight: "500px"}}
                >
                    {/* Left Panel - Login Form */}
                    <div className="flex-1 p-5">
                        <div className="max-w-md mx-auto py-1">
                            <button
                                onClick={() => router.push("/login")}
                                className="flex items-center text-purple-600 hover:text-purple-700 mb-6 cursor-pointer"
                            >
                                <FontAwesomeIcon icon={faArrowLeft} className="mr-2"/>
                                Quay lại
                            </button>

                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                Hãy nhập Email của bạn và truy cập trang lấy lại mật khẩu mà bạn nhận được trong Gmail
                            </h1>

                            <form onSubmit={formik.handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                        Email
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formik.values.email}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            placeholder="Email"
                                            className="pr-12 h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                                            disabled={isSubmitting}
                                            required
                                        />
                                        {formik.touched.email && formik.errors.email && (
                                            <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
                                        )}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`cursor-pointer w-full h-12 ${
                                        isSubmitting
                                            ? "bg-gray-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                                    } text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200`}
                                >
                                    {isSubmitting ? "Đang gửi..." : "Gửi"}
                                </Button>
                            </form>
                        </div>
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

export default ForgotPassword
