"use client"

import { motion } from "framer-motion"

const Sparkle = ({ className = "", ...props }) => {
  return (
    <motion.svg
      width="100%"
      height="100%"
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className}`}
      {...props}
    >
      <motion.path
        d="M80 0L98.7868 61.2132L160 80L98.7868 98.7868L80 160L61.2132 98.7868L0 80L61.2132 61.2132L80 0Z"
        fill="currentColor"
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 45, 0],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      />
    </motion.svg>
  )
}

export default Sparkle
