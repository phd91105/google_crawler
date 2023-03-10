import { Language } from './types';

export const minimalArgs = [
  '--autoplay-policy=user-gesture-required',
  '--disable-background-networking',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-client-side-phishing-detection',
  '--disable-component-update',
  '--disable-default-apps',
  '--disable-dev-shm-usage',
  '--disable-domain-reliability',
  '--disable-extensions',
  '--disable-features=AudioServiceOutOfProcess',
  '--disable-hang-monitor',
  '--disable-ipc-flooding-protection',
  '--disable-notifications',
  '--disable-offer-store-unmasked-wallet-cards',
  '--disable-popup-blocking',
  '--disable-print-preview',
  '--disable-prompt-on-repost',
  '--disable-renderer-backgrounding',
  '--disable-setuid-sandbox',
  '--disable-speech-api',
  '--disable-sync',
  '--disabled-setupid-sandbox',
  '--hide-scrollbars',
  '--ignore-gpu-blacklist',
  '--metrics-recording-only',
  '--mute-audio',
  '--no-default-browser-check',
  '--no-first-run',
  '--no-pings',
  '--no-zygote',
  '--password-store=basic',
  '--use-gl=swiftshader',
  '--use-mock-keychain',
];

export const blockedResourceTypes = [
  'image',
  'stylesheet',
  'media',
  'font',
  'texttrack',
  'object',
  'beacon',
  'csp_report',
  'imageset',
];

export const blockedExtensions = /.(jpg|jpeg|png|gif|css)$/;

export const googleSearchUrl = (language: Language) =>
  `https://www.google.com/search?hl=${language}`;

export const subKeywords = {
  vi: {
    usages: 'tác dụng',
    sideEffects: 'tác dụng phụ',
  },
  en: {
    usages: 'uses of',
    sideEffects: 'side effects of',
  },
};

export const textForElement = {
  vi: {
    name: {
      tag: 'span',
      top: 'bạn muốn tìm',
      content: 'kết quả cho',
    },
    data: {
      tag: 'h2',
      content: 'nổi bật',
    },
  },
  en: {
    name: {
      tag: 'span',
      top: 'you mean',
      content: 'results for',
    },
    data: {
      tag: 'h2',
      content: 'snippet from the web',
    },
  },
};
