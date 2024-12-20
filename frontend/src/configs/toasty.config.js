import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import toastify CSS globally

// Success Toast
const success = (message) => {
    toast.success(message, {
        position: "bottom-right",
        autoClose: 3000, // Auto close after 3 seconds
    });
};

// Error Toast
const error = (message) => {
    toast.error(message, {
        position: "bottom-right",
        autoClose: 3000,
    });
};

// Info Toast
const info = (message) => {
    toast.info(message, {
        position: "bottom-right",
        autoClose: 3000,
    });
};

// Warn Toast
const warn = (message) => {
    toast.warn(message, {
        position: "bottom-right",
        autoClose: 3000,
    });
};

export const toasty = {
    success,
    error,
    info,
    warn,
};
