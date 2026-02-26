import React from "react";

function SurveyIllustration({ className, style }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 240 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background decorative circle */}
      <circle cx="120" cy="90" r="75" fill="#EFF1FC" />

      {/* Person silhouette */}
      <circle cx="80" cy="62" r="10" fill="#16205b" />
      <path
        d="M68 78c0-6.6 5.4-12 12-12s12 5.4 12 12v18H68V78z"
        fill="#16205b"
      />
      {/* Person arm pointing */}
      <path
        d="M92 82l14-8"
        stroke="#16205b"
        strokeWidth="3"
        strokeLinecap="round"
      />

      {/* Main clipboard/document */}
      <rect
        x="110"
        y="38"
        width="72"
        height="95"
        rx="6"
        fill="#FFFFFF"
        stroke="#16205b"
        strokeWidth="2"
      />
      {/* Clipboard top clip */}
      <rect x="130" y="32" width="32" height="12" rx="4" fill="#16205b" />

      {/* Chart bars inside clipboard */}
      <rect x="122" y="60" width="10" height="30" rx="2" fill="#04bdf3" />
      <rect x="136" y="70" width="10" height="20" rx="2" fill="#16205b" />
      <rect x="150" y="55" width="10" height="35" rx="2" fill="#04bdf3" />
      <rect x="164" y="65" width="10" height="25" rx="2" fill="#16205b" />

      {/* Checklist lines */}
      <rect x="122" y="100" width="30" height="4" rx="2" fill="#C4CDD5" />
      <rect x="122" y="110" width="45" height="4" rx="2" fill="#C4CDD5" />
      <rect x="122" y="120" width="35" height="4" rx="2" fill="#C4CDD5" />

      {/* Floating play/action triangle */}
      <polygon points="185,50 198,58 185,66" fill="#04bdf3" />

      {/* Small decorative elements */}
      <circle cx="68" cy="42" r="4" fill="#04bdf3" opacity="0.3" />
      <circle cx="195" cy="110" r="6" fill="#EFF1FC" stroke="#04bdf3" strokeWidth="1.5" />
      <rect x="55" y="110" width="8" height="8" rx="2" fill="#04bdf3" opacity="0.2" />
    </svg>
  );
}

export default SurveyIllustration;
