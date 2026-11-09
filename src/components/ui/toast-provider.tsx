import type { ReactNode } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContext, type ToastVariant } from "./toast";

export function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = (message: string, variant: ToastVariant = "success") => {
    toast[variant](message);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
        theme="light"
        style={{ zIndex: 1000 }}
      />
    </ToastContext.Provider>
  );
}
