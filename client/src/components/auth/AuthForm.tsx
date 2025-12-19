import { useMemo, useState } from "react";
import { ErrorMessage, Field, Form, Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import type { AuthFormValues, AuthMode } from "../../types/auth";

const buildValidationSchema = (mode: AuthMode) => {
  const optionalEmail = Yup.string()
    .email("Enter a valid email address")
    .transform((value) => (value ? value : undefined))
    .notRequired();

  return Yup.object({
    username: Yup.string().required("Username is required"),
    email:
      mode === "signup"
        ? Yup.string()
            .email("Enter a valid email address")
            .required("Email is required")
        : optionalEmail,
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword:
      mode === "signup"
        ? Yup.string()
            .oneOf([Yup.ref("password")], "Passwords must match")
            .required("Confirm your password")
        : Yup.string().notRequired(),
  }) as Yup.ObjectSchema<AuthFormValues>;
};

type PasswordFieldProps = {
  label: string;
  name: keyof Pick<AuthFormValues, "password" | "confirmPassword">;
  onToggle: () => void;
  isVisible: boolean;
  placeholder?: string;
};

const PasswordField = ({
  label,
  name,
  onToggle,
  isVisible,
  placeholder,
}: PasswordFieldProps) => (
  <div className="space-y-1">
    <label htmlFor={name} className="text-sm text-slate-700">
      {label}
    </label>
    <div className="relative">
      <Field
        id={name}
        name={name}
        type={isVisible ? "text" : "password"}
        placeholder={placeholder}
        className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-2 text-xs font-semibold text-blue-600 transition hover:text-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"
        aria-label={isVisible ? "Hide password" : "Show password"}
      >
        {isVisible ? "Hide" : "Show"}
      </button>
    </div>
    <ErrorMessage
      name={name}
      component="div"
      className="text-xs text-red-500"
    />
  </div>
);

type AuthFormProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (
    values: AuthFormValues,
    helpers: FormikHelpers<AuthFormValues>
  ) => Promise<void> | void;
  apiError?: string;
  statusMessage?: string;
  isSubmitting?: boolean;
  extraAction?: { label: string; onClick: () => void } | null;
};

const AuthForm = ({
  mode,
  onModeChange,
  onSubmit,
  apiError,
  statusMessage,
  isSubmitting,
  extraAction = null,
}: AuthFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const validationSchema = useMemo(() => buildValidationSchema(mode), [mode]);

  const initialValues = useMemo<AuthFormValues>(
    () => ({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    }),
    []
  );

  const handleSubmit = async (
    values: AuthFormValues,
    helpers: FormikHelpers<AuthFormValues>
  ) => {
    await onSubmit(values, helpers);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-[#f8fafc] px-3 py-6 text-slate-800">
      <div className="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-100 bg-white shadow-xl shadow-blue-100/40 transition hover:shadow-blue-200/50">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="relative hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-8 text-white md:flex md:flex-col md:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.15),_transparent_45%)]" />
            <div className="relative space-y-4">
              <p className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
                Messaging
              </p>
              <h2 className="text-3xl font-bold leading-tight">
                Welcome back to Kotha
              </h2>
              <p className="text-sm text-blue-100">
                Chat in real-time with your friends. Switch between Login and
                Sign Up without leaving the page.
              </p>
            </div>
            <div className="relative space-y-2 text-sm text-blue-100">
              <p>• Secure authentication with JWT</p>
              <p>• Real-time messaging with Socket.IO</p>
              <p>• Responsive UI with smooth transitions</p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">
                  {mode === "login" ? "Log in" : "Create account"}
                </h1>
                <p className="text-sm text-slate-500">
                  {mode === "login"
                    ? "Access your conversations and start chatting."
                    : "Join to start messaging instantly."}
                </p>
              </div>
              <div className="flex rounded-full bg-slate-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => onModeChange("login")}
                  className={`rounded-full px-3 py-1 transition ${
                    mode === "login"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  aria-pressed={mode === "login"}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => onModeChange("signup")}
                  className={`rounded-full px-3 py-1 transition ${
                    mode === "signup"
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                  aria-pressed={mode === "signup"}
                >
                  Sign Up
                </button>
              </div>
            </div>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
              validateOnChange
              validateOnBlur
            >
              {({ isSubmitting: formSubmitting }) => {
                const submitting = isSubmitting || formSubmitting;
                return (
                  <Form className="mt-4 space-y-3">
                    <div className="space-y-1">
                      <label
                        htmlFor="username"
                        className="text-sm text-slate-700"
                      >
                        Username
                      </label>
                      <Field
                        id="username"
                        name="username"
                        placeholder="johndoe"
                        className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                      />
                      <ErrorMessage
                        name="username"
                        component="div"
                        className="text-xs text-red-500"
                      />
                    </div>

                    {mode === "signup" && (
                      <div className="space-y-1">
                        <label
                          htmlFor="email"
                          className="text-sm text-slate-700"
                        >
                          Email
                        </label>
                        <Field
                          id="email"
                          name="email"
                          type="email"
                          placeholder="you@example.com"
                          className="w-full rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-800 focus:border-blue-500 focus:outline-none"
                        />
                        <ErrorMessage
                          name="email"
                          component="div"
                          className="text-xs text-red-500"
                        />
                      </div>
                    )}

                    <PasswordField
                      label="Password"
                      name="password"
                      placeholder="Enter your password"
                      isVisible={showPassword}
                      onToggle={() => setShowPassword((prev) => !prev)}
                    />

                    {mode === "signup" && (
                      <PasswordField
                        label="Confirm Password"
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        isVisible={showConfirm}
                        onToggle={() => setShowConfirm((prev) => !prev)}
                      />
                    )}

                    {(apiError || statusMessage) && (
                      <div
                        className={`rounded border px-3 py-2 text-sm ${
                          apiError
                            ? "border-red-200 bg-red-50 text-red-600"
                            : "border-green-200 bg-green-50 text-green-700"
                        }`}
                        role="alert"
                      >
                        {apiError || statusMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:translate-y-0 disabled:opacity-60"
                    >
                      {submitting
                        ? mode === "login"
                          ? "Signing in..."
                          : "Creating account..."
                        : mode === "login"
                        ? "Log in"
                        : "Sign up"}
                    </button>
                    {extraAction && mode === "login" && (
                      <button
                        type="button"
                        onClick={extraAction.onClick}
                        disabled={submitting}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:border-blue-300 hover:bg-blue-50 disabled:opacity-60"
                      >
                        {extraAction.label}
                      </button>
                    )}
                  </Form>
                );
              }}
            </Formik>

            <div className="mt-6 text-center text-xs text-slate-500">
              <p>Press Tab/Shift+Tab to navigate. Enter to submit.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
