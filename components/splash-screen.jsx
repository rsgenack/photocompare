"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { scrollToTop } from "@/utils/scroll-utils"
import { ArrowRight } from "lucide-react"

export default function SplashScreen({ onComplete }) {
  const [animationComplete, setAnimationComplete] = useState(false)

  useEffect(() => {
    // Disable scrolling during splash screen
    document.body.style.overflow = "hidden"

    return () => {
      // Re-enable scrolling when component unmounts
      document.body.style.overflow = "auto"
    }
  }, [])

  const handleComplete = () => {
    scrollToTop()
    onComplete()
  }

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.4,
        duration: 0.8,
        ease: [0.04, 0.62, 0.23, 0.98],
      },
    }),
  }

  const lineVariants = {
    hidden: { width: "0%" },
    visible: {
      width: "100%",
      transition: {
        delay: 2,
        duration: 1.5,
        ease: [0.04, 0.62, 0.23, 0.98],
      },
    },
  }

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 3.5,
        duration: 0.8,
        ease: [0.04, 0.62, 0.23, 0.98],
      },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.95,
    },
  }

  const arrowButtonVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 3, // Appears after a few seconds (reduced by 1.5s)
        duration: 0.8,
        ease: [0.04, 0.62, 0.23, 0.98],
      },
    },
    hover: {
      scale: 1.05,
      transition: { duration: 0.3 },
    },
    tap: {
      scale: 0.95,
    },
  }

  const circleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.8 + i * 0.2,
        duration: 0.6,
        type: "spring",
        stiffness: 200,
      },
    }),
  }

  // Add arrow animation keyframes
  useEffect(() => {
    const style = document.createElement("style")
    style.innerHTML = `
    @keyframes arrowMove {
      0% { transform: translateX(0); }
      50% { transform: translateX(30%); }
      100% { transform: translateX(0); }
    }
    .animate-arrow-move {
      animation: arrowMove 1.2s infinite;
    }
    .group:hover .animate-arrow-move {
      animation: none;
    }
  `
    document.head.appendChild(style)
    return () => {
      if (style && document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-[#f8f0ea] flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Decorative circles */}
        <div className="relative h-32 mb-6">
          <motion.div
            className="absolute w-16 h-16 rounded-full bg-cardinal"
            custom={0}
            initial="hidden"
            animate="visible"
            variants={circleVariants}
            style={{ left: "10%", top: "20%" }}
          />
          <motion.div
            className="absolute w-24 h-24 rounded-full bg-selective_yellow"
            custom={1}
            initial="hidden"
            animate="visible"
            variants={circleVariants}
            style={{ left: "30%", top: "40%" }}
          />
          <motion.div
            className="absolute w-20 h-20 rounded-full bg-yellow_green"
            custom={2}
            initial="hidden"
            animate="visible"
            variants={circleVariants}
            style={{ right: "25%", top: "10%" }}
          />
          <motion.div
            className="absolute w-12 h-12 rounded-full bg-tropical_indigo"
            custom={3}
            initial="hidden"
            animate="visible"
            variants={circleVariants}
            style={{ right: "10%", top: "50%" }}
          />
        </div>

        {/* Main headings */}
        <div className="space-y-3 mb-12 relative">
          <motion.div custom={0} initial="hidden" animate="visible" variants={textVariants} className="overflow-hidden">
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tight font-display">DISCOVER</h1>
          </motion.div>

          <motion.div custom={1} initial="hidden" animate="visible" variants={textVariants} className="overflow-hidden">
            <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tight font-display">YOUR BEST</h1>
          </motion.div>

          <motion.div custom={2} initial="hidden" animate="visible" variants={textVariants} className="overflow-hidden">
            <div className="flex flex-wrap items-center">
              <h1 className="text-5xl md:text-8xl lg:text-9xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cardinal via-selective_yellow to-yellow_green font-display">
                PHOTOS
              </h1>

              {/* Button now appears inline after "PHOTOS" */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 3, duration: 0.8 }}
                className="inline-flex items-center ml-4"
              >
                <button
                  onClick={handleComplete}
                  className="flex items-center text-xl font-medium text-black opacity-60 hover:opacity-100 transition-all duration-300 hover:tracking-wider group"
                >
                  GET STARTED
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300 animate-arrow-move" />
                  <span className="absolute bottom-0 left-0 w-0 h-full border-b-[3px] border-double border-selective_yellow group-hover:w-[90%] transition-all duration-300"></span>
                </button>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Description */}
        <motion.p
          custom={3}
          initial="hidden"
          animate="visible"
          variants={textVariants}
          className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-12 font-sans"
        >
          VOTOGRAPHER helps you find your best shots through intuitive, direct comparisons. Sort, rank, and decide with
          confidence.
        </motion.p>

        {/* Animated line */}
        <motion.div initial="hidden" animate="visible" variants={lineVariants} className="h-px bg-black mb-12" />
      </div>
    </div>
  )
}
