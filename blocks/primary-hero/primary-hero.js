import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Primary Hero Block
 * ------------------
 * A full-bleed hero with a background image, a left-aligned heading,
 * description and a call-to-action button over a dark gradient dimmer.
 * Design reference: lilly.com/conditions/alzheimers-disease.
 *
 * Authored structure (single row, two cells):
 *   cell 1: background image (picture/img)
 *   cell 2: text content (heading, description, CTA link)
 */

export default function decorate(block) {
  const row = block.firstElementChild;
  const cells = row ? [...row.children] : [];
  const [imageCell, textCell] = cells;

  block.textContent = '';

  const inner = document.createElement('div');
  inner.className = 'primary-hero-inner';

  // Background image layer (optimized picture)
  const img = imageCell?.querySelector('img');
  if (img) {
    const bg = document.createElement('div');
    bg.className = 'primary-hero-bg';
    const picture = createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]);
    bg.append(picture);
    inner.append(bg);
  }

  // Dimmer for text legibility
  const dimmer = document.createElement('div');
  dimmer.className = 'primary-hero-dimmer';
  inner.append(dimmer);

  // Content
  const content = document.createElement('div');
  content.className = 'primary-hero-content';
  if (textCell) {
    while (textCell.firstChild) content.append(textCell.firstChild);
  }

  // Style the last link (if any) as a CTA button
  const links = content.querySelectorAll('a');
  const cta = links[links.length - 1];
  if (cta) cta.classList.add('primary-hero-cta');

  inner.append(content);
  block.append(inner);
}
