import type { Appearance } from "@clerk/types";

/** Shared Clerk theme — matches Prompt2Post dark glass UI. */
export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: "#6750f8",
    colorDanger: "#ff5c8a",
    colorSuccess: "#34e89e",
    colorBackground: "#12121a",
    colorInputBackground: "#1a1a26",
    colorInputText: "#ffffff",
    colorText: "#ffffff",
    colorTextSecondary: "rgba(255,255,255,0.58)",
    colorTextOnPrimaryBackground: "#ffffff",
    colorNeutral: "rgba(255,255,255,0.08)",
    borderRadius: "12px",
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    fontSize: "0.9375rem",
  },
  elements: {
    rootBox: {
      width: "100%",
      maxWidth: "420px",
    },
    cardBox: {
      width: "100%",
      boxShadow: "none",
    },
    card: {
      background: "rgba(255, 255, 255, 0.04)",
      backdropFilter: "blur(24px)",
      WebkitBackdropFilter: "blur(24px)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "20px",
      boxShadow: "0 24px 80px rgba(0, 0, 0, 0.45)",
      padding: "1.75rem 1.5rem",
    },
    headerTitle: {
      fontSize: "1.375rem",
      fontWeight: "700",
      letterSpacing: "-0.02em",
      color: "#ffffff",
    },
    headerSubtitle: {
      color: "rgba(255, 255, 255, 0.55)",
      fontSize: "0.875rem",
      lineHeight: "1.5",
    },
    socialButtonsBlockButton: {
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.14)",
      color: "#ffffff",
      height: "2.75rem",
      boxShadow: "none",
      transition: "background-color 0.15s, border-color 0.15s",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderColor: "rgba(255, 255, 255, 0.22)",
      },
    },
    socialButtonsBlockButtonText: {
      color: "#ffffff",
      fontWeight: "500",
      fontSize: "0.875rem",
    },
    socialButtonsProviderIcon: {
      width: "1.125rem",
      height: "1.125rem",
    },
    dividerLine: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    dividerText: {
      color: "rgba(255, 255, 255, 0.38)",
      fontSize: "0.75rem",
      textTransform: "lowercase",
    },
    formFieldLabel: {
      color: "rgba(255, 255, 255, 0.78)",
      fontSize: "0.8125rem",
      fontWeight: "500",
      marginBottom: "0.375rem",
    },
    formFieldInput: {
      backgroundColor: "#1a1a26",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      color: "#ffffff",
      height: "2.75rem",
      "&::placeholder": {
        color: "rgba(255, 255, 255, 0.28)",
      },
      "&:focus": {
        borderColor: "rgba(103, 80, 248, 0.55)",
        boxShadow: "0 0 0 3px rgba(103, 80, 248, 0.15)",
      },
    },
    formButtonPrimary: {
      background: "linear-gradient(135deg, #6750f8 0%, #5530ef 100%)",
      boxShadow: "0 4px 20px rgba(103, 80, 248, 0.35)",
      height: "2.75rem",
      fontWeight: "600",
      border: "none",
      transition: "opacity 0.15s, box-shadow 0.15s",
      "&:hover": {
        background: "linear-gradient(135deg, #7260ff 0%, #5530ef 100%)",
        boxShadow: "0 6px 24px rgba(103, 80, 248, 0.45)",
      },
    },
    formButtonPrimaryText: {
      color: "#ffffff",
      fontWeight: "600",
    },
    footerActionLink: {
      color: "#a89aff",
      fontWeight: "600",
      "&:hover": {
        color: "#c4baff",
      },
    },
    footerActionText: {
      color: "rgba(255, 255, 255, 0.48)",
    },
    footer: {
      background: "transparent",
    },
    footerPagesLink: {
      color: "rgba(255, 255, 255, 0.38)",
    },
    identityPreviewText: {
      color: "#ffffff",
    },
    identityPreviewEditButton: {
      color: "#a89aff",
    },
    formFieldInputShowPasswordButton: {
      color: "rgba(255, 255, 255, 0.45)",
    },
    formFieldErrorText: {
      color: "#ff8fab",
    },
    alertText: {
      color: "rgba(255, 255, 255, 0.85)",
    },
    otpCodeFieldInput: {
      backgroundColor: "#1a1a26",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      color: "#ffffff",
    },
    alternativeMethodsBlockButton: {
      backgroundColor: "rgba(255, 255, 255, 0.06)",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      color: "#ffffff",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      },
    },
    developmentModeNotice: {
      backgroundColor: "rgba(251, 191, 36, 0.08)",
      borderTop: "1px solid rgba(251, 191, 36, 0.15)",
    },
    developmentModeNoticeText: {
      color: "rgba(251, 191, 36, 0.85)",
      fontSize: "0.75rem",
    },
    badge: {
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      color: "rgba(255, 255, 255, 0.55)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
    },
    logoBox: {
      display: "none",
    },
    logoImage: {
      display: "none",
    },
  },
  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
  },
};
