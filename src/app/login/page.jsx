'use client';

import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import UserService from '../../services/UserService';
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
    const [isReady, setIsReady] = useState(false);
    const [initialValues, setInitialValues] = useState({ email: '', password: '' });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const autoLogin = localStorage.getItem('autoLogin');
            if (autoLogin) {
                const { email, password } = JSON.parse(autoLogin);
                setInitialValues({ email, password });
                localStorage.removeItem('autoLogin');
            }
            setIsReady(true);
        }
    }, []);

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Email không hợp lệ')
            .required('Email không được để trống'),
        password: Yup.string()
            .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
            .required('Mật khẩu không được để trống'),
    });

    const handleSubmit = async (values, { setSubmitting }) => {
        const { email, password } = values;
        setGeneralError('');

        try {
            const response = await UserService.login(email, password);
            const { message, success } = response.data;
            if (success) {
                toast.success('Đăng nhập thành công!', { autoClose: 1500 });
                localStorage.setItem('currentUserEmail', email);
                setTimeout(() => router.push('/home'), 1500);
            } else {
                setGeneralError(message);
            }
        } catch (err) {
            toast.error('Đăng nhập không thành công', { autoClose: 3000 });
        } finally {
            setSubmitting(false);
        }
    };

    if (!isReady) return null;

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
                        <button type="submit" disabled={isSubmitting}>
                            Đăng nhập
                        </button>
                        {generalError && <p className="error">{generalError}</p>}
                    </Form>
                )}
            </Formik>
            <ToastContainer position="top-right" autoClose={1500} />
        </div>
    );
};

export default Login;