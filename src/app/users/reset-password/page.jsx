"use client"

import {useEffect, useState} from "react"
import {Eye, EyeOff, Lock} from "lucide-react"
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../../../components/ui/card";
import {Label} from "@radix-ui/react-label";
import {Input} from "../../../components/ui/input";
import {Button} from "../../../components/ui/button";
import {useFormik} from "formik";
import * as Yup from "yup";
import UserService from "../../../services/UserService";
import {toast} from "sonner";
import {useRouter} from "next/navigation";

export default function ResetPassword() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(null);
    const [token, setToken] = useState("");

    useEffect(() => {
        try {
            setIsLoading(true);
            const token = localStorage.getItem("token_reset_password");
            setToken(token);
            UserService.checkToken(token)
                .then(res => {
                    if (res.data !== true) {
                        toast.warning(res.data);
                        router.push("/");
                    }
                })
                .catch(err => console.log(err.toString()));
        } catch (error) {
            toast.error(error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const ResetPasswordSchema = Yup.object().shape({
        password: Yup.string()
            .min(6, 'Too Short!')
            .required('Required'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Mật khẩu xác nhận không khớp')
            .required('Required'),
    });

    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: ''
        },
        validationSchema: ResetPasswordSchema,
        onSubmit: values => {
            const email = localStorage.getItem("email");
            UserService.resetPassword(email, values.password, token)
                .then(res => {
                    router.push("/");
                    toast.success(res.data);
                })
                .catch(error => toast.error(error.toString()));
        },
    });

    const togglePasswordVisibility = () => setShowPassword(!showPassword);

    const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

    return (
        <div
            className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
            {/* Loading State */}
            {isLoading ? (
                    <div className="flex justify-center py-8">
                        <div className="text-gray-500">Đang tải trang ...</div>
                    </div>)
                : (
                    <Card className="w-full max-w-md shadow-xl border-0 bg-white/95 backdrop-blur">
                        <CardHeader className="text-center space-y-4 pb-8">
                            <div
                                className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                                <Lock className="w-8 h-8 text-white"/>
                            </div>
                            <CardTitle
                                className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                                Tạo mật khẩu mới
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                Nhập mật khẩu mới của bạn để hoàn tất việc đặt lại
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={formik.handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                        Mật khẩu mới
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            value={formik.values.password}
                                            onChange={formik.handleChange}
                                            placeholder="Nhập mật khẩu mới"
                                            className="pr-12 h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-purple-600"
                                            onClick={togglePasswordVisibility}
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                                            <span
                                                className="sr-only">{showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</span>
                                        </Button>
                                        {formik.touched.password && formik.errors.password && (
                                            <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                        Xác nhận mật khẩu
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={formik.values.confirmPassword}
                                            onChange={formik.handleChange}
                                            placeholder="Nhập lại mật khẩu mới"
                                            className="pr-12 h-12 border-2 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
                                            required
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-purple-600"
                                            onClick={toggleConfirmPasswordVisibility}
                                        >
                                            {showConfirmPassword ? <EyeOff className="h-4 w-4"/> :
                                                <Eye className="h-4 w-4"/>}
                                            <span
                                                className="sr-only">{showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}</span>
                                        </Button>
                                    </div>
                                    {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                        <p className="text-red-500 text-sm mt-1">{formik.errors.confirmPassword}</p>
                                    )}
                                </div>

                                <div className="text-xs text-gray-500 space-y-1">
                                    <p>Mật khẩu phải có ít nhất:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-2">
                                        <li>6 ký tự</li>
                                    </ul>
                                </div>

                                <Button
                                    type={"submit"}
                                    className="w-full h-12 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    Đặt lại mật khẩu
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )
            }
        </div>
    )
}
