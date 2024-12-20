import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AtSign, Send, ArrowLeft } from 'lucide-react';
import { toasty } from '../configs/toasty.config';
import axios from 'axios';

const ForgotPassword = () => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = async (data) => {
        setError('');
        setIsLoading(true);

        try {
            await axios.post('/api/forgot-password', data);
            setIsSubmitted(true);
        } catch (err) {
            console.error(err);
            toasty.error(err?.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        // Add your navigation logic here
        console.log('Navigate back to login');
    };

    if (isSubmitted) {
        return (
            <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-6 col-lg-5">
                            <div className="card bg-dark text-light border-secondary shadow-lg">
                                <div className="card-body p-5 text-center">
                                    <div className="mb-4">
                                        <Send size={48} className="text-primary" />
                                    </div>
                                    <h2 className="mb-4">Check Your Email</h2>
                                    <p className="text-secondary mb-4">
                                        We've sent a password reset link to:
                                        <br />
                                        <span className="text-light">{register.email}</span>
                                    </p>
                                    <p className="text-secondary small mb-4">
                                        If you don't see the email, check your spam folder or request a new link.
                                    </p>
                                    <button
                                        className="btn btn-outline-primary"
                                        onClick={() => setIsSubmitted(false)}
                                    >
                                        Request New Link
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-dark">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-12 col-md-6 col-lg-5">
                        <div className="card bg-dark text-light border-secondary shadow-lg">
                            <div className="card-body p-5">
                                <button
                                    className="btn btn-dark btn-sm mb-4 d-flex align-items-center gap-2"
                                    onClick={handleBack}
                                >
                                    <ArrowLeft size={16} />
                                    Back to Login
                                </button>

                                <div className="text-center mb-4">
                                    <div className="d-flex justify-content-center">
                                        <AtSign size={48} className="text-primary" />
                                    </div>
                                    <h2 className="mt-3 fw-bold">Forgot Password?</h2>
                                    <p className="text-secondary">
                                        Enter your email address to reset your password
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit(onSubmit)}>
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
                                                className={`form-control bg-dark text-light border-secondary ${errors.email ? 'is-invalid' : ''
                                                    }`}
                                                placeholder="you@example.com"
                                            />
                                            {errors.email && (
                                                <div className="invalid-feedback">{errors.email.message}</div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100 py-3 mt-4 fw-semibold"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Sending...
                                            </>
                                        ) : (
                                            'Reset Password'
                                        )}
                                    </button>
                                </form>

                                {error && (
                                    <div className="alert alert-danger mt-3" role="alert">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;