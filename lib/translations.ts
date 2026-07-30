export type Locale = 'de' | 'en'

export type Translations = {
  nav: {
    aboutUs: string
    order: string
  }
  hero: {
    eyebrow: string
    cta: string
    trust: string
  }
  cart: {
    title: string
    items: string
    empty: string
    emptyDesc: string
    shop: string
    subtotal: string
    shipping: string
    free: string
    total: string
    checkout: string
    discountActivated: string
    untilDiscount: string
    remaining: (amount: string) => string
    discount: string
    offer: string
    persons: string
  }
  marquee: string
  products: {
    heading: string
    subtitle: string
    pistachio: string
    classic: string
    lotus: string
    schoggi: string
    dulceDeLeche: string
  }
  quality: {
    title1: string
    title2: string
    desc: string
    cta: string
  }
  experience: {
    locationLabel: string
    desc: string
  }
  influencer: {
    eyebrow: string
    eyebrowItalic: string
    heading: string
  }
  gallery: {
    heading: string
    viewOnInstagram: string
    followUs: string
  }
  footer: {
    tagline: string
    colShop: string
    colHelp: string
    colEmilia: string
    colFollow: string
    cheesecakes: string
    contact: string
    shipping: string
    faq: string
    aboutUs: string
    copyright: string
    privacy: string
    terms: string
    imprint: string
  }
  orderHero: {
    eyebrow: string
    title: string
    subtitle: string
  }
  story: {
    title: string
    p1: string
    p2: string
  }
  productInfo: {
    chooseSize: string
    persons810: string
    persons23: string
    addToCart: string
    addToCartLong: string
    guarantee: string
    securePayment: string
    freshness: string
    handcrafted: string
    naturalIngredients: string
    ingredients: string
    allergenNote: string
    notFound: string
    notFoundDesc: string
    previousImage: string
    nextImage: string
  }
  productDescriptions: {
    pistacho: string
    lotus: string
    chocolate: string
    original: string
    cafe: string
  }
  relatedProducts: {
    title: string
    add: string
  }
  checkout: {
    emptyCart: string
    continueShopping: string
    breadcrumbCart: string
    breadcrumbInfo: string
    breadcrumbPayment: string
    contact: string
    signIn: string
    emailPlaceholder: string
    phonePlaceholder: string
    newsletter: string
    deliveryAddress: string
    country: string
    firstNamePlaceholder: string
    lastNamePlaceholder: string
    addressPlaceholder: string
    cityPlaceholder: string
    postalCodePlaceholder: string
    formError: string
    postalCodeError: string
    continueToDelivery: string
    backToAddress: string
    deliveryTitle: string
    deliveryNotice: string
    chooseDateLabel: string
    deliveryDateLabel: string
    selectDatePlaceholder: string
    chooseTimeLabel: string
    deliveryError: string
    continueToPayment: string
    backToDelivery: string
    paymentTitle: string
    orderSummary: string
    qty: string
    discountCodePlaceholder: string
    applyCode: string
    invalidCode: string
    subtotal: string
    shipping: string
    free: string
    total: string
    upsellTitle: string
    upsellAdd: string
    processing: string
    payNow: string
    paymentError: string
    unexpectedError: string
    paymentInitError: string
    paymentFailedNotice: string
    slotUnavailable: string
    persons: string
  }
  paymentSuccess: {
    title: string
    message: string
    pendingTitle: string
    pendingMessage: string
    backHome: string
    questions: string
    contactUs: string
    loading: string
  }
}

