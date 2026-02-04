import { Formik, Field, ErrorMessage } from 'formik';
import { registerSchema } from '../../validation/YupSchema';
import css from './RegisterComponent.module.css';
import { useUserStore } from '../../store/UserStore';

interface RegisterValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterComponent = () => {
  const register = useUserStore((state) => state.register);
  
  return (
    <div className={css['register-cont']}>
      <Formik<RegisterValues>
        initialValues={{ username: '', email: '', password: '', confirmPassword: '' }}
        validateOnBlur={false}
        validationSchema={registerSchema}
        onSubmit={async (values, { setSubmitting }) => {
          const res = await register(values);
          if (!res.success) {
            console.error(res.error);
          }
          setSubmitting(false);
        }}
      >
        {({ errors, touched, values, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit} className={css['form-register']}>
            
            <label className={css['input-wrapper']}>
              <span className={css['input-label']}>Nazwa użytkownika</span>
              <Field
                type="text"
                name="username"
                placeholder="your_nickname"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.username}
                className={`${css['input']} ${
                  errors.username && touched.username ? css['input-error'] : ''
                }`}
              />
              <ErrorMessage name="username" component="div" className={css['error-message']} />
            </label>

            <label className={css['input-wrapper']}>
              <span className={css['input-label']}>Email</span>
              <Field
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.email}
                className={`${css['input']} ${
                  errors.email && touched.email ? css['input-error'] : ''
                }`}
              />
              <ErrorMessage name="email" component="div" className={css['error-message']} />
            </label>

            <label className={css['input-wrapper']}>
              <span className={css['input-label']}>Hasło</span>
              <Field
                type="password"
                name="password"
                placeholder="Example123!"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.password}
                className={`${css['input']} ${
                  errors.password && touched.password ? css['input-error'] : ''
                }`}
              />
              <ErrorMessage name="password" component="div" className={css['error-message']} />
            </label>

            <label className={css['input-wrapper']}>
              <span className={css['input-label']}>Potwierdź hasło</span>
              <Field
                type="password"
                name="confirmPassword"
                placeholder="Example123!"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.confirmPassword}
                className={`${css['input']} ${
                  errors.confirmPassword && touched.confirmPassword ? css['input-error'] : ''
                }`}
              />
              <ErrorMessage name="confirmPassword" component="div" className={css['error-message']} />
            </label>

            <button
              className={css['submit-register']}
              type="submit"
              disabled={isSubmitting}
            >
              UTWÓRZ KONTO
            </button>
          </form>
        )}
      </Formik>
    </div>
  );
};
