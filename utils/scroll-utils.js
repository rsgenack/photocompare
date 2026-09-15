/**
 * Scrolls the window to the top with a smooth animation
 */
export function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  })
}
