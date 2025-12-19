import { useContext, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthForm from "../../components/auth/AuthForm";
import authServices from "../../services/authServices";
import { AuthContext } from "../../context/AuthProvider";
import type { AuthFormValues, AuthMode } from "../../types/auth";

interface AuthProps {
  initialMode?: AuthMode;
}

const Auth = ({ initialMode = "login" }: AuthProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const defaultMode = useMemo<AuthMode>(() => {
    if (location.pathname.includes("signup")) return "signup";
    return initialMode;
  }, [initialMode, location.pathname]);

  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [apiError, setApiError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: AuthFormValues) => {
    setApiError("");
    setStatusMessage("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        const res = await authServices.login({
          username: values.username.trim(),
          password: values.password,
        });
        dispatch({ type: "LOGIN", payload: res.data });
        navigate("/messenger");
      } else {
        await authServices.signup({
          username: values.username.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
        });
        setStatusMessage("Account created! Please log in.");
        setMode("login");
        navigate("/login", { replace: true });
      }
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Unable to process request. Please try again.";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setApiError("");
    setStatusMessage("");
    setMode("login");
    setSubmitting(true);
    try {
      const res = await authServices.login({
        username: "user",
        password: "Password123!",
      });
      dispatch({ type: "LOGIN", payload: res.data });
      navigate("/messenger");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message ||
        "Unable to process request. Please try again.";
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthForm
      mode={mode}
      onModeChange={setMode}
      onSubmit={handleSubmit}
      apiError={apiError}
      statusMessage={statusMessage}
      isSubmitting={submitting}
      extraAction={
        mode === "login"
          ? {
              label: "Login as demo user",
              onClick: handleDemoLogin,
            }
          : null
      }
    />
  );
};

export default Auth;
