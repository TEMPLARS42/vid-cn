import { useForm } from 'react-hook-form';
import { Video, AtSign, User, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toasty } from '../configs/toasty.config';

export default function SignUp() {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();
    const navigate = useNavigate();

    const handleSignup = async (data) => {
        try {
            const response = await axios.post('/api/signup', data);
            toasty.success(response.data.message);
            navigate("/login");
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
                                    <h2 className="mt-3 fw-bold">Join VideoShare</h2>
                                    <p className="text-secondary">Start sharing your stories today</p>
                                </div>

                                <form onSubmit={handleSubmit(handleSignup)}>
                                    <div className="mb-4">
                                        <label className="form-label text-light">Full Name</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-dark border-secondary text-light">
                                                <User size={20} />
                                            </span>
                                            <input
                                                {...register("name", { required: "Name is required" })}
                                                type="text"
                                                className={`form-control bg-dark text-light border-secondary ${errors.name ? 'is-invalid' : ''}`}
                                                placeholder="John Doe"
                                            />
                                            {errors.name && (
                                                <div className="invalid-feedback">{errors.name.message}</div>
                                            )}
                                        </div>
                                    </div>

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
                                        <label className="form-label text-light">Password</label>
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
                                                    }
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
                                        Create Account
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}