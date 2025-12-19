import { ErrorMessage, Field, Form, Formik, type FormikHelpers } from "formik";
import * as Yup from "yup";
import mainBanner from "../../assets/images/main-banner.jpg";
import authServices from "../../services/authServices";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthProvider";
import { useNavigate } from "react-router-dom";
import type { LoginPayload } from "../../types/auth";

const validationSchema = Yup.object().shape({
  username: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const { dispatch } = useContext(AuthContext);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const initialValues: LoginPayload = {
    username: "",
    password: "",
  };

  const handleSubmit = async (
    values: LoginPayload,
    { setSubmitting }: FormikHelpers<LoginPayload>
  ) => {
    setErrorMessage("");
    try {
      setSubmitting(true);
      const res = await authServices.login(values);
      dispatch({
        type: "LOGIN",
        payload: res.data,
      });
      navigate("/messenger");
    } catch (error) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Unable to login. Please try again.";
      setErrorMessage(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-2">
      <div className="flex justify-center items-center">
        <img src={mainBanner} alt="" />
      </div>
      <div className="h-screen flex flex-col justify-center">
        <div>Logo</div>
        <div className="flex flex-col">
          <span className="text-xl font-semibold text-gray-800">Login</span>
          <span className="text-sm text-gray-600">
            Welcome Back, Your friends are waiting for you!
          </span>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-1 w-80">
                <div className="space-x-2 grid grid-cols-4">
                  <label htmlFor="username" className="text-gray-800">
                    Username:
                  </label>
                  <Field
                    name="username"
                    placeholder="Enter your username"
                    className="col-span-3 py-1 border rounded-sm outline-none pl-2 focus:border-blue-600"
                  />
                  <ErrorMessage
                    name="username"
                    component="div"
                    className="col-start-2 col-span-3 text-red-500"
                  />
                </div>
                <div className="space-x-2 grid grid-cols-4">
                  <label htmlFor="password" className="text-gray-800">
                    Password:
                  </label>
                  <Field
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    className="col-span-3 py-1 border rounded-sm outline-none pl-2 focus:border-blue-600"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="col-start-2 col-span-3 text-red-500"
                  />
                </div>
                {errorMessage && (
                  <div className="text-center text-red-500 text-sm">
                    {errorMessage}
                  </div>
                )}
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-400 text-white px-8 py-1 rounded-sm disabled:opacity-70"
                  >
                    {isSubmitting ? "Loading..." : "Login"}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Login;
