export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable';
}

export interface ManifestShortcut {
  name: string;
  short_name: string;
  url: string;
  icons: ManifestIcon[];
}

export interface ManifestScreenshot {
  src: string;
  sizes: string;
  type: 'image/png';
  form_factor: 'narrow' | 'wide';
  label: string;
}

export interface AppManifest {
  name: string;
  short_name: string;
  id: string;
  description: string;
  lang: string;
  categories: string[];
  scope: string;
  start_url: string;
  display: 'standalone';
  theme_color: string;
  background_color: string;
  icons: ManifestIcon[];
  shortcuts: ManifestShortcut[];
  screenshots: ManifestScreenshot[];
}

const shortcutIcon: ManifestIcon[] = [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }];

export const manifest: AppManifest = {
  name: 'SNA Exam Guide',
  short_name: 'SNA Exam',
  id: '/',
  description: 'Practical exam companion for System & Network Administration',
  lang: 'en',
  categories: ['education'],
  scope: '/',
  start_url: '/',
  display: 'standalone',
  theme_color: '#f2eee3',
  background_color: '#f2eee3',
  icons: [
    { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
  shortcuts: [
    { name: 'Rehearse commands', short_name: 'Terminal', url: '/#terminal', icons: shortcutIcon },
    { name: 'Week 5-7 labs', short_name: 'Labs', url: '/#labs', icons: shortcutIcon },
    { name: 'Exam day walkthrough', short_name: 'Exam day', url: '/#day', icons: shortcutIcon },
  ],
  screenshots: [
    {
      src: '/screenshots/narrow-labs.png',
      sizes: '390x844',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'The seven lab guides on a phone',
    },
    {
      src: '/screenshots/narrow-terminal.png',
      sizes: '390x844',
      type: 'image/png',
      form_factor: 'narrow',
      label: 'Rehearsing exam commands on a phone',
    },
    {
      src: '/screenshots/wide-labs.png',
      sizes: '1280x800',
      type: 'image/png',
      form_factor: 'wide',
      label: 'The lab guides on a desktop',
    },
  ],
};
