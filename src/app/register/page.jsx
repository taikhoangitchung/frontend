'use client';

import {useRouter} from 'next/navigation';
import {Formik, Form, Field, ErrorMessage} from 'formik';
import * as Yup from 'yup';
import {ToastContainer, toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEye, faEyeSlash} from '@fortawesome/free-solid-svg-icons';
import UserService from "../../services/UserService";

const Register = () => {
    const router = useRouter();

    const validationSchema = Yup.object({
        email: Yup.string()
            .email('Email không hợp lệ')
            .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email phải có định dạng hợp lệ, ví dụ: example@email.com')
            .required('Email không được để trống'),
        password: Yup.string()
            .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
            .required('Mật khẩu không được để trống'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('password'), null], 'Mật khẩu không khớp')
            .required('Vui lòng nhập lại mật khẩu'),
    });

    const handleSubmit = async (values, {setSubmitting}) => {
        try {
            const response = await UserService.register({
                username: values.username,
                email: values.email,
                password: values.password,
            }, {
                headers: {'Content-Type': 'application/json'}
            });
            toast.success(response.data, {autoClose: 1500});
            setTimeout(() => {
                localStorage.setItem('autoLogin', JSON.stringify({email: values.email, password: values.password}));
                router.push('/login');
            }, 1500);
        } catch (error) {
            const errorMessage = error.response?.data || 'Đăng ký thất bại. Vui lòng thử lại.';
            toast.error(errorMessage, {autoClose: 3000});
            console.error('Lỗi đăng ký:', error.response ? error.response.data : error.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div suppressHydrationWarning>
            <h2>Đăng ký</h2>
            <Formik
                initialValues={{
                    username: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({isSubmitting, errors, touched}) => (
                    <Form>
                        <div>
                            <label>Tên hiển thị</label>
                            <Field
                                type="text"
                                name="username"
                            />
                            <ErrorMessage name="username" component="p" style={{color: 'red'}}/>
                        </div>
                        <div>
                            <label>Email <span style={{color: 'red'}}>*</span></label>
                            <Field
                                type="email"
                                name="email"
                                required
                            />
                            <ErrorMessage name="email" component="p" style={{color: 'red'}}/>
                        </div>
                        <div>
                            <label>Mật khẩu <span style={{color: 'red'}}>*</span></label>
                            <div className="password-container">
                                <Field
                                    type="password"
                                    name="password"
                                    required
                                />
                                <span onClick={() => {
                                    const field = document.querySelector('input[name="password"]');
                                    field.type = field.type === 'password' ? 'text' : 'password';
                                }}>
                                    <FontAwesomeIcon icon={faEye}/>
                                </span>
                            </div>
                            <ErrorMessage name="password" component="p" style={{color: 'red'}}/>
                        </div>
                        <div>
                            <label>Nhập lại mật khẩu <span style={{color: 'red'}}>*</span></label>
                            <div className="password-container">
                                <Field
                                    type="password"
                                    name="confirmPassword"
                                    required
                                />
                                <span onClick={() => {
                                    const field = document.querySelector('input[name="confirmPassword"]');
                                    field.type = field.type === 'password' ? 'text' : 'password';
                                }}>
                                    <FontAwesomeIcon icon={faEye}/>
                                </span>
                            </div>
                            <ErrorMessage name="confirmPassword" component="p" style={{color: 'red'}}/>
                        </div>
                        <button type="submit" disabled={isSubmitting}>Đăng ký</button>
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

export default Register;