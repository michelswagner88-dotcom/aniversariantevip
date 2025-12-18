/**
 * Trigger haptic feedback on mobile devices
 * @param pattern - Vibration pattern in milliseconds
 */
export const hapticFeedback = (pattern: number | number[] = 10): void => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};
