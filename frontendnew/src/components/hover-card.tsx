import * as React from "react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

export type HoverItem = {
  title: string;
  description: string;
  /** Optional icon component (Lucide or any React component) */
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  /** Optional brand/accent colors (used for subtle border/indicator) */
  mainColor?: string;
  secondaryColor?: string;
  /** Optional link target */
  href?: string;
};

type HoverGridProps = {
  items: HoverItem[];
  className?: string;
};

export function HoverGrid({ items, className }: HoverGridProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6",
        className
      )}
    >
      {items.map((item, idx) => (
        <HoverCard
          key={`${item.title}-${idx}`}
          item={item}
          hovered={hoveredIndex === idx}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        />
      ))}
    </div>
  );
}

type HoverCardProps = {
  item: HoverItem;
  hovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export function HoverCard({
  item,
  hovered,
  onMouseEnter,
  onMouseLeave,
}: HoverCardProps) {
  const Icon = item.icon;

  return (
    <a
      href={item.href ?? "#"}
      target={item.href ? "_blank" : undefined}
      rel={item.href ? "noreferrer" : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        "relative group block w-full h-full p-1 rounded-3xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
      )}
    >
      {/* Smooth hover background */}
      <AnimatePresence>
        {hovered && (
          <motion.span
            className="absolute inset-0 rounded-3xl bg-blue-200/70 dark:bg-blue-800/70"
            layoutId="hoverBackground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.18 } }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
          />
        )}
      </AnimatePresence>

      {/* Card surface */}
      <div
        className={cn(
          "relative z-10 rounded-2xl border bg-white/90 dark:bg-black/60",
          "border-transparent dark:border-white/10",
          "shadow-sm transition-all duration-200",
          "group-hover:border-slate-300 dark:group-hover:border-slate-700"
        )}
        style={{
          boxShadow:
            hovered && item.mainColor
              ? `0 0 0 1px ${item.mainColor}40, 0 8px 24px -12px #0005`
              : undefined,
        }}
      >
        {/* Top accent line */}
        <div
          className="h-1 w-full rounded-t-2xl"
          style={{
            background:
              item.secondaryColor && item.mainColor
                ? `linear-gradient(90deg, ${item.mainColor}, ${item.secondaryColor})`
                : undefined,
          }}
        />

        <div className="p-5">
          {Icon && (
            <div
              className="mb-3 inline-flex items-center justify-center rounded-xl p-2"
              style={{
                background: item.mainColor ? `${item.mainColor}12` : undefined,
                border: item.mainColor ? `1px solid ${item.mainColor}33` : undefined,
              }}
            >
              <Icon
                width={22}
                height={22}
                style={{ color: item.mainColor ?? "currentColor" }}
              />
            </div>
          )}

          <h4 className="text-[#2D3253] dark:text-white text-base sm:text-lg font-semibold tracking-tight">
            {item.title}
          </h4>

          <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
            {item.description}
          </p>
        </div>

        {/* Bottom gradient hairline */}
        
      </div>
    </a>
  );
}
