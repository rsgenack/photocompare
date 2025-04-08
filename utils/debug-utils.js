/**
 * Debug utility for interactive elements
 * Helps identify issues with event handling
 */

// Set to true to enable debug logging
const DEBUG_ENABLED = true

/**
 * Log debug information if debugging is enabled
 * @param {string} component - Component name
 * @param {string} action - Action being performed
 * @param {any} data - Additional data to log
 */
export function debugLog(component, action, data = null) {
  if (!DEBUG_ENABLED) return

  const timestamp = new Date().toISOString().split("T")[1].split(".")[0]
  const message = `[${timestamp}] [${component}] ${action}`

  if (data) {
    console.log(message, data)
  } else {
    console.log(message)
  }
}

/**
 * Add debug event listeners to an element
 * @param {HTMLElement} element - Element to debug
 * @param {string} name - Name for the element in logs
 */
export function debugElement(element, name) {
  if (!DEBUG_ENABLED || !element) return

  const events = ["click", "mousedown", "mouseup", "keydown", "keyup", "focus", "blur"]

  events.forEach((eventType) => {
    element.addEventListener(eventType, (e) => {
      debugLog("Element", `${name} received ${eventType}`, {
        target: e.target,
        currentTarget: e.currentTarget,
        key: e.key,
        code: e.code,
        defaultPrevented: e.defaultPrevented,
      })
    })
  })
}

/**
 * Monitor focus changes to help debug keyboard navigation issues
 */
export function monitorFocus() {
  if (!DEBUG_ENABLED) return

  document.addEventListener("focusin", (e) => {
    debugLog("Focus", "Element focused", {
      element: e.target,
      tagName: e.target.tagName,
      id: e.target.id,
      className: e.target.className,
    })
  })
}
