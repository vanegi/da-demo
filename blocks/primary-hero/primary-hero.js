/*
 * Primary Hero Block (DA.live)
 * -----------------------------
 * Re-implementation of the Universal Editor "Primary Hero" in DA.live table
 * authoring conventions, with full authoring-field parity to the UE model.
 *
 * Authored rows (in order — must match the model's field selectors):
 *   1.  primaryBackgroundType  (imageSlide | videoSlide)
 *   2.  title                  (richtext)
 *   3.  titleFontSize          (e.g. 60px)
 *   4.  titleFont              (Ringside | Garamond)
 *   5.  description            (richtext)
 *   6.  descriptionFontSize    (e.g. 24px)
 *   7.  size                   (large | medium)
 *   8.  offsetContent          (true | false)
 *   9.  backgroundImage        (picture/img)
 *   10. imageAlt               (text)
 *   11. videoPath              (picture/img asset ref reused for video src)
 *   12. icon                   (picture/img)
 *   13. iconAlt                (text)
 *   14. textcolor              (white | black)
 *   15. ctaNumber              (one | two)
 *   16. ctaStyle               (primary | secondary)
 *   17. ctaLabel               (text)
 *   18. ctaType                (link | asset)
 *   19. ctaLink                (text url)
 *   20. ctaAsset               (picture/img asset ref)
 *   21. ctaAria                (text)
 *   22. targetPath             (sameTab | newTab)
 *   23. exitInterstitial       (select)
 *   24. secCtaStyle
 *   25. secCtaLabel
 *   26. secCtaType
 *   27. secCtaLink
 *   28. secCtaAsset
 *   29. secCtaAria
 *   30. secTargetPath
 *   31. secExitInterstitial
 *
 * Note: exitInterstitial / iconAlt(from-asset) rows carry authoring metadata
 * that is preserved as data attributes rather than rendered, mirroring the UE
 * behaviour where these drive analytics/interstitial handling downstream.
 */

const FIELD_ORDER = [
  'primaryBackgroundType',
  'title',
  'titleFontSize',
  'titleFont',
  'description',
  'descriptionFontSize',
  'size',
  'offsetContent',
  'backgroundImage',
  'imageAlt',
  'videoPath',
  'icon',
  'iconAlt',
  'textcolor',
  'ctaNumber',
  'ctaStyle',
  'ctaLabel',
  'ctaType',
  'ctaLink',
  'ctaAsset',
  'ctaAria',
  'targetPath',
  'exitInterstitial',
  'secCtaStyle',
  'secCtaLabel',
  'secCtaType',
  'secCtaLink',
  'secCtaAsset',
  'secCtaAria',
  'secTargetPath',
  'secExitInterstitial',
];

function firstCell(row) {
  return row?.firstElementChild ?? row;
}

function cellText(row) {
  return firstCell(row)?.textContent?.trim() ?? '';
}

function cellImgSrc(row) {
  return firstCell(row)?.querySelector('img')?.getAttribute('src') ?? '';
}

function cellPicture(row) {
  return firstCell(row)?.querySelector('picture, img') ?? null;
}

function applyFontSize(el, size) {
  if (size) el.style.fontSize = size;
}

/* CTA field-name maps so makeButton can read first/second CTA consistently. */
function ctaFieldMaps() {
  return {
    first: {
      Label: 'ctaLabel',
      Style: 'ctaStyle',
      Type: 'ctaType',
      Link: 'ctaLink',
      Asset: 'ctaAsset',
      Aria: 'ctaAria',
      TargetPath: 'targetPath',
      ExitInterstitial: 'exitInterstitial',
    },
    second: {
      Label: 'secCtaLabel',
      Style: 'secCtaStyle',
      Type: 'secCtaType',
      Link: 'secCtaLink',
      Asset: 'secCtaAsset',
      Aria: 'secCtaAria',
      TargetPath: 'secTargetPath',
      ExitInterstitial: 'secExitInterstitial',
    },
  };
}

function makeButton(fields, map) {
  const label = fields.get(map.Label)?.trim();
  if (!label) return null;

  const style = fields.get(map.Style) || 'primary';
  const type = fields.get(map.Type) || 'link';
  const aria = fields.get(map.Aria)?.trim();
  const target = (fields.get(map.TargetPath) || '').toLowerCase();
  const interstitial = fields.get(map.ExitInterstitial);
  const href = type === 'asset' ? fields.get(map.Asset) : fields.get(map.Link);

  const a = document.createElement('a');
  a.href = href || '#';
  a.textContent = label;
  a.className = style === 'secondary' ? 'cta-button-outline' : 'cta-button-filled';
  if (aria) a.setAttribute('aria-label', aria);
  if (target === 'newtab') {
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
  }
  if (interstitial && interstitial !== 'select') {
    a.dataset.exitInterstitial = interstitial;
  }
  return a;
}

