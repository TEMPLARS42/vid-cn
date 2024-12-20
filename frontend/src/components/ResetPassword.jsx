import React from 'react';
import { useForm } from 'react-hook-form';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toasty } from '../configs/toasty.config';
import axios from 'axios';

const ResetPassword = () => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isSubmitting }
    } = useForm();

    const password = watch('password', '');
    const navigate = useNavigate();
    const { token } = useParams();

    const onSubmit = async (data) => {
        try {
            const response = await axios.post("/api/reset-password", { ...data, token });
            toasty.success(response.data.message);
            navigate("/login");
        } catch (error) {
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
                                        <KeyRound size={48} className="text-primary" />
                                    </div>
                                    <h2 className="mt-3 fw-bold">Reset Password</h2>
                                    <p className="text-secondary">
                                        Please enter your new password
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)}>
                                    {/* New Password Field */}
                                    <div className="mb-4">
                                        <label className="form-label text-light">New Password</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-light">
                                                <KeyRound size={20} />
                                            </span>
                                            <input
                                                {...register("password", {
                                                    required: "Password is required",
                                                    minLength: {
                                                        value: 8,
                                                        message: "Password must be at least 8 characters"
                                                    },
                                                    // pattern: {
                                                    //     value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
                                                    //     message: "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
                                                    // }
                                                })}
                                                type={showPassword ? "text" : "password"}
                                                className={`form-control bg-dark text-light border-secondary ${errors.password ? 'is-invalid' : ''
                                                    }`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                className="input-group-text bg-dark border-secondary text-light"
                                                onClick={() => setShowPassword(!showPassword)}
                                            >
                                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                            {errors.password && (
                                                <div className="invalid-feedback">{errors.password.message}</div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Confirm Password Field */}
                                    <div className="mb-4">
                                        <label className="form-label text-light">Confirm Password</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-light">
                                                <KeyRound size={20} />
                                            </span>
                                            <input
                                                {...register("confirmPassword", {
                                                    required: "Please confirm your password",
                                                    validate: value =>
                                                        value === password || "Passwords do not match"
                                                })}
                                                type={showConfirmPassword ? "text" : "password"}
                                                className={`form-control bg-dark text-light border-secondary ${errors.confirmPassword ? 'is-invalid' : ''
                                                    }`}
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                className="input-group-text bg-dark border-secondary text-light"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                            </button>
                                            {errors.confirmPassword && (
                                                <div className="invalid-feedback">{errors.confirmPassword.message}</div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-3 mt-4 fw-semibold"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Resetting Password...
                                            </>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;