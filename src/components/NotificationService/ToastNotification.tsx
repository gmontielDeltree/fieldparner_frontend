// src/components/ToastProvider/ToastNotification.tsx
import React, { useEffect, useState } from "react";
import { styled, keyframes } from "@mui/material/styles";

// Animación para el pulso del ícono
const toastPulseAnimation = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Animación para la barra de progreso
const progressAnimation = keyframes`
  0% { width: 100%; }
  100% { width: 0%; }
`;

const ToastContainer = styled("div")<{ toastType: string }>(({ toastType }) => ({
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#333",
    color: "white",
    padding: "14px 18px",
    borderRadius: "12px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    gap: "14px",
    minWidth: "300px",
    maxWidth: "90%",
    border: "1px solid rgba(255,255,255,0.3)",
    position: "relative",
    opacity: 0,
    transition: "opacity 0.4s ease, transform 0.4s ease",
    "&.show": {
        opacity: 1,
        transform: "translateX(-50%) translateY(0)",
    },
}));

const IconContainer = styled("div")({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    animation: `${toastPulseAnimation} 1s ease-in-out`,
});

const TextContainer = styled("div")({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
});

const Title = styled("div")({
    fontSize: "15px",
    fontWeight: 600,
    opacity: 0.95,
    letterSpacing: "0.3px",
    marginBottom: "2px",
});

const ServiceId = styled("div")({
    fontSize: "13px",
    fontFamily: "monospace",
    opacity: 0.9,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    padding: "2px 6px",
    borderRadius: "3px",
    display: "inline-block",
    marginTop: "2px",
});

const CloseButton = styled("div")({
    opacity: 0.7,
    cursor: "pointer",
    padding: "4px",
    borderRadius: "50%",
    marginLeft: "8px",
    transition: "opacity 0.2s ease",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    "&:hover": {
        opacity: 1,
        backgroundColor: "rgba(0, 0, 0, 0.1)",
    },
});

const ProgressBar = styled("div")({
    position: "absolute",
    bottom: "0",
    left: "0",
    height: "3px",
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderBottomLeftRadius: "12px",
    animation: `${progressAnimation} 3s linear forwards`,
});

interface ToastNotificationProps {
    id: number;
    message: string;
    type: "success" | "error" | "delete" | "add" | "update" | "warning" | "info";
    serviceData?: { service?: string; _id?: string };
    onClose?: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
    id,
    message,
    type,
    serviceData,
    onClose,
}) => {
    const [visible, setVisible] = useState(false);

    const getConfig = () => {
        let title = type === "success" ? "Success" : "Error";
        let color =
            type === "success" ? "rgba(52, 199, 89, 0.85)" : "rgba(255, 69, 58, 0.85)";
        let iconSvg =
            type === "success"
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

        const lowerMessage = message.toLowerCase();
        if (
            lowerMessage.includes("delete") ||
            lowerMessage.includes("remov") ||
            lowerMessage.includes("_deleted")
        ) {
            title = "Deleted";
            color = "rgba(97, 97, 97, 0.85)";
            iconSvg =
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>';
        } else if (
            lowerMessage.includes("add") ||
            lowerMessage.includes("creat") ||
            lowerMessage.includes("serviceadded")
        ) {
            title = "Added";
            color = "rgba(52, 199, 89, 0.85)";
            iconSvg =
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>';
        } else if (
            lowerMessage.includes("updat") ||
            lowerMessage.includes("edit") ||
            lowerMessage.includes("modif")
        ) {
            title = "Updated";
            color = "rgba(0, 122, 255, 0.85)";
            iconSvg =
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>';
        } else if (
            lowerMessage.includes("error") ||
            lowerMessage.includes("fail") ||
            lowerMessage.includes("invalid") ||
            lowerMessage.includes("verifyfields")
        ) {
            title = "Error";
            color = "rgba(255, 69, 58, 0.85)";
            iconSvg =
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';
        } else if (
            lowerMessage.includes("warn") ||
            lowerMessage.includes("caution")
        ) {
            title = "Warning";
            color = "rgba(255, 159, 10, 0.85)";
            iconSvg =
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>';
        } else if (
            lowerMessage.includes("info") ||
            lowerMessage.includes("note")
        ) {
            title = "Information";
            color = "rgba(90, 200, 250, 0.85)";
            iconSvg =
                '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
        }
        return { title, color, iconSvg };
    };

    const { title, color, iconSvg } = getConfig();

    useEffect(() => {
        setVisible(true);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onClose) onClose();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <ToastContainer
            toastType={type}
            className={visible ? "show" : ""}
            style={{ backgroundColor: color }}
        >
            <IconContainer dangerouslySetInnerHTML={{ __html: iconSvg }} />
            <TextContainer>
                <Title>{title}</Title>
                {serviceData && (serviceData.service || serviceData._id) && (
                    <ServiceId>
                        Service: {serviceData.service ? serviceData.service : serviceData._id}
                    </ServiceId>
                )}
                <div>{message}</div>
            </TextContainer>
            <CloseButton
                onClick={() => {
                    setVisible(false);
                    if (onClose) onClose();
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </CloseButton>
            <ProgressBar />
        </ToastContainer>
    );
};
