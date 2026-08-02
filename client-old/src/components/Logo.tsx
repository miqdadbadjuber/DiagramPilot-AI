export default function Logo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M4 4v16h6a8 8 0 0 0 0-16H4z" />
      <path d="M13 20V4h5a5 5 0 0 1 0 10h-5" />
    </svg>
  );
}
