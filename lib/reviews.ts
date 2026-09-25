// Real Google reviews of "Emilia Cheesecake", quoted word for word in the
// language they were written in ("[…]" marks a cut). Names are shortened to
// first name + initial. Copied 25.09.2026; add new ones as they come in.
export const GOOGLE_REVIEWS_URL = 'https://search.google.com/local/reviews?placeid=ChIJiybo9XYNkEcRF6bq_sDbEdI'
export const GOOGLE_WRITE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJiybo9XYNkEcRF6bq_sDbEdI'

export type CustomerReview = { name: string; text: string }

export const customerReviews: CustomerReview[] = [
  {
    name: 'Silvia G.',
    text: 'I’ve tried several of their cheesecakes so far, the Classic, Pistachio, and Chocolate, and every single one has been outstanding. The texture is absolutely incredible: creamy and rich, authentic Basque-country style.',
  },
  {
    name: 'Norbert G.',
    text: 'Wir haben den Clasica Cheesecake (Gross, für ca. 8 Personen) hier in Zürich bestellt und alle fanden ihn sehr fein. Er kommt in einer sehr schönen Verpackung und ist somit auch ideal als Gastgeschenk oder für Anlässe geeignet.',
  },
  {
    name: 'Constanza M.',
    text: 'I ordered the classic cheesecake because I wanted to treat our team meeting to something sweet and special. The service was impeccable, and the cheesecake… simply delicious.',
  },
  {
    name: 'Michael',
    text: 'Die Cheesecakes sind absolut top. Ich kann das als Cheesecake Fanatiker bestätigen. […] Wir bestellen wöchentlich. Service ist ebenfalls ausgezeichnet.',
  },
  {
    name: 'Andrea S.',
    text: 'I had my first order delivered yesterday. The packaging was very classy and the cheesecake was delicious. Very bad news for my diet 🙂',
  },
]
