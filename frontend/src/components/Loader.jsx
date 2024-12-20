import React from 'react';

const Loader = ({ isLoading, children }) => {
    return (
        <>
            {isLoading && <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>}
            {children}
        </>
    )
};

export default Loader;
