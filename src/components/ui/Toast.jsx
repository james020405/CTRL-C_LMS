import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from 'lucide-react';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const toast = {
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
    };

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none p-4">
                <AnimatePresence mode="popLayout">
                    {toasts.map((t) => (
                        <Toast key={t.id} {...t} onClose={() => removeToast(t.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};

const Toast = ({ id, message, type, onClose }) => {
    const styles = {
        success: {
            bg: "bg-white dark:bg-slate-800",
            border: "border-green-500",
            icon: <CheckCircle className="text-green-500" size={20} />
        },
        error: {
            bg: "bg-white dark:bg-slate-800",
            border: "border-red-500",
            icon: <AlertCircle className="text-red-500" size={20} />
        },
        warning: {
            bg: "bg-white dark:bg-slate-800",
            border: "border-orange-500",
            icon: <AlertTriangle className="text-orange-500" size={20} />
        },
        info: {
            bg: "bg-white dark:bg-slate-800",
            border: "border-blue-500",
            icon: <Info className="text-blue-500" size={20} />
        }
    };

    const style = styles[type] || styles.info;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-lg border-l-4 ${style.bg} ${style.border}`}
        >
            <div className="flex-shrink-0 mt-0.5">{style.icon}</div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100 flex-1 leading-tight">
                {message}
            </p>
            <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
                <X size={16} />
            </button>
        </motion.div>
    );
};
