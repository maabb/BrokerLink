export function Logo({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="48" height="48" rx="24" fill="#3A2F25" />
      {/* link between the two parties */}
      <path
        d="M14 30 L22 22 M26 26 L34 18"
        stroke="#EBB868"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* customer node */}
      <circle cx="14" cy="31.5" r="4.5" stroke="#EBB868" strokeWidth="3.2" />
      {/* provider node */}
      <circle cx="34" cy="16.5" r="4.5" fill="#EBB868" />
    </svg>
  );
}
