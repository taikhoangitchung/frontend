'use client';

import { useState, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import UserService from '../../../services/UserService';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import 'react-toastify/dist/ReactToastify.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

const ChangePassword = () => {
    const router = useRouter();
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [userEmail, setUserEmail] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedUserEmail = localStorage.getItem('currentUserEmail');
            if (!storedUserEmail) {
                router.push('/login');
                return;
            }
            setUserEmail(storedUserEmail);
        }
    }, [router]);

    const validationSchema = Yup.object({
        oldPassword: Yup.string()
            .required('Mật khẩu cũ không được để trống'),
        newPassword: Yup.string()
            .min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
            .notOneOf([Yup.ref('oldPassword'), null], 'Mật khẩu mới không được giống mật khẩu cũ')
            .required('Mật khẩu mới không được để trống'),
        confirmPassword: Yup.string()
            .oneOf([Yup.ref('newPassword'), null], 'Mật khẩu nhập lại không khớp')
            .required('Vui lòng nhập lại mật khẩu'),
    });

    const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
        try {
            await UserService.changePassword({
                email: userEmail,
                oldPassword: values.oldPassword,
                newPassword: values.newPassword,
            });
            toast.success('Đổi mật khẩu thành công! Chuyển đến trang đăng nhập...', {
                autoClose: 1500,
            });
            setTimeout(() => router.push('/login'), 1500);
        } catch (err) {
            const errorMsg = err.response?.data || 'Đổi mật khẩu không thành công';
            setFieldError('oldPassword', errorMsg);
            toast.error(errorMsg, { autoClose: 3000 });
        } finally {
            setSubmitting(false);
        }
    };

    if (!userEmail) return null;

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
                            <p>{userEmail}</p>
                        </div>
                        <div>
                            <label>Mật khẩu cũ <span style={{ color: 'red' }}>*</span></label>
                            <div className="password-container">
                                <Field type={showOldPassword ? 'text' : 'password'} name="oldPassword" />
                                <span onClick={() => setShowOldPassword(!showOldPassword)}>
                                    <FontAwesomeIcon icon={showOldPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                            <ErrorMessage name="oldPassword" component="p" className="error" />
                        </div>
                        <div>
                            <label>Mật khẩu mới <span style={{ color: 'red' }}>*</span></label>
                            <div className="password-container">
                                <Field type={showNewPassword ? 'text' : 'password'} name="newPassword" />
                                <span onClick={() => setShowNewPassword(!showNewPassword)}>
                                    <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
                                </span>
                            </div>
                            <ErrorMessage name="newPassword" component="p" className="error" />
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
                            Lưu
                        </button>
                    </Form>
                )}
            </Formik>
            <ToastContainer position="top-right" autoClose={1500} />
        </div>
    );
};

export default ChangePassword;