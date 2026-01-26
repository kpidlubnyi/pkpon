import { ErrorMessage, Field, Formik } from 'formik';
import { loginSchema } from '../../validation/YupSchema';
import css from './LoginComponent.module.css';
import { useUserStore } from '../../store/UserStore';
import { Loading } from '../Loading/Loading';

interface LoginValues {
    email: string;
    password: string;
}

export const LoginComponent = () => {
    const login = useUserStore((state) => state.login);

    return (
        <div className={css['formik']}>
            <Formik<LoginValues>
                initialValues={{ email: '', password: '' }}
                validateOnBlur={false}
                validationSchema={loginSchema}
                onSubmit={async (values, { setSubmitting, setStatus }) => {
                    const res = await login(values);
                    if (!res.success) {
                        setStatus(res.error);
                    }
                    setSubmitting(false);
                }}
            >
                {({
                    errors,
                    touched,
                    values,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                }) => (
                    <form onSubmit={handleSubmit} className={css['form-login']}>
                        <label
                            className={`${css['input-wrapper']}`}
                        >
                            <span className={css['input-label']}>Email</span>
                            <Field
                                type="email"
                                name="email"
                                className={`${css['input']} ${errors.email && touched.email ? css['input-error'] : ''
                                    }`}
                                placeholder="Enter your email"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.email}
                            />
                            <ErrorMessage name="email" component="div" className={css['error-message']} />
                        </label>
                        <label
                            className={`${css['input-wrapper']}`}
                        >
                            <span className={css['input-label']}>Password</span>
                            <Field
                                type="password"
                                name="password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={values.password}
                                className={`${css['input']} ${errors.password && touched.password ? css['input-error'] : ''
                                    }`}
                                placeholder="Enter your password"
                            />
                            <ErrorMessage name="password" component="div" className={css['error-message']} />
                        </label>
                        <button className={css['submit-login']} type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loading source='user' />
                            ) : (
                                'SIGN IN'
                            )}
                        </button>
                    </form>
                )}
            </Formik>
        </div>
    );
};