export const translations: Record<Locale, Translations> = {
  de: {
    nav: {
      aboutUs: 'Über Uns',
      order: 'Bestellen',
    },
    hero: {
      eyebrow: 'San Sebastian Cheesecake · Zürich',
      cta: 'JETZT BESTELLEN',
      trust: 'Frisch auf Bestellung gebacken · Lieferung in Zürich & Umgebung',
    },
    cart: {
      title: 'Warenkorb',
      items: 'ARTIKEL',
      empty: 'Ihr Warenkorb ist leer',
      emptyDesc: 'Entdecken Sie unsere handgemachten Käsekuchen.',
      shop: 'Einkaufen',
      subtotal: 'Zwischensumme',
      shipping: 'Versand',
      free: 'Gratis',
      total: 'Gesamt',
      checkout: 'Zur Kasse',
      discountActivated: '10% Rabatt aktiviert',
      untilDiscount: 'Bis 10% Rabatt',
      remaining: (amount) => `Noch ${amount} CHF`,
      discount: 'Rabatt (10%)',
      offer: 'ANGEBOT',
      persons: 'Personen',
    },
    marquee: '10% RABATT AB 100 CHF • GRATIS VERSAND',
    products: {
      heading: 'UNSERE',
      subtitle: 'Fünf Sorten, alle frisch auf Bestellung gebacken.',
      pistachio: 'Mit reiner Pistazienpaste aus Sizilien. Kein Farbstoff, kein künstliches Aroma.',
      classic: 'Unser klassisches Originalrezept, cremig und zart. Der authentische traditionelle Geschmack...',
      lotus: 'Käsekuchen mit Lotus Biscoff Keksen, unwiderstehlicher gewürzter Karamellgeschmack...',
      schoggi: 'Intensiver Käsekuchen mit Schweizer Schokolade, für echte Kakaoliebhaber...',
      dulceDeLeche: 'Verführerischer Käsekuchen mit cremigem Dulce de Leche und zartem Karamell...',
    },
    quality: {
      title1: 'DEIN',
      title2: 'WIE ER SEIN SOLL',
      desc: 'Überrasche deine Freunde, Familie oder Kollegen mit unseren frisch gebackenen Käsekuchen. Ab 100 CHF bekommst du 10% Rabatt und Gratisversand!',
      cta: 'JETZT BESTELLEN',
    },
    experience: {
      locationLabel: 'AUS ZÜRICH',
      desc: 'Der erste San Sebastian Cheesecake in Zürich — handgemacht mit den besten Zutaten, frisch auf Bestellung.',
    },
    influencer: {
      eyebrow: 'Was andere',
      eyebrowItalic: 'sagen',
      heading: 'GESEHEN AUF',
    },
    gallery: {
      heading: 'Unsere',
      viewOnInstagram: 'Auf Instagram ansehen',
      followUs: 'Folge uns auf Instagram',
    },
    footer: {
      tagline: 'Authentische baskische Käsekuchen, handgefertigt in Zürich',
      colShop: 'SHOP',
      colHelp: 'HILFE',
      colEmilia: 'EMILIA',
      colFollow: 'FOLGE UNS',
      cheesecakes: 'Käsekuchen',
      contact: 'Kontakt',
      shipping: 'Versand',
      faq: 'FAQ',
      aboutUs: 'Über uns',
      copyright: '© 2026 Emilia. Alle Käsekuchen mit Liebe gemacht.',
      privacy: 'Datenschutz',
      terms: 'AGB',
      imprint: 'Impressum',
    },
    orderHero: {
      eyebrow: 'Unser Sortiment',
      title: 'UNSERE\nCHEESECAKES',
      subtitle: 'Jede Kreation ist ein Kunstwerk – handgefertigt mit Liebe und den feinsten Zutaten.',
    },
    story: {
      title: 'Die Geschichte von\nEMILIA',
      p1: 'Als Erwachsene führte mich diese Leidenschaft dazu, zu studieren, zu lesen und nach <span class="font-medium text-[#651A1A]">Spanien</span> zu reisen, um die bekanntesten Basque Cheesecakes zu probieren — in <span class="font-medium text-[#651A1A]">Madrid</span>, <span class="font-medium text-[#651A1A]">San Sebastián</span> und <span class="font-medium text-[#651A1A]">Bilbao</span> — und jedes Detail des perfekten Rezepts zu verstehen.',
      p2: 'So entstand Emilia, hier in Zürich. Ein Cheesecake aus Zutaten, die zählen: spanischer Käse mit Herkunft, Pistazien aus Gaziantep (die besten der Welt), Schweizer Schokolade und Eier von einem Hof in Dietikon — meinem Zuhause. Immer auf der Suche nach dem Cheesecake, den ich selbst gerne bekommen würde. 🧡',
    },
    productInfo: {
      chooseSize: 'Größe wählen',
      persons810: '8–10 Pers.',
      persons23: '2–3 Pers.',
      addToCart: 'IN DEN WARENKORB',
      addToCartLong: 'IN DEN WARENKORB LEGEN',
      guarantee: '100% Zufriedenheitsgarantie',
      securePayment: 'Sichere Bezahlung',
      freshness: 'Frischegarantie & Kühlversand',
      handcrafted: 'Handwerklich mit Liebe gemacht',
      naturalIngredients: 'Nur natürliche Zutaten',
      ingredients: 'Zutaten & Allergene',
      allergenNote: 'Allergene sind fett gedruckt.',
      notFound: 'Produkt nicht gefunden',
      notFoundDesc: 'Das gesuchte Produkt existiert leider nicht.',
      previousImage: 'Vorheriges Bild',
      nextImage: 'Nächstes Bild',
    },
    productDescriptions: {
      pistacho: 'Wir verwenden reine Pistazienpaste aus Sizilien, sonst nichts. Kein Farbstoff, kein künstliches Aroma. Unser meistverkaufter Kuchen.',
      lotus: 'Die süßeste aus der Kollektion. Karamell, sanfte Gewürze und eine umhüllende Creme, die jeden Bissen in puren Komfort verwandelt.',
      chocolate: 'Cremige Schweizer Schokolade mit einem tiefen Geschmack, der umhüllt, ohne zu überwältigen. Eine perfekte Balance zwischen Intensität und Sanftheit.',
      original: 'Das Rezept, mit dem alles begann. Cremig, seidig und im baskischen Stil gebacken. Pure Emilia-Essenz: einfach, perfekt, unvergesslich.',
      cafe: 'Cremiges Dulce de Leche mit zartem Karamell und einer verführerischen Süße. Eine lateinamerikanische Köstlichkeit, die jeden Bissen zu einem unvergesslichen Erlebnis macht.',
    },
    relatedProducts: {
      title: 'PASST PERFEKT DAZU',
      add: 'DAZU',
    },
    checkout: {
      emptyCart: 'Ihr Warenkorb ist leer',
      continueShopping: 'Weiter einkaufen',
      breadcrumbCart: 'Warenkorb',
      breadcrumbInfo: 'Informationen',
      breadcrumbPayment: 'Zahlung',
      contact: 'Kontakt',
      signIn: 'Anmelden',
      emailPlaceholder: 'E-Mail',
      phonePlaceholder: 'Handynummer (z.B. +41 79 123 45 67)',
      newsletter: 'Senden Sie mir Neuigkeiten und Angebote per E-Mail',
      deliveryAddress: 'Lieferadresse',
      country: 'Schweiz',
      firstNamePlaceholder: 'Vorname',
      lastNamePlaceholder: 'Nachname',
      addressPlaceholder: 'Adresse',
      cityPlaceholder: 'Stadt',
      postalCodePlaceholder: 'Postleitzahl',
      formError: 'Bitte füllen Sie alle Pflichtfelder aus (rot markiert).',
      postalCodeError: 'Leider liefern wir nur im Umkreis von 10km um Zürich Zentrum. Ihre Postleitzahl liegt ausserhalb unseres Liefergebiets.',
      continueToDelivery: 'Weiter zur Lieferzeit',
      backToAddress: 'Zurück zur Adresse',
      deliveryTitle: 'Lieferung',
      deliveryNotice: 'Bestellungen benötigen mindestens 36 Stunden Vorlaufzeit. Alle Käsekuchen werden frisch für Sie gebacken.',
      chooseDateLabel: 'Lieferdatum wählen',
      deliveryDateLabel: 'Lieferdatum',
      selectDatePlaceholder: 'Bitte wählen Sie ein Datum',
      chooseTimeLabel: 'Gewünschte Lieferzeit',
      deliveryError: 'Bitte wählen Sie Lieferdatum und -zeit.',
      continueToPayment: 'Weiter zur Zahlung',
      backToDelivery: 'Zurück zur Lieferzeit',
      paymentTitle: 'Zahlung',
      orderSummary: 'Bestellübersicht',
      qty: 'Menge:',
      discountCodePlaceholder: 'Rabattcode oder Geschenkkarte',
      applyCode: 'Anwenden',
      invalidCode: 'Rabattcode ungültig',
      subtotal: 'Zwischensumme',
      shipping: 'Versand',
      free: 'Gratis',
      total: 'Gesamt',
      upsellTitle: 'Zeitlich begrenztes Angebot! Füge mehr hinzu und spare',
      upsellAdd: 'Hinzufügen',
      processing: 'Wird verarbeitet...',
      payNow: 'Jetzt bezahlen',
      paymentError: 'Bei der Zahlungsabwicklung ist ein Fehler aufgetreten',
      unexpectedError: 'Ein unerwarteter Fehler ist aufgetreten',
      paymentInitError: 'Fehler beim Starten der Zahlung. Bitte versuchen Sie es erneut.',
      paymentFailedNotice: 'Die Zahlung wurde nicht abgeschlossen. Keine Sorge – Ihre Angaben sind gespeichert. Bitte versuchen Sie es erneut.',
      slotUnavailable: 'Für dieses Datum nicht verfügbar',
      persons: 'Personen',
    },
    paymentSuccess: {
      title: 'Vielen Dank',
      message: 'Wir haben Ihre Bestellung erhalten und bereiten alles mit größter Sorgfalt in unserer Backstube vor.',
      pendingTitle: 'Zahlung wird bestätigt',
      pendingMessage: 'Ihre Zahlung wird gerade verarbeitet. Das dauert in der Regel nur einen Moment – diese Seite aktualisiert sich automatisch.',
      backHome: 'Zurück zur Startseite',
      questions: 'Fragen?',
      contactUs: 'Kontaktieren Sie uns',
      loading: 'Laden...',
    },
  },
  en: {
    nav: {
      aboutUs: 'About Us',
      order: 'Order',
    },
    hero: {
      eyebrow: 'San Sebastian Cheesecake · Zurich',
      cta: 'ORDER NOW',
      trust: 'Freshly baked to order · Delivery in Zurich & surroundings',
    },
    cart: {
      title: 'Cart',
      items: 'ITEM(S)',
      empty: 'Your cart is empty',
      emptyDesc: 'Discover our handmade cheesecakes.',
      shop: 'Shop',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      free: 'Free',
      total: 'Total',
      checkout: 'Checkout',
      discountActivated: '10% discount activated',
      untilDiscount: 'Up to 10% discount',
      remaining: (amount) => `${amount} CHF remaining`,
      discount: 'Discount (10%)',
      offer: 'OFFER',
      persons: 'persons',
    },
    marquee: '10% DISCOUNT FROM CHF 100 • FREE DELIVERY',
    products: {
      heading: 'OUR',
      subtitle: 'Five varieties, all freshly baked to order.',
      pistachio: 'Made with pure Sicilian pistachio paste. No colouring, no artificial flavouring.',
      classic: 'Our classic original recipe, creamy and delicate. The authentic traditional taste...',
      lotus: 'Cheesecake with Lotus Biscoff cookies, irresistible spiced caramel flavour...',
      schoggi: 'Intense cheesecake with Swiss chocolate, for true cocoa lovers...',
      dulceDeLeche: 'Indulgent cheesecake with creamy Dulce de Leche and delicate caramel...',
    },
    quality: {
      title1: 'YOUR',
      title2: 'AS IT SHOULD BE',
      desc: 'Surprise your friends, family or colleagues with our freshly baked cheesecakes. From CHF 100 you get 10% discount and free shipping!',
      cta: 'ORDER NOW',
    },
    experience: {
      locationLabel: 'FROM ZURICH',
      desc: 'The first San Sebastian Cheesecake in Zurich — handmade with the finest ingredients, freshly baked to order.',
    },
    influencer: {
      eyebrow: 'What others',
      eyebrowItalic: 'say',
      heading: 'SEEN ON',
    },
    gallery: {
      heading: 'Our',
      viewOnInstagram: 'View on Instagram',
      followUs: 'Follow us on Instagram',
    },
    footer: {
      tagline: 'Authentic Basque cheesecakes, handcrafted in Zurich',
      colShop: 'SHOP',
      colHelp: 'HELP',
      colEmilia: 'EMILIA',
      colFollow: 'FOLLOW US',
      cheesecakes: 'Cheesecakes',
      contact: 'Contact',
      shipping: 'Shipping',
      faq: 'FAQ',
      aboutUs: 'About us',
      copyright: '© 2026 Emilia. All cheesecakes made with love.',
      privacy: 'Privacy Policy',
      terms: 'Terms',
      imprint: 'Legal Notice',
    },
    orderHero: {
      eyebrow: 'Our Range',
      title: 'OUR\nCHEESECAKES',
      subtitle: 'Every creation is a work of art – handcrafted with love and the finest ingredients.',
    },
    story: {
      title: 'The Story of\nEMILIA',
      p1: 'As an adult, this passion led me to study, read and travel to <span class="font-medium text-[#651A1A]">Spain</span> to try the most famous Basque Cheesecakes — in <span class="font-medium text-[#651A1A]">Madrid</span>, <span class="font-medium text-[#651A1A]">San Sebastián</span> and <span class="font-medium text-[#651A1A]">Bilbao</span> — and understand every detail of the perfect recipe.',
      p2: 'That is how Emilia was born, here in Zurich. A cheesecake made from ingredients that matter: Spanish cheese with provenance, pistachios from Gaziantep (the best in the world), Swiss chocolate and eggs from a farm in Dietikon — my home. Always searching for the cheesecake I would love to receive myself. 🧡',
    },
    productInfo: {
      chooseSize: 'Choose size',
      persons810: '8–10 pers.',
      persons23: '2–3 pers.',
      addToCart: 'ADD TO CART',
      addToCartLong: 'ADD TO CART',
      guarantee: '100% Satisfaction Guarantee',
      securePayment: 'Secure Payment',
      freshness: 'Freshness guarantee & refrigerated shipping',
      handcrafted: 'Handcrafted with love',
      naturalIngredients: 'Only natural ingredients',
      ingredients: 'Ingredients & Allergens',
      allergenNote: 'Allergens are in bold.',
      notFound: 'Product not found',
      notFoundDesc: "The product you're looking for doesn't exist.",
      previousImage: 'Previous image',
      nextImage: 'Next image',
    },
    productDescriptions: {
      pistacho: 'We use pure pistachio paste from Sicily, nothing else. No colouring, no artificial flavouring. Our best seller.',
      lotus: 'The sweetest of the collection. Caramel, gentle spices and an enveloping cream that turns every bite into pure comfort.',
      chocolate: 'Creamy Swiss chocolate with a deep flavour that envelops without overwhelming. A perfect balance between intensity and softness.',
      original: 'The recipe that started it all. Creamy, silky and baked in the Basque style. Pure Emilia essence: simple, perfect, unforgettable.',
      cafe: 'Creamy Dulce de Leche with delicate caramel and an irresistible sweetness. A Latin American delight that makes every bite an unforgettable experience.',
    },
    relatedProducts: {
      title: 'PAIRS PERFECTLY WITH',
      add: 'ADD',
    },
    checkout: {
      emptyCart: 'Your cart is empty',
      continueShopping: 'Continue shopping',
      breadcrumbCart: 'Cart',
      breadcrumbInfo: 'Information',
      breadcrumbPayment: 'Payment',
      contact: 'Contact',
      signIn: 'Sign in',
      emailPlaceholder: 'Email',
      phonePlaceholder: 'Phone number (e.g. +41 79 123 45 67)',
      newsletter: 'Send me news and offers by email',
      deliveryAddress: 'Delivery Address',
      country: 'Switzerland',
      firstNamePlaceholder: 'First name',
      lastNamePlaceholder: 'Last name',
      addressPlaceholder: 'Address',
      cityPlaceholder: 'City',
      postalCodePlaceholder: 'Postal code',
      formError: 'Please fill in all required fields (highlighted in red).',
      postalCodeError: 'Unfortunately we only deliver within 10km of Zurich city centre. Your postal code is outside our delivery area.',
      continueToDelivery: 'Continue to Delivery',
      backToAddress: 'Back to address',
      deliveryTitle: 'Delivery',
      deliveryNotice: 'Orders require at least 36 hours\' notice. All cheesecakes are freshly baked for you.',
      chooseDateLabel: 'Choose delivery date',
      deliveryDateLabel: 'Delivery date',
      selectDatePlaceholder: 'Please select a date',
      chooseTimeLabel: 'Preferred delivery time',
      deliveryError: 'Please select a delivery date and time.',
      continueToPayment: 'Continue to Payment',
      backToDelivery: 'Back to delivery',
      paymentTitle: 'Payment',
      orderSummary: 'Order Summary',
      qty: 'Qty:',
      discountCodePlaceholder: 'Discount code or gift card',
      applyCode: 'Apply',
      invalidCode: 'Invalid discount code',
      subtotal: 'Subtotal',
      shipping: 'Shipping',
      free: 'Free',
      total: 'Total',
      upsellTitle: 'Limited time offer! Add more and save',
      upsellAdd: 'Add',
      processing: 'Processing...',
      payNow: 'Pay now',
      paymentError: 'An error occurred during payment processing',
      unexpectedError: 'An unexpected error occurred',
      paymentInitError: 'Error starting payment. Please try again.',
      paymentFailedNotice: 'Your payment was not completed. Don\'t worry – your details are saved. Please try again.',
      slotUnavailable: 'Not available for this date',
      persons: 'persons',
    },
    paymentSuccess: {
      title: 'Thank You',
      message: 'We have received your order and are preparing everything with the greatest care in our bakery.',
      pendingTitle: 'Confirming your payment',
      pendingMessage: 'Your payment is being processed. This usually only takes a moment – this page will update automatically.',
      backHome: 'Back to Home',
      questions: 'Questions?',
      contactUs: 'Contact us',
      loading: 'Loading...',
    },
  },
}
