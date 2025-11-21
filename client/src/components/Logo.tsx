import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showSlogan?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className, showSlogan = true, size = "md" }: LogoProps) {
  // Size maps
  const sizeClasses = {
    sm: { icon: "h-8 w-8", text: "text-2xl", slogan: "text-[0.5rem]" },
    md: { icon: "h-12 w-12", text: "text-4xl", slogan: "text-[0.6rem]" },
    lg: { icon: "h-16 w-16", text: "text-5xl", slogan: "text-xs" },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center gap-3 select-none", className)}>
      {/* Icon: Circle with Plus */}
      <div className={cn("relative flex items-center justify-center shrink-0", currentSize.icon)}>
        {/* Circle Border */}
        <div className="absolute inset-0 rounded-full border-[6px] border-[#00CDB8]" />
        {/* Plus Sign */}
        <svg 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className="w-[60%] h-[60%] text-[#00CDB8]"
        >
          <path d="M19 11h-6V5h-2v6H5v2h6v6h2v-6h6z" />
        </svg>
      </div>

      {/* Text Part */}
      <div className="flex flex-col justify-center">
        <h1 className={cn("font-serif font-bold text-[#2D3648] leading-none tracking-tight", currentSize.text)} style={{ fontFamily: '"Playfair Display", serif' }}>
          1MED
        </h1>
        {showSlogan && (
          <span className={cn("font-sans uppercase tracking-[0.2em] text-[#2D3648] mt-1", currentSize.slogan)}>
            CARE WITHIN REACH
          </span>
        )}
      </div>
    </div>
  );
}
