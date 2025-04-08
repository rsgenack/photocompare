@tailwind
base
@tailwind
components
@tailwind
utilities

@layer
base
{
  :root
  --background
  : 0 0% 100%
    --foreground
    : 240 10% 3.9%

    --card
    : 0 0% 100%
    --card - foreground
    : 240 10% 3.9%

    --popover
    : 0 0% 100%
    --popover - foreground
    : 240 10% 3.9%

    --primary
    : 240 5.9% 10%
    --primary - foreground
    : 0 0% 98%

    --secondary
    : 240 4.8% 95.9%
    --secondary - foreground
    : 240 5.9% 10%

    --muted
    : 240 4.8% 95.9%
    --muted - foreground
    : 240 3.8% 46.1%

    --accent
    : 240 4.8% 95.9%
    --accent - foreground
    : 240 5.9% 10%

    --destructive
    : 0 84.2% 60.2%
    --destructive - foreground
    : 0 0% 98%

    --border
    : 240 5.9% 90%
    --input
    : 240 5.9% 90%
    --ring
    : 240 5.9% 10%

    --radius
    : 0.75rem

  .dark
  --background
  : 240 10% 3.9%
    --foreground
    : 0 0% 98%

    --card
    : 240 10% 3.9%
    --card - foreground
    : 0 0% 98%

    --popover
    : 240 10% 3.9%
    --popover - foreground
    : 0 0% 98%

    --primary
    : 0 0% 98%
    --primary - foreground
    : 240 5.9% 10%

    --secondary
    : 240 3.7% 15.9%
    --secondary - foreground
    : 0 0% 98%

    --muted
    : 240 3.7% 15.9%
    --muted - foreground
    : 240 5% 64.9%

    --accent
    : 240 3.7% 15.9%
    --accent - foreground
    : 0 0% 98%

    --destructive
    : 0 62.8% 30.6%
    --destructive - foreground
    : 0 0% 98%

    --border
    : 240 3.7% 15.9%
    --input
    : 240 3.7% 15.9%
    --ring
    : 240 4.9% 83.9%
}

@layer
base
{
  *
  @apply
  border - border
  body
  @apply
  bg - background
  text - foreground
  font - family
  : "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    background - color
    : #f8f0ea /* Soft beige background inspired by the real estate design */

  h1, h2, h3, h4, h5, h6
  font - family
  : "Fraunces", Georgia, serif
    font - weight
    : 900
    text - transform
    : uppercase
    letter - spacing
    : -0.02em

  .font-display
  font - family
  : "Fraunces", Georgia, serif
    letter - spacing
    : -0.02em

  .font-sans
  font - family
  : "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

  /* Editorial design elements */
  .editorial-container
  @apply
  max-w-7xl
  mx - auto
  px - 4
  md: px - 8

  .editorial-heading
  @apply
  text-5xl
  md: text-7xl
  font - black
  uppercase
  tracking - tight
  leading - none

  .editorial-subheading
  @apply
  text - xl
  md: text-2xl
  font - medium

  .accent-circle
  @apply
  rounded - full
  flex
  items - center
  justify - center
  background - color
  : #f17105
    color: white

  .accent-button
  @apply
  rounded - full
  bg - yellow_green
  text - black
  font - bold
  px - 6
  py - 3
  hover: shadow - lg
  transition - all
  duration - 200

  .editorial-card
  @apply
  bg - white
  rounded - none
  border - 2
  border - black
  p - 6
  md: p - 8

  /* Prevent unwanted selection during drag operations */
  .select-none
  ;-webkit - user - select
  : none
  ;-moz - user - select
  : none
  ;-ms - user - select
  : none
    user - select
    : none

  img
  ;-webkit - user - drag
  : none
  ;-khtml - user - drag
  : none
  ;-moz - user - drag
  : none
  ;-o - user - drag
  : none
    user - drag
    : none

  /* Smooth scroll */
  html
  scroll - behavior
  : smooth

  /* Shimmer effect */
  .shimmer-effect
  position: absolute
  top: 0
  left: 0
  width: 100%;
  height: 100%;
  background: linear -
    gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.8) 50%,
      rgba(255, 255, 255, 0) 100%
    )
  background - size
  : 200% 100%
    animation: shimmer
    4s ease-in-out 1s
    pointer - events
    : none

  @keyframes
  shimmer
  0% {
      background-position: 100% 50%;
  opacity: 0
  10% {
      opacity: 0.5;
}
90% {
      opacity: 0.5;
}
    100%
{
  background - position
  : -100% 50%
  opacity: 0
}
}
}

@layer
utilities
{
  @keyframes
  sparkle - 1
  0%,
    100% {
      transform: scale(0.8) rotate(0deg);
  opacity: 0.5
  50% {
      transform: scale(1.2) rotate(45deg);
  opacity: 1
}
}

@keyframes
sparkle - 2
{
  0%,
    100% {
      transform: scale(1.2) rotate(45deg);
  opacity: 0.5
}
50% {
      transform: scale(0.8) rotate(0deg);
opacity: 1
}
  }

@keyframes
sparkle - 3
{
  0%,
    100% {
      transform: scale(0.9) rotate(-45deg);
  opacity: 0.7
}
50% {
      transform: scale(1.1) rotate(0deg);
opacity: 1
}
  }

@keyframes
sparkle - 4
{
  0%,
    100% {
      transform: scale(1.1) rotate(0deg);
  opacity: 0.7
}
50% {
      transform: scale(0.9) rotate(-45deg);
opacity: 1
}
  }

  .animate-sparkle-1
{
  animation: sparkle - 1
  3s ease-in-out infinite
}

.animate-sparkle-2
{
  animation: sparkle - 2
  3s ease-in-out infinite
  animation - delay
  : 0.5s
}

.animate-sparkle-3
{
  animation: sparkle - 3
  3s ease-in-out infinite
  animation - delay
  : 1s
}

.animate-sparkle-4
{
  animation: sparkle - 4
  3s ease-in-out infinite
  animation - delay
  : 1.5s
}

.fixed-bottom
{
  position: relative
  z - index
  : 10
  box - shadow
  : 0 4px 14px rgba(0, 0, 0, 0.1)
}
}

@media (max-width: 768px)
{
  .editorial-heading
  @apply
  text-4xl
  md: text-6xl
  word - wrap
  :
  break
    ;
  ;-word
  overflow - wrap
  :
  break
    ;
  ;-word
}

/* Gradient text support for all browsers */
.bg-gradient-to-r
{
  background - size
  : 100%
  background - clip
  : text
  ;-webkit - background - clip
  : text
  ;-moz - background - clip
  : text
  ;-webkit - text - fill - color
  : transparent
  ;-moz - text - fill - color
  : transparent
  display: inline - block
  width: 100%
  text - align
  : center
}

/* Page transition animations */
@keyframes
fadeIn
{
  from
  opacity: 0
  transform: translateY(20px)
  to
  opacity: 1
  transform: translateY(0)
}

.page-transition-enter
{
  animation: fadeIn
  0.5s ease forwards
}
