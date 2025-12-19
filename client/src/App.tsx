import "./App.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { ReactElement, useContext } from "react";
import Messenger from "./pages/messenger/Messenger";
import Auth from "./pages/auth/Auth";
import { AuthContext } from "./context/AuthProvider";

type RequiredAuthProps = {
  children: ReactElement;
};

function App() {
  const { currentUser } = useContext(AuthContext);

  const RequiredAuth = ({ children }: RequiredAuthProps) =>
    currentUser ? children : <Navigate to="/login" replace />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/messenger" replace />} />
        <Route
          path="/messenger"
          element={
            <RequiredAuth>
              <Messenger />
            </RequiredAuth>
          }
        />
        <Route path="/login" element={<Auth initialMode="login" />} />
        <Route path="/signup" element={<Auth initialMode="signup" />} />
        <Route path="/auth" element={<Auth initialMode="login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
