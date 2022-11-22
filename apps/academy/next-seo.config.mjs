// @ts-check
/** @type {import('next-seo').DefaultSeoProps} */
export default {
  titleTemplate: '%s | Sushi',
  title: 'Academy',
  defaultTitle: 'Academy',
  description: 'Demystifying DeFi, everything you need to know in one place.',
  //   canonical: 'https://www.sushi.com/academy',
  //   mobileAlternate: {
  //     media: '',
  //     href: '',
  //   },
  //   languageAlternates: [{ hrefLang: "en", href: "https://www.sushi.com/academy" }],
  twitter: {
    handle: '@sushiswap',
    site: '@sushiswap',
    cardType: 'summary_large_image',
  },
  openGraph: {
    url: 'https://www.sushi.com/academy',
    type: 'website',
    title: 'Academy',
    description: 'Demystifying DeFi, everything you need to know in one place.',
    images: [
      {
        url: 'https://www.sushi.com/earn/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Academy',
      },
    ],
    // videos: [],
    // locale: 'en_IE',
    site_name: 'Sushi',
  },
}
