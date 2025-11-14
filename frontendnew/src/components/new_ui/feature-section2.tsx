// Feature-section.tsx
import React, { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

type Feature = {
  step: string
  title?: string
  content: string
  image: string
}

type FeatureStepsProps = {
  features: Feature[]
  className?: string
  title?: string
  autoPlayInterval?: number // milliseconds
  imageHeight?: string // tailwind height class, e.g. "h-[500px]"
}

/** simple className joiner so you don't need "@/lib/utils" */
function cn(...args: Array<string | false | null | undefined>) {
  return args.filter(Boolean).join(" ")
}

export function FeatureSteps({
  features,
  className,
  title = "How to get Started",
  autoPlayInterval = 3000,
  imageHeight = "h-[400px]",
}: FeatureStepsProps) {
  const [currentFeature, setCurrentFeature] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!features || features.length === 0) return

    // amount to increase per tick (tick = 100ms)
    const tick = 100
    const incrementsPerInterval = autoPlayInterval / tick
    const step = 100 / Math.max(1, incrementsPerInterval)

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + step
        if (next >= 100) {
          setCurrentFeature((idx) => (idx + 1) % features.length)
          return 0
        }
        return next
      })
    }, tick)

    return () => clearInterval(timer)
  }, [features.length, autoPlayInterval])

  return (
    <div className={cn("pb-8 pt-2 md:pr-12 md:pl-12 m-8 md:ml-24 md:mr-24", className || "")}>
      <div className="max-w-7xl mx-auto w-full">
        <h2 className="text-3xl md:text-4xl lg:text-5xl  text-[#2D3253] mb-10 text-center">
          {title}
        </h2>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10 text-[#2D3253]">
          {/* Left column: steps */}
          <div className="order-2 md:order-1 space-y-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="flex items-center gap-6 md:gap-8"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: index === currentFeature ? 1 : 0.3 }}
                transition={{ duration: 0.5 }}
              >
                <motion.div
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2",
                    index === currentFeature
                      ? "bg-primary border-primary text-primary-foreground scale-110"
                      : "bg-muted border-muted-foreground"
                  )}
                >
                  {index <= currentFeature ? (
                    <span className="text-lg font-bold">✓</span>
                  ) : (
                    <span className="text-lg font-semibold">{index + 1}</span>
                  )}
                </motion.div>

                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-semibold">
                    {feature.title || feature.step}
                  </h3>
                  <p className="text-sm md:text-lg text-muted-foreground">
                    {feature.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Right column: image + progress overlay */}
          <div
            className={cn(
              "order-1 md:order-2 relative overflow-hidden rounded-lg",
              imageHeight // apply the height class passed by prop
            )}
          >
            {/* progress bar at top */}
            {/* <div className="absolute top-0 left-0 right-0 h-1 bg-muted-foreground/20">
              <div
                className="h-full bg-primary"
                style={{ width: `${progress}%`, transition: "width 100ms linear" }}
                aria-hidden
              />
            </div> */}

            <AnimatePresence mode="wait">
              {features.map(
                (feature, index) =>
                  index === currentFeature && (
                    <motion.div
                      key={index}
                      className="absolute inset-0 rounded-lg overflow-hidden"
                      initial={{ y: 100, opacity: 0, rotateX: -20 }}
                      animate={{ y: 0, opacity: 1, rotateX: 0 }}
                      exit={{ y: -100, opacity: 0, rotateX: 20 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      {/* plain img tag for standard React apps (no next/image) */}
                      <img
                        src={feature.image}
                        alt={feature.step}
                        className="w-full h-full object-cover transition-transform transform"
                        // keep width/height attributes optional for img - use CSS sizing via container
                      />

                      {/* optional gradient overlay */}
                      <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-background via-[rgba(255,255,255,0)] to-transparent pointer-events-none" />
                    </motion.div>
                  )
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
