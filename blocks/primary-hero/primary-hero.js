import { createOptimizedPicture } from '../../scripts/aem.js';

/*
 * Primary Hero Block
 * ------------------
 * A full-bleed hero with a background image, a left-aligned heading,
 * description and a call-to-action button over a dark gradient dimmer.
 * Design reference: lilly.com/conditions/alzheimers-disease.
 *
 * The block is tolerant of how it is authored. The first image found becomes
 * the background; everything else (heading, paragraphs, links) becomes the
 * overlaid text content — whether the author put the image and text in
 * separate cells or stacked them in a single cell.
 */

export default function decorate(block) {
  // Pull the first image out to use as the background layer.
  const img = block.querySelector('img');
  const picture = img?.closest('picture');

  const inner = document.createElement('div');
  inner.className = 'primary-hero-inner';

  if (img) {
    const bg = document.createElement('div');
    bg.className = 'primary-hero-bg';
    bg.append(createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]));
    inner.append(bg);
    // Remove the original picture (and any now-empty wrapper paragraph).
    const wrapper = picture?.closest('p');
    picture?.remove();
    if (wrapper && wrapper.textContent.trim() === '' && !wrapper.querySelector('img, picture')) {
      wrapper.remove();
    }
  }

  // Dimmer for text legibility.
  const dimmer = document.createElement('div');
  dimmer.className = 'primary-hero-dimmer';
  inner.append(dimmer);

  // Everything that survives becomes the overlaid content.
  const content = document.createElement('div');
  content.className = 'primary-hero-content';
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    while (cell.firstChild) content.append(cell.firstChild);
  });

  // Style the last link (if any) as a CTA button.
  const links = content.querySelectorAll('a');
  const cta = links[links.length - 1];
  if (cta) cta.classList.add('primary-hero-cta');

  block.textContent = '';
  inner.append(content);
  block.append(inner);
}
