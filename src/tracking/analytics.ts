interface GA {
  (...args: string[]): void;
  q?: string[];
  l?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare interface Window {
  GoogleAnalyticsObject: string;
  ga: GA;
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
  window.GoogleAnalyticsObject = 'ga';
  window.ga =
    window.ga ||
    function ga(...args) {
      (window.ga.q = window.ga.q || []).push(...args);
    };
  window.ga.l = 1 * Date.now();

  loadScript('https://www.google-analytics.com/analytics.js');

  window.ga('create', 'UA-73887811-5', 'auto');
  window.ga('send', 'pageview');
} else {
  // eslint-disable-next-line no-console
  window.ga = console.log;
}
