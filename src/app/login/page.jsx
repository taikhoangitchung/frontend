'use client';

import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const Login = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [generalError, setGeneralError] = useState('');
    const [isReady, setIsReady] = useState(false); // State để kiểm soát render
    const [initialValues, setInitialValues] = useState({ email: '', password: '' });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const autoLogin = localStorage.getItem('autoLogin');
            if (autoLogin) {
                console.log('Tìm thấy autoLogin:', autoLogin);
                const { email, password } = JSON.parse(autoLogin);
                setInitialValues({ email, password });
                localStorage.removeItem('autoLogin');
                console.log('Đã xóa autoLogin, cập nhật initialValues:', { email, password });
            }
            setIsReady(true); // Cho phép render sau khi xử lý
        }
    }, []);

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Vui lòng nhập một địa chỉ email hợp lệ, bao gồm "@" và domain (ví dụ: example@email.com)')
            .matches(/@.+\..+/, 'Vui lòng nhập một địa chỉ email hợp lệ, bao gồm "@" và domain (ví dụ: example@email.com)')
            .required('Email không được để trống'),
        password: Yup.string()
            .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
            .required('Mật khẩu không được để trống'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        const { email, password } = values;
        setGeneralError('');

        try {
            const response = await axios.post('http://localhost:8080/users/login', {
                email,
                password,
            });

            const { message, success } = response.data;
            if (success) {
                toast.success('Đăng nhập thành công!', {
                    autoClose: 1500,
                    position: 'top-right',
                });
                setTimeout(() => router.push('/home'), 1500);
            } else {
                setGeneralError(message);
            }
        } catch (err) {
            const errorMsg = err.response?.data || 'Đăng nhập không thành công';
            toast.error(errorMsg, { autoClose: 3000, position: 'top-right' });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isReady) return null; // Chờ đến khi initialValues sẵn sàng

    return (
        <div>
            <h2>Đăng nhập</h2>
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div>
                            <label>Email <span style={{ color: 'red' }}>*</span></label>
                            <Field
                                type="email"
                                name="email"
                            />
                            <ErrorMessage name="email" component="p" className="error" />
                        </div>
                        <div>
                            <label>Mật khẩu <span style={{ color: 'red' }}>*</span></label>
                            <div className="password-container">
                                <Field
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    autoComplete="new-password"
                                    style={{ paddingRight: '30px', width: '100%' }}
                                />
                                <span
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="password-toggle"
                                >
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                            <ErrorMessage name="password" component="p" className="error" />
                        </div>
                        <button type="submit" disabled={isSubmitting}>
                            Đăng nhập
                        </button>
                        {generalError && <p className="error">{generalError}</p>}
                        <p style={{ fontSize: '14px', marginTop: '15px', color: '#0056b3' }}>
                            <a href="/forgot-password">Quên mật khẩu?</a>
                        </p>
                    </Form>
                )}
            </Formik>
            <ToastContainer
                position="top-right"
                autoClose={1500}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                closeButton={false}
            />
        </div>
    );
};

export default Login;