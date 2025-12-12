import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from './Button';

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "danger", // danger, warning, info
    children
}) {
    if (!isOpen) return null;

    const colors = {
        danger: {
            icon: "text-red-500 bg-red-100 dark:bg-red-900/30",
            button: "bg-red-600 hover:bg-red-700 text-white",
            border: "border-red-200 dark:border-red-900/50"
        },
        warning: {
            icon: "text-orange-500 bg-orange-100 dark:bg-orange-900/30",
            button: "bg-orange-600 hover:bg-orange-700 text-white",
            border: "border-orange-200 dark:border-orange-900/50"
        },
        info: {
            icon: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
            button: "bg-blue-600 hover:bg-blue-700 text-white",
            border: "border-blue-200 dark:border-blue-900/50"
        }
    };

    const style = colors[variant] || colors.info;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className={`relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border ${style.border} overflow-hidden`}
                    >
                        <div className="p-6">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-slate-400 hover:text-slate-500 dark:hover:text-slate-300 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <div className="flex gap-4">
                                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${style.icon}`}>
                                    <AlertTriangle size={24} />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                                        {title}
                                    </h3>
                                    <p className="text-slate-500 leading-relaxed mb-4">
                                        {description}
                                    </p>
                                    {children}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={onClose}
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    className={style.button}
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
