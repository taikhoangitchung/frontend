'use client';

import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ChangePassword = () => {
    const router = useRouter();
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [currentEmail, setCurrentEmail] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const email = localStorage.getItem('currentUserEmail');
            if (email) {
                setCurrentEmail(email);
            } else {
                router.push('/login');
            }
        }
    }, [router]);

    const validationSchema = Yup.object({
        oldPassword: Yup.string()
            .min(6, 'Mật khẩu cũ phải có ít nhất 6 ký tự')
            .required('Mật khẩu cũ không được để trống'),
        newPassword: Yup.string()
            .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
            .required('Mật khẩu mới không được để trống')
            .notOneOf([Yup.ref('oldPassword'), null], 'Mật khẩu mới không được giống mật khẩu cũ'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Mật khẩu nhập lại không khớp')
            .required('Vui lòng nhập lại mật khẩu'),
    });

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            const response = await axios.post('http://localhost:8080/users/change-password', {
                email: currentEmail,
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
            });
            toast.success('Đổi mật khẩu thành công! Chuyển đến trang đăng nhập...', {
                autoClose: 1500,
            });
            setTimeout(() => router.push('/login'), 1500);
        } catch (err) {
            // Lấy thông điệp lỗi cụ thể từ response
            const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Đổi mật khẩu không thành công';
            setFieldError('oldPassword', errorMsg); // Chỉ truyền string, không phải object
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => {
        router.push('/');
    };

    return (
        <div>
            <h2>Đổi mật khẩu</h2>
            <Formik
                initialValues={{ oldPassword: '', newPassword: '', confirmPassword: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ isSubmitting }) => (
                    <Form>
                        <div>
                            <label>Email</label>
                            <p>{currentEmail || 'Không tìm thấy email'}</p>
                        </div>
                        <div>
                            <label>Mật khẩu cũ <span style={{ color: 'red' }}>*</span></label>
                            <div className="password-container">
                                <Field
                                    type={showOldPassword ? 'text' : 'password'}
                                    name="oldPassword"
                                    style={{ paddingRight: '30px', width: '100%' }}
                                />
                                <span
                                    onClick={() => setShowOldPassword(!showOldPassword)}
                                    className="password-toggle"
                                >
                                    <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                            <ErrorMessage name="oldPassword" component="p" className="error" />
                        </div>
                        <div>
                            <label>Mật khẩu mới <span style={{ color: 'red' }}>*</span></label>
                            <div className="password-container">
                                <Field
                                    type={showNewPassword ? 'text' : 'password'}
                                    name="newPassword"
                                    style={{ paddingRight: '30px', width: '100%' }}
                                />
                                <span
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="password-toggle"
                                >
                                    <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                            <ErrorMessage name="newPassword" component="p" className="error" />
                        </div>
                        <div>
                            <label>Nhập lại mật khẩu <span style={{ color: 'red' }}>*</span></label>
                            <div className="password-container">
                                <Field
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    style={{ paddingRight: '30px', width: '100%' }}
                                />
                                <span
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="password-toggle"
                                >
                                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                            <ErrorMessage name="confirmPassword" component="p" className="error" />
                        </div>
                        <button type="submit" disabled={isSubmitting}>
                            Lưu
                        </button>
                        <button type="button" onClick={handleCancel} style={{ marginLeft: '10px', backgroundColor: '#fff', color: '#333', border: '1px solid #ccc' }}>
                            Hủy
                        </button>
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

export default ChangePassword;