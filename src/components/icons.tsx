import type { SVGProps } from 'react';

export function RouletteWheelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 17.5a5.5 5.5 0 1 0 0-11 5.5 5.5 0 0 0 0 11z" />
      <path d="m12 2 1.5 4" />
      <path d="m22 12-4-1.5" />
      <path d="m12 22-1.5-4" />
      <path d="m2 12 4-1.5" />
      <path d="m5.2 5.2 2.8 2.8" />
      <path d="m18.8 18.8-2.8-2.8" />
      <path d="m5.2 18.8 2.8-2.8" />
      <path d="m18.8 5.2-2.8 2.8" />
    </svg>
  );
}

export function ChipIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 12c-2.76 0-5-1.12-5-2.5S9.24 7 12 7s5 1.12 5 2.5-2.24 2.5-5 2.5z" />
            <path d="M12 12v4" />
            <path d="M7 14.5c0 1.38 2.24 2.5 5 2.5s5-1.12 5-2.5" />
        </svg>
    );
}
