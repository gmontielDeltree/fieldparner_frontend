// src/components/ToastProvider/ToastProvider.tsx
import React, { createContext, useContext, useState, useCallback } from "react";
import { ToastNotification } from "./ToastNotification";

interface Toast {
    id: number;
    message: string;
    type: "success" | "error" | "delete" | "add" | "update" | "warning" | "info";
    serviceData?: { service?: string; _id?: string };
}

interface ToastContextProps {
    showToast: (
        message: string,
        type?: Toast["type"],
        serviceData?: Toast["serviceData"]
    ) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback(
        (
            message: string,
            type: Toast["type"] = "success",
            serviceData?: Toast["serviceData"]
        ) => {
            const id = new Date().getTime();
            setToasts((prev) => [...prev, { id, message, type, serviceData }]);
        },
        []
    );

    const handleRemoveToast = (id: number) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toasts.map((toast) => (
                <ToastNotification
                    key={toast.id}
                    id={toast.id}
                    message={toast.message}
                    type={toast.type}
                    serviceData={toast.serviceData}
                    onClose={() => handleRemoveToast(toast.id)}
                />
            ))}
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextProps => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
