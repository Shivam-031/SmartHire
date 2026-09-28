/**
 * Helper that writes a scroll progress percentage to a CSS variable.
 * This can be used by components that want to bind the progress bar width
 * directly to a CSS custom property.
 */
export const setScrollProgress = (progress: number) => {
  document.documentElement.style.setProperty('--scroll-progress', `${progress}%`);
};
