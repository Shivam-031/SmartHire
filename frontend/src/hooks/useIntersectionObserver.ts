import { useEffect } from 'react';

/**
 * Observes the visibility of the given section IDs and toggles an `active`
 * class on matching navigation links. The `navLinkSelector` should target the
 * anchor elements that correspond to the sections (e.g. ".nav-link").
 */
export const useSectionObserver = (
  sectionIds: string[],
  navLinkSelector: string
) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const id = entry.target.id;
          const link = document.querySelector(`${navLinkSelector}[href*="#${id}"]`);
          if (!link) return;
          if (entry.intersectionRatio >= 0.5) {
            link.classList.add('active');
          } else {
            link.classList.remove('active');
          }
        });
      },
      { threshold: [0.5] }
    );
    sectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [sectionIds, navLinkSelector]);
};
