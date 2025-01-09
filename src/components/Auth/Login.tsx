import React from "react";
import { useAuth } from "../../contexts/AuthContext";

const Login: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center w-100" style={{ maxWidth: "400px" }}>
        {/* Sign Up Free Button */}
        <button className="btn btn-purple btn-lg mb-3 w-100">
          Sign Up Free
        </button>

        {/* OR Separator */}
        <div className="d-flex align-items-center my-3">
          <div className="flex-grow-1 border-bottom"></div>
          <span className="mx-2 text-muted">by</span>
          <div className="flex-grow-1 border-bottom"></div>
        </div>

        {/* Google Sign Up Button */}
        <button
          onClick={login}
          className="btn btn-light btn-lg w-100 google-btn d-flex align-items-center justify-content-center"
        >
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" // External URL
            alt="Google Logo"
            className="google-logo me-2"
          />
          Sign Up with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
