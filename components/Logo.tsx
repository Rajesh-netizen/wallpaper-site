export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2 select-none">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="wv-grad" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#ff0080" />
            <stop offset="50%" stopColor="#8a2be2" />
            <stop offset="100%" stopColor="#40e0d0" />
          </linearGradient>
        </defs>

        <rect
          x="2"
          y="2"
          width="36"
          height="36"
          rx="10"
          stroke="url(#wv-grad)"
          strokeWidth="2.5"
        />
        <path
          d="M12 30 C 12 22, 28 22, 28 14"
          stroke="url(#wv-grad)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M12 24 C 8 23, 7 19, 9 17 C 12 18, 13 21, 12 24 Z"
          fill="url(#wv-grad)"
        />
        <path
          d="M20 21 C 24 21, 26 18, 25 15 C 21 15, 19 18, 20 21 Z"
          fill="url(#wv-grad)"
        />
        <path
          d="M28 16 C 32 15, 33 11, 31 9 C 28 10, 27 13, 28 16 Z"
          fill="url(#wv-grad)"
        />
      </svg>
      <span className="font-semibold tracking-tight text-lg text-white">
        Wallvine
      </span>
    </span>
  );
}