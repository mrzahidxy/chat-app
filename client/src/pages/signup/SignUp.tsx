import { ErrorMessage, Field, Form, Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authServices from "../../services/authServices";
import type { SignupPayload } from "../../types/auth";

interface SignUpFormValues extends SignupPayload {
  confirmPassword: string;
}

const validationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

const SignUp = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const initialValues: SignUpFormValues = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const handleSubmit = async (
    values: SignUpFormValues,
    { setSubmitting }: FormikHelpers<SignUpFormValues>
  ) => {
    setErrorMessage("");
    try {
      setSubmitting(true);
      await authServices.signup({
        username: values.username.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
      });
      navigate("/login", { replace: true, state: { signedUp: true } });
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Unable to sign up. Please try again.";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-slate-800">Sign Up</h1>
          <p className="text-sm text-slate-500">
            Create an account to start chatting with your friends.
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="username" className="text-sm text-slate-700">
                  Username
                </label>
                <Field
                  name="username"
                  placeholder="Enter a username"
                  className="w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <ErrorMessage
                  name="username"
                  component="div"
                  className="text-xs text-red-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-sm text-slate-700">
                  Email
                </label>
                <Field
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-xs text-red-500"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="text-sm text-slate-700">
                  Password
                </label>
                <Field
                  name="password"
                  type="password"
                  placeholder="Enter a password"
                  className="w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-xs text-red-500"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="confirmPassword"
                  className="text-sm text-slate-700"
                >
                  Confirm Password
                </label>
                <Field
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  className="w-full rounded border px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
                <ErrorMessage
                  name="confirmPassword"
                  component="div"
                  className="text-xs text-red-500"
                />
              </div>

              {errorMessage && (
                <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-600">
                  {errorMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-70"
              >
                {isSubmitting ? "Creating account..." : "Sign Up"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="mt-4 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
