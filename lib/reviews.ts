import type { Locale } from './translations'

// Real Google reviews of "Emilia Cheesecake". `original` is the language the
// customer wrote in and that text is word for word ("[…]" marks a cut); the
// other language is a faithful translation, labelled as such on the page.
// Names are shortened to first name + initial. Copied 25.09.2026.
export const GOOGLE_REVIEWS_URL = 'https://search.google.com/local/reviews?placeid=ChIJiybo9XYNkEcRF6bq_sDbEdI'
export const GOOGLE_WRITE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJiybo9XYNkEcRF6bq_sDbEdI'

export type CustomerReview = { name: string; original: Locale; text: Record<Locale, string> }

export const customerReviews: CustomerReview[] = [
  {
    name: 'Silvia G.',
    original: 'en',
    text: {
      en: 'I’ve tried several of their cheesecakes so far, the Classic, Pistachio, and Chocolate, and every single one has been outstanding. The texture is absolutely incredible: creamy and rich, authentic Basque-country style.',
      de: 'Ich habe bisher mehrere ihrer Cheesecakes probiert – den Classic, den Pistachio und den Schokoladen-Cheesecake – und jeder einzelne war hervorragend. Die Konsistenz ist einfach unglaublich: cremig und reichhaltig, ganz im authentischen baskischen Stil.',
    },
  },
  {
    name: 'Norbert G.',
    original: 'de',
    text: {
      de: 'Wir haben den Clasica Cheesecake (Gross, für ca. 8 Personen) hier in Zürich bestellt und alle fanden ihn sehr fein. Er kommt in einer sehr schönen Verpackung und ist somit auch ideal als Gastgeschenk oder für Anlässe geeignet.',
      en: 'We ordered the Clasica cheesecake (large, for about 8 people) here in Zurich and everyone found it delicious. It comes in very beautiful packaging, which makes it ideal as a host gift or for special occasions.',
    },
  },
  {
    name: 'Constanza M.',
    original: 'en',
    text: {
      en: 'I ordered the classic cheesecake because I wanted to treat our team meeting to something sweet and special. The service was impeccable, and the cheesecake… simply delicious.',
      de: 'Ich habe den Classic Cheesecake bestellt, weil ich unser Teammeeting mit etwas Süssem und Besonderem verwöhnen wollte. Der Service war tadellos und der Cheesecake … einfach köstlich.',
    },
  },
  {
    name: 'Michael',
    original: 'de',
    text: {
      de: 'Die Cheesecakes sind absolut top. Ich kann das als Cheesecake Fanatiker bestätigen. […] Wir bestellen wöchentlich. Service ist ebenfalls ausgezeichnet.',
      en: 'The cheesecakes are absolutely top. I can confirm that as a cheesecake fanatic. […] We order every week. The service is excellent too.',
    },
  },
  {
    name: 'Andrea S.',
    original: 'en',
    text: {
      en: 'I had my first order delivered yesterday. The packaging was very classy and the cheesecake was delicious. Very bad news for my diet 🙂',
      de: 'Meine erste Bestellung wurde gestern geliefert. Die Verpackung war sehr edel und der Cheesecake köstlich. Keine gute Nachricht für meine Diät 🙂',
    },
  },
]
