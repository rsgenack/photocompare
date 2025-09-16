"use client"

import { scrollToTop } from "@/utils/scroll-utils"
import { Camera, Star, Medal, ArrowRight } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import Sparkle from "./sparkle"

export default function IntroPage({ onGetStarted }) {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimate(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  const handleGetStarted = () => {
    scrollToTop()
    onGetStarted()
  }

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.8,
        ease: [0.04, 0.62, 0.23, 0.98],
      },
    }),
  }

  const sparkleVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: 0.5 + i * 0.1,
        duration: 0.4,
        type: "spring",
        stiffness: 200,
      },
    }),
  }

  return (
    <div className="editorial-container py-12">
      <div className="mb-16">
        <motion.div initial="hidden" animate="visible" className="relative mb-8 w-full max-w-full overflow-visible">
          <h1
            className="text-[clamp(2.5rem,8vw,8rem)] font-black tracking-tight text-center font-display mb-4 px-2 w-full max-w-full break-words overflow-visible"
            style={{
              lineHeight: 1.05,
              wordBreak: "break-word",
              WebkitTextWrap: "balance",
              textWrap: "balance",
              hyphens: "auto",
            }}
          >
            <span
              className="relative inline-block bg-clip-text text-transparent w-full max-w-full break-words"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #d11149, #f17105, #ffba08, #b1cf5f, #90e0f3, #7b89ef)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              VOTOGRAPHER
              {animate && (
                <>
                  <motion.div variants={sparkleVariants} custom={0} className="absolute -top-8 left-[15%]">
                    <Sparkle className="w-8 h-8 text-selective_yellow animate-sparkle-1" />
                  </motion.div>
                  <motion.div variants={sparkleVariants} custom={1} className="absolute -top-12 left-[45%]">
                    <Sparkle className="w-10 h-10 text-pumpkin animate-sparkle-2" />
                  </motion.div>
                  <motion.div variants={sparkleVariants} custom={2} className="absolute -top-6 right-[20%]">
                    <Sparkle className="w-6 h-6 text-cardinal animate-sparkle-3" />
                  </motion.div>
                  <motion.div variants={sparkleVariants} custom={3} className="absolute top-[30%] -left-8">
                    <Sparkle className="w-8 h-8 text-yellow_green animate-sparkle-4" />
                  </motion.div>
                  <motion.div variants={sparkleVariants} custom={4} className="absolute top-[40%] -right-8">
                    <Sparkle className="w-8 h-8 text-tropical_indigo animate-sparkle-2" />
                  </motion.div>
                  <motion.div variants={sparkleVariants} custom={5} className="absolute -bottom-8 left-[25%]">
                    <Sparkle className="w-6 h-6 text-non_photo_blue animate-sparkle-3" />
                  </motion.div>
                  <motion.div variants={sparkleVariants} custom={6} className="absolute -bottom-12 right-[35%]">
                    <Sparkle className="w-10 h-10 text-cardinal animate-sparkle-1" />
                  </motion.div>
                </>
              )}
            </span>
          </h1>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={textVariants}
            custom={1}
            className="border-t-2 border-b-2 border-black py-4 mb-8"
          >
            <h2 className="text-2xl md:text-3xl font-black text-center font-display">
              FIND YOUR BEST PHOTOS, EASILY AND ENJOYABLY
            </h2>
          </motion.div>
        </div>
      </div>

      {/* Features section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-20">
        <motion.div initial="hidden" animate="visible" variants={textVariants} custom={2}>
          <div className="border-2 border-black p-6 h-full bg-white">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-tropical_indigo">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black mb-4 font-display">SIMPLE COMPARISON</h3>
            <p className="text-gray-800 font-sans">Compare photos two at a time for easy decision making</p>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={textVariants} custom={3}>
          <div className="border-2 border-black p-6 h-full bg-white">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-cardinal">
              <Star className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black mb-4 font-display">FUN EXPERIENCE</h3>
            <p className="text-gray-800 font-sans">Enjoy a delightful, interactive way to sort your photos</p>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={textVariants} custom={4}>
          <div className="border-2 border-black p-6 h-full bg-white">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 bg-selective_yellow">
              <Medal className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-black mb-4 font-display">CLEAR RESULTS</h3>
            <p className="text-gray-800 font-sans">Get a ranked list of your photos to make selection easy</p>
          </div>
        </motion.div>
      </div>

      {/* Start button */}
      <motion.div initial="hidden" animate="visible" variants={textVariants} custom={5} className="flex justify-center">
        <button
          onClick={handleGetStarted}
          className="bg-black text-white text-2xl font-bold px-12 py-5 rounded-full hover:scale-105 transition-transform flex items-center font-display"
        >
          START NOW
          <ArrowRight className="ml-2 h-6 w-6" />
        </button>
      </motion.div>
    </div>
  )
}
