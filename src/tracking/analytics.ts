interface GTag {
  (...args: any[]): void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare interface Window {
  dataLayer: any[];
  gtag: GTag;
}

const loadScript = (src: string) => {
  const script = document.createElement('script');
  const firstScript = document.getElementsByTagName('script')[0];
  script.async = true;
  script.src = src;
  firstScript.parentNode!.insertBefore(script, firstScript);
};

if (process.env.NODE_ENV === 'production') {
  // breaks down the snippet given by google analytics
  loadScript('https://www.googletagmanager.com/gtag/js?id=UA-73887811-5');

  window.dataLayer = window.dataLayer || [];
  window.gtag = (...args) => {
    window.dataLayer.push(...args);
  };

  window.gtag('js', new Date());

  window.gtag('config', 'UA-73887811-5');
} else {
  // eslint-disable-next-line no-console
  window.gtag = console.log;
}