export default function decorate(block) {
  const rows = [...block.children];
  const fields = new Map();

  FIELD_ORDER.forEach((name, i) => {
    const row = rows[i];
    if (name === 'title' || name === 'description') {
      fields.set(name, firstCell(row)?.innerHTML?.trim() ?? '');
    } else if (['backgroundImage', 'videoPath', 'icon', 'ctaAsset', 'secCtaAsset'].includes(name)) {
      fields.set(name, cellImgSrc(row));
      if (name === 'backgroundImage') fields.set('_backgroundImageEl', cellPicture(row));
      if (name === 'icon') fields.set('_iconEl', cellPicture(row));
    } else {
      fields.set(name, cellText(row));
    }
  });

  const isVideo = fields.get('primaryBackgroundType') === 'videoSlide';
  const textColor = (fields.get('textcolor') || 'white').toLowerCase();
  const size = (fields.get('size') || 'large').toLowerCase();
  const offsetContent = fields.get('offsetContent').toLowerCase() === 'true';

  // Scroll container wrapper
  const scrollContainer = document.createElement('div');
  scrollContainer.className = 'scroll-container';

  // Hero surface
  const hero = document.createElement('div');
  hero.classList.add(isVideo ? 'hero-video' : 'hero');
  if (size === 'medium') hero.classList.add('medium');

  // Background layer: video or image
  if (isVideo && fields.get('videoPath')) {
    const video = document.createElement('video');
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.controls = false;
    video.playsInline = true;
    video.setAttribute('aria-hidden', 'true');
    const src = fields.get('videoPath');
    const source = document.createElement('source');
    source.src = src;
    source.type = `video/${src.split('.').pop() || 'mp4'}`;
    video.append(source);
    hero.append(video);
  } else {
    const bg = fields.get('_backgroundImageEl');
    if (bg) {
      bg.classList.add('hero-bg');
      const bgImg = bg.querySelector('img') || bg;
      const alt = fields.get('imageAlt') || fields.get('backgroundImageAlt');
      if (alt && bgImg.tagName === 'IMG') bgImg.alt = alt;
      hero.append(bg);
    }
  }

  // Content container
  const container = document.createElement('div');
  container.classList.add('container', textColor === 'white' ? 'light' : 'dark');

  const content = document.createElement('div');
  content.classList.add('content-inner');
  if (offsetContent) content.classList.add('offset-content');

  // Icon (image background only)
  if (!isVideo) {
    const iconEl = fields.get('_iconEl');
    if (iconEl && fields.get('icon')) {
      iconEl.classList.add('icon');
      const iconImg = iconEl.querySelector('img') || iconEl;
      const iconAlt = fields.get('iconAlt') || fields.get('iconAssetAlt');
      if (iconAlt && iconImg.tagName === 'IMG') iconImg.alt = iconAlt;
      content.append(iconEl);
    }
  }

  // Title
  const titleHtml = fields.get('title');
  if (titleHtml) {
    const title = document.createElement('div');
    title.className = 'title';
    const font = fields.get('titleFont');
    if (font) title.classList.add(font);
    title.innerHTML = titleHtml;
    applyFontSize(title, fields.get('titleFontSize'));
    title.setAttribute('data-block-name', 'primary-hero');
    content.append(title);
  }

  // Description
  const descHtml = fields.get('description');
  if (descHtml) {
    const description = document.createElement('div');
    description.className = 'description';
    description.innerHTML = descHtml;
    applyFontSize(description, fields.get('descriptionFontSize'));
    description.setAttribute('data-block-name', 'primary-hero');
    content.append(description);
  }

  // CTA buttons (image background only, mirroring UE)
  if (!isVideo) {
    const maps = ctaFieldMaps();
    const cta1 = makeButton(fields, maps.first);
    const cta2 = fields.get('ctaNumber') === 'two'
      ? makeButton(fields, maps.second)
      : null;
    if (cta1 || cta2) {
      const btnContainer = document.createElement('div');
      btnContainer.className = 'btn-container';
      if (cta1) btnContainer.append(cta1);
      if (cta2) btnContainer.append(cta2);
      content.append(btnContainer);
    }
  }

  container.append(content);
  hero.append(container);

  // Dimmer for legibility when using light (white) text
  if (textColor === 'white') {
    const dimmer = document.createElement('div');
    dimmer.className = 'dimmer';
    hero.append(dimmer);
  }

  scrollContainer.append(hero);
  block.replaceChildren(scrollContainer);
}