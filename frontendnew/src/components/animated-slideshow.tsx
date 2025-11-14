"use client"

import React from "react"
import { MotionConfig, AnimatePresence, motion } from "motion/react"
import { cn } from "@/lib/utils"

/* ----------------------------- types & props ----------------------------- */

interface Feature {
  step: number
  title?: string
  content: string
  image: string
}

interface FeatureStepsProps {
  features: Feature[]
  className?: string
  title?: string
  autoPlayInterval?: number
  imageHeight?: string
}

/* --------------------------- hover slider context --------------------------- */

interface HoverSliderContextValue {
  activeSlide: number
  changeSlide: (index: number) => void
  setPaused: (v: boolean) => void
}

const HoverSliderContext = React.createContext<HoverSliderContextValue | null>(null)

function useHoverSliderContext() {
  const ctx = React.useContext(HoverSliderContext)
  if (!ctx) throw new Error("useHoverSliderContext must be used within provider")
  return ctx
}

/* ----------------------------- helpers (ui) ----------------------------- */

const clipPathVariants = {
  visible: { clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)" },
  hidden:  { clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)"  },
}

function splitText(text: string) {
  const words = text.split(" ").map(w => w + " ")
  const chars = words.flatMap(w => w.split(""))
  return { characters: chars }
}

const WordWrap = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ children, className, ...props }, ref) => (
    <span ref={ref} className={cn("relative inline-block origin-bottom overflow-hidden", className)} {...props}>
      {children}
    </span>
  )
)
WordWrap.displayName = "WordWrap"

