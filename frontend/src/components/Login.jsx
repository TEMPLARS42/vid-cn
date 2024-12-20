import { useForm } from 'react-hook-form';
import { Video, AtSign, KeyRound } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setUserInfo } from '../store/user-slice';
import { useNavigate } from 'react-router-dom';
import { toasty } from '../configs/toasty.config';
import { useAuth0 } from "@auth0/auth0-react";

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const dispatch = useDispatch();
  const { loginWithRedirect } = useAuth0();
  const navigate = useNavigate();

  const handleLogin = async (data) => {
    try {
      console.log(data);
      // Handle form submission
      const response = await axios.post("/api/login", data);
      localStorage.setItem('echo', response.data.token);
      // save into redux store.....
      dispatch(setUserInfo(response.data.user));
      window.location.href = "/videos";
    }
    catch (error) {
      console.error(error);
      toasty.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-5">
            <div className="card bg-dark text-light border-secondary shadow-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="d-flex justify-content-center">
                    <Video size={48} className="text-primary" />
                  </div>
                  <h2 className="mt-3 fw-bold">Welcome Back</h2>
                  <p className="text-secondary">Sign in to continue sharing</p>
                </div>

                <form onSubmit={handleSubmit(handleLogin)}>
                  <div className="mb-4">
                    <label className="form-label text-light">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary text-light">
                        <AtSign size={20} />
                      </span>
                      <input
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address"
                          }
                        })}
                        type="email"
                        className={`form-control bg-dark text-light border-secondary ${errors.email ? 'is-invalid' : ''}`}
                        placeholder="you@example.com"
                      />
                      {errors.email && (
                        <div className="invalid-feedback">{errors.email.message}</div>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <label className="form-label text-light mb-0">Password</label>
                      <span className="text-primary text-decoration-none small" onClick={() => navigate("/forgot-password")}>
                        Forgot Password?
                      </span>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-dark border-secondary text-light">
                        <KeyRound size={20} />
                      </span>
                      <input
                        {...register("password", {
                          required: "Password is required"
                        })}
                        type="password"
                        className={`form-control bg-dark text-light border-secondary ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="••••••••"
                      />
                      {errors.password && (
                        <div className="invalid-feedback">{errors.password.message}</div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-3 mt-4 fw-semibold"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary w-100 py-3 mt-4 fw-semibold"
                    onClick={() => loginWithRedirect()}
                  >
                    Sign In using Oauth
                  </button>

                  <div className="text-center mt-4">
                    <span className="text-secondary">Don't have an account? </span>
                    <span onClick={() => navigate("/signup")} className="text-primary text-decoration-none cursor-auto">
                      Sign up
                    </span>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
