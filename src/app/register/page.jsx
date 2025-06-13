'use client';

import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import UserService from '../../services/UserService';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import './style.css';

const Register = () => {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Email không hợp lệ')
            .required('Email không được để trống'),
        password: Yup.string()
            .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
            .required('Mật khẩu không được để trống'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
            .required('Vui lòng nhập lại mật khẩu'),
    });

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        const { username, email, password } = values;

        try {
            const response = await UserService.register(username, email, password);
            if (response.status === 200) {
                toast.success('Đăng ký thành công! Chuyển đến trang đăng nhập...', {
                    autoClose: 1500,
                });
                setTimeout(() => {
                    localStorage.setItem('autoLogin', JSON.stringify({ email, password }));
                    router.push('/login');
                }, 1500);
            }
        } catch (err) {
            const errorMsg = err.response?.data || 'Đăng ký không thành công';
            setFieldError('email', errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            <h2>Đăng ký</h2>
            <Formik
                initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div>
                            <label>Tên hiển thị <span style={{ color: 'red' }}>*</span></label>
                            <Field type="text" name="username" />
                            <ErrorMessage name="username" component="p" className="error" />
                        </div>
                        <div>
                            <label>Email <span style={{ color: 'red' }}>*</span></label>
                            <Field type="email" name="email" />
                            <ErrorMessage name="email" component="p" className="error" />
                        </div>
                        <div>
                            <label>Mật khẩu <span style={{ color: 'red' }}>*</span></label>
                            <div className="password-container">
                                <Field type={showPassword ? 'text' : 'password'} name="password" />
                                <span onClick={() => setShowPassword(!showPassword)}>
                                    <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                            <ErrorMessage name="password" component="p" className="error" />
                        </div>
                        <div>
                            <label>Nhập lại mật khẩu <span style={{ color: 'red' }}>*</span></label>
                            <div className="password-container">
                                <Field type={showConfirmPassword ? 'text' : 'password'} name="confirmPassword" />
                                <span onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                            <ErrorMessage name="confirmPassword" component="p" className="error" />
                        </div>
                        <button type="submit" disabled={isSubmitting}>
                            Đăng ký
                        </button>
                    </Form>
                )}
            </Formik>
            <ToastContainer position="top-right" autoClose={1500} />
        </div>
    );
};

export default Register;