function TextStaggerHover({ text, index }: { text: string; index: number }) {
  const { activeSlide, changeSlide, setPaused } = useHoverSliderContext()
  const { characters } = splitText(text)
  const isActive = activeSlide === index

  return (
    <span
      onMouseEnter={() => changeSlide(index)}
      onFocus={() => changeSlide(index)}
      onMouseOver={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className="cursor-pointer select-none"
    >
      {characters.map((char, i) => (
        <span key={`${char}-${i}`} className="relative inline-block overflow-hidden">
          <MotionConfig transition={{ delay: i * 0.02, duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}>
            <motion.span
              className="inline-block opacity-20"
              initial={{ y: "0%" }}
              animate={isActive ? { y: "-110%" } : { y: "0%" }}
            >
              {char}
            </motion.span>
            <motion.span
              className="absolute left-0 top-0 inline-block opacity-100"
              initial={{ y: "110%" }}
              animate={isActive ? { y: "0%" } : { y: "110%" }}
            >
              {char}
            </motion.span>
          </MotionConfig>
        </span>
      ))}
    </span>
  )
}

function HoverSliderImage({ index, src, alt }: { index: number; src: string; alt?: string }) {
  const { activeSlide } = useHoverSliderContext()
  return (
    <motion.img
      src={src}
      alt={alt || ""}
      className="inline-block h-full w-full object-cover"
      transition={{ ease: [0.33, 1, 0.68, 1], duration: 0.8 }}
      variants={clipPathVariants}
      animate={activeSlide === index ? "visible" : "hidden"}
    />
  )
}

/* ---------------------------- main component ---------------------------- */

export function FeatureSteps({
  features,
  className,
  title = "How It Works",
  autoPlayInterval = 3000,
  imageHeight = "h-[400px]",
}: FeatureStepsProps) {
  const [activeSlide, setActiveSlide] = React.useState(0)
  const [paused, setPaused] = React.useState(false)
  const [progress, setProgress] = React.useState(0) // kept for timing only (not rendered)

  // autoplay tick (every 100ms)
  React.useEffect(() => {
    if (paused || features.length <= 1) return
    const stepMs = 100
    const totalTicks = Math.max(1, Math.round(autoPlayInterval / stepMs))
    const inc = 100 / totalTicks

    const t = setInterval(() => {
      setProgress(p => {
        const np = p + inc
        if (np >= 100) {
          setActiveSlide(s => (s + 1) % features.length)
          return 0
        }
        return np
      })
    }, stepMs)

    return () => clearInterval(t)
  }, [paused, features.length, autoPlayInterval])

  // keyboard navigation
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setActiveSlide(s => (s + 1) % features.length)
        setProgress(0)
      } else if (e.key === "ArrowLeft") {
        setActiveSlide(s => (s - 1 + features.length) % features.length)
        setProgress(0)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [features.length])

  const changeSlide = React.useCallback((index: number) => {
    setActiveSlide(index)
    setProgress(0)
  }, [])

  return (
    <HoverSliderContext.Provider value={{ activeSlide, changeSlide, setPaused }}>
      <div
        className={cn("p-8 md:p-12", className)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="mb-10 text-center text-3xl font-bold md:text-4xl lg:text-5xl">{title}</h2>

          <div className="grid md:grid-cols-2 md:gap-2 items-center">
  {/* ----- left titles column (same animated style) ----- */}
  <div className="order-2 md:order-1 space-y-4 md:space-y-6 pl-6 md:pl-12"> 
    {features.map((f, i) => {
      const isActive = i === activeSlide
      return (
        <motion.button
          type="button"
          key={`${f.step}-${i}`}
          className="flex w-full items-center gap-3 md:gap-4 text-left"
          initial={{ opacity: 0.35 }}
          animate={{ opacity: isActive ? 1 : 0.35 }}
          transition={{ duration: 0.35 }}
          onMouseEnter={() => changeSlide(i)}
          onFocus={() => changeSlide(i)}
          onClick={() => changeSlide(i)}
        >
          <motion.div
            className={cn(
              "flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full border-2 shrink-0",
              isActive
                ? "scale-110 border-primary bg-primary text-primary-foreground"
                : "border-muted-foreground bg-muted"
            )}
            transition={{ type: "spring", stiffness: 300, damping: 18 }}
          >
            {i <= activeSlide ? (
              <span className="text-base md:text-lg font-bold">✓</span>
            ) : (
              <span className="text-base md:text-lg font-semibold">{i + 1}</span>
            )}
          </motion.div>

          <h3 className="text-xl md:text-3xl font-semibold leading-tight">
            <WordWrap>
              <TextStaggerHover text={f.title || String(f.step)} index={i} />
            </WordWrap>
          </h3>
        </motion.button>
      )
    })}
  </div>

  {/* ----- right image column (same animated slideshow) ----- */}
  <div className={cn("order-1 md:order-2 relative overflow-hidden rounded-lg", imageHeight)}>
    <AnimatePresence mode="popLayout">
      {features.map((f, i) =>
        i === activeSlide ? (
          <motion.div
            key={`img-${i}`}
            className="absolute inset-0"
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -35 }}
            transition={{ duration: 0.45, ease: "easeInOut" }}
          >
            <HoverSliderImage index={i} src={f.image} alt={f.title} />
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </motion.div>
        ) : null
      )}
    </AnimatePresence>
  </div>
</div>

        </div>
      </div>
    </HoverSliderContext.Provider>
  )
}

/* ---------------------------- your contents ---------------------------- */
/* keep the same styling; just swap in your features below.
   Use public paths (e.g., /Images/...) so the images load. */

// const featuresData: Feature[] = [
//   { step: 1, title: "Choose Template",  content: "Select from our professional templates", image: "/Images/choose.jpg" },
//   { step: 2, title: "Customize",        content: "Tailor it to your brand",                image: "/Images/customize.jpg" },
//   { step: 3, title: "Preview",          content: "See exactly how it looks",               image: "/Images/preview.jpg" },
//   { step: 4, title: "Publish",          content: "Go live in one click",                   image: "/Images/publish.jpg" },
// ]

/* ---------------------------- ready-to-use section ---------------------------- */

// export default function HowItWorksSection() {
//   return (
//     <FeatureSteps
//       features={featuresData}
//       title="How It Works"
//       autoPlayInterval={4000}
//       imageHeight="h-[400px]"
//     />
//   )
// }
