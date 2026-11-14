import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  subtitle?: string;
  inverted?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = 'h-9',
  showText = true,
  subtitle = 'COMPLEJO DEPORTIVO',
}) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Isotipo SVG Deportivo Vectorial */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 shrink-0"
      >
        {/* Cuerpo angular y moderno de la copa */}
        <path
          d="M7 4H25V12C25 17.5 21 21.5 16 22C11 21.5 7 17.5 7 12V4Z"
          className="stroke-white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Asas dinámicas */}
        <path
          d="M7 7H4C3.44772 7 3 7.44772 3 8V10C3 12.7614 5.23858 15 8 15"
          className="stroke-white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M25 7H28C28.5523 7 29 7.44772 29 8V10C29 12.7614 26.7614 15 24 15"
          className="stroke-white"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Base y soporte */}
        <path
          d="M16 22V27M11 28H21"
          className="stroke-white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Número 5 institucional integrado con contraste perfecto */}
        <text
          x="16"
          y="12.5"
          textAnchor="middle"
          dominantBaseline="central"
          className="fill-[#c5d86d] font-black text-[10.5px] tracking-tighter"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
        >
          5
        </text>
      </svg>

      {/* Tipografía de marca */}
      {showText && (
        <div className="flex flex-col justify-center">
          <span className="text-xl font-black tracking-tight leading-none text-white">
            Copa 5
          </span>
          <span className="text-[9px] font-bold tracking-[0.22em] uppercase mt-0.5 text-neutral-400">
            {subtitle}
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;