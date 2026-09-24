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
    fromPrice: (price: string) => string
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
    remove: string
    decrease: string
    increase: string
  }
  delivery: {
    earliest: string
    tomorrow: string
  }
  consent: {
    text: string
    accept: string
    decline: string
    learnMore: string
    settings: string
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
    hippo: string
    limited: string
    monthlySpecial: string
  }
  quality: {
    title1: string
    title2: string
    desc: string
    cta: string
  }
  forYou: {
    eyebrow: string
    included: string
    title1: string
    titleSerif: string
    desc: string
    cta: string
    ctaNote: string
    flowLabel: string
    flowStep1: string
    flowStep2: string
    flowStep3: string
    flowNote: string
    previewImageAlt: string
    hint: string
  }
  forYouPages: {
    landingEyebrow: string
    landingTitle1: string
    landingTitle2: string
    landingDesc: string
    codePlaceholder: string
    codeMissing: string
    openMessage: string
    messageForYou: string
    downloadFile: string
    photoAlt: string
    defaultEyebrow: string
    defaultTitle: string
    defaultText: string
    defaultNote: string
    notFoundTitle: string
    notFoundText: string
    enterCode: string
    ctaTitle: string
    ctaButton: string
    handcrafted: string
    loading: string
    notAuthorizedTitle: string
    notAuthorizedText: string
    viewMessage: string
    trouble: string
    lockedTitle: string
    lockedText: string
    lockedTextEnd: string
    editorTitle1: string
    editorTitle2: string
    editorDesc: string
    editableUntil: (date: string) => string
    draftRestored: string
    messageLabel: string
    messagePlaceholder: string
    addVideo: string
    videoLimit: string
    videoAdded: string
    uploadingVideo: (percent: number) => string
    addFile: string
    fileLimit: string
    fileAdded: string
    uploadingFile: (percent: number) => string
    remove: string
    videoTooLarge: string
    videoFailed: string
    fileTooLarge: string
    fileFailed: string
    nothingToSave: string
    saveFailed: string
    save: string
    saveChanges: string
    saving: string
    uploadingShort: string
    savedEyebrow: string
    savedTitle1: string
    savedTitle2: string
    savedText: string
    savedEditHint: (date: string) => string
    preview: string
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
    hippo: string
  }
  relatedProducts: {
    title: string
    add: string
    addAria: (name: string) => string
  }
  checkout: {
    emptyCart: string
    continueShopping: string
    breadcrumbCart: string
    breadcrumbDetails: string
    breadcrumbPayment: string
    contact: string
    contactGift: string
    signIn: string
    emailPlaceholder: string
    phonePlaceholder: string
    newsletter: string
    deliveryAddress: string
    deliveryAddressGift: string
    country: string
    firstNamePlaceholder: string
    lastNamePlaceholder: string
    addressPlaceholder: string
    cityPlaceholder: string
    postalCodePlaceholder: string
    formError: string
    postalCodeError: string
    deliveryTitle: string
    deliveryQuestion: string
    deliveryNotice: string
    chooseDateLabel: string
    moreDates: string
    chooseTimeLabel: string
    deliveryError: string
    continueToDetails: string
    continueToPayment: string
    backToDetails: string
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
    slotExpired: string
    dateUnavailable: string
    orderChanged: string
    change: string
    persons: string
  }
  paymentSuccess: {
    title: string
    message: string
    pendingTitle: string
    pendingMessage: string
    slowTitle: string
    slowMessage: string
    checkAgain: string
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
      fromPrice: (price) => `ab ${price} CHF`,
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
      remove: 'Entfernen',
      decrease: 'Menge verringern',
      increase: 'Menge erhöhen',
    },
    delivery: {
      earliest: 'Früheste Lieferung',
      tomorrow: 'morgen',
    },
    consent: {
      text: 'Wir verwenden Cookies für Statistik und Werbung (Microsoft Clarity, Google, Meta), um unsere Seite zu verbessern.',
      accept: 'Akzeptieren',
      decline: 'Ablehnen',
      learnMore: 'Mehr erfahren',
      settings: 'Cookie-Einstellungen',
    },
    marquee: '10% RABATT AB 100 CHF • GRATIS VERSAND',
    products: {
      heading: 'UNSERE',
      subtitle: 'Sechs Sorten, alle frisch auf Bestellung gebacken.',
      pistachio: 'Mit reiner Pistazienpaste aus Sizilien. Kein Farbstoff, kein künstliches Aroma.',
      classic: 'Unser klassisches Originalrezept, cremig und zart. Der authentische traditionelle Geschmack...',
      lotus: 'Käsekuchen mit Lotus Biscoff Keksen, unwiderstehlicher gewürzter Karamellgeschmack...',
      schoggi: 'Intensiver Käsekuchen mit Schweizer Schokolade, für echte Kakaoliebhaber...',
      dulceDeLeche: 'Verführerischer Käsekuchen mit cremigem Dulce de Leche und zartem Karamell...',
      hippo: 'Cremige Haselnuss-Kakao-Creme auf seidigem Käsekuchen. Limitierte Edition...',
      limited: 'Limitierte Edition',
      monthlySpecial: 'Torte des Monats',
    },
    quality: {
      title1: 'DEIN',
      title2: 'WIE ER SEIN SOLL',
      desc: 'Überrasche deine Freunde, Familie oder Kollegen mit unseren frisch gebackenen Käsekuchen. Ab 100 CHF bekommst du 10% Rabatt und Gratisversand!',
      cta: 'JETZT BESTELLEN',
    },
    forYou: {
      eyebrow: 'Neu · Emilia For You',
      included: 'Personalisierung inklusive',
      title1: 'Der Lieblingskuchen.',
      titleSerif: 'Deine persönliche Botschaft.',
      desc: 'Zum Geburtstag oder einfach als Dankeschön: Mach dein Geschenk persönlich. Ergänze ein Video, Foto oder eine Nachricht, die dein Lieblingsmensch über den Code beim Kuchen öffnet.',
      cta: 'Geschenk personalisieren',
      ctaNote: 'Wähle zuerst deinen Kuchen. Deine Botschaft fügst du nach der Zahlung hinzu.',
      flowLabel: 'So geht’s:',
      flowStep1: 'Kuchen wählen',
      flowStep2: 'Bezahlen',
      flowStep3: 'Botschaft hinzufügen',
      flowNote: 'Video, Foto oder Nachricht',
      previewImageAlt: 'Eine Mutter mit ihrer Tochter',
      hint: 'Als Geschenk? Füge im Checkout eine Video-, Foto- oder Textbotschaft hinzu – inklusive.',
    },
    forYouPages: {
      landingEyebrow: 'Jemand denkt an dich',
      landingTitle1: 'Eine Nachricht',
      landingTitle2: 'wartet auf dich',
      landingDesc: 'Gib den Code von deinem Sticker ein, um deine persönliche Nachricht zu öffnen.',
      codePlaceholder: 'Code eingeben',
      codeMissing: 'Bitte gib deinen Code ein.',
      openMessage: 'Nachricht öffnen',
      messageForYou: 'Eine Nachricht für dich',
      downloadFile: 'Datei herunterladen',
      photoAlt: 'Ein Foto für dich',
      defaultEyebrow: 'Für dich',
      defaultTitle: 'Jemand hat an dich gedacht',
      defaultText: 'Dieser Käsekuchen wurde frisch für dich gebacken – mit viel Liebe und den besten Zutaten. Geniess jeden Bissen.',
      defaultNote: 'Kommt noch eine persönliche Nachricht dazu, erscheint sie hier.',
      notFoundTitle: 'Code nicht gefunden',
      notFoundText: 'Bitte prüfe den Code auf deinem Sticker und versuch es noch einmal.',
      enterCode: 'Code eingeben',
      ctaTitle: 'Selbst jemandem eine Freude machen?',
      ctaButton: 'Kuchen entdecken',
      handcrafted: 'Handgemacht in Zürich',
      loading: 'Laden…',
      notAuthorizedTitle: 'Öffne den Link aus deiner E-Mail',
      notAuthorizedText: 'Um deine Nachricht zu erstellen oder zu ändern, öffne den Link in deiner Bestellbestätigung per E-Mail – auf jedem Gerät.',
      viewMessage: 'Nachricht ansehen',
      trouble: 'Probleme?',
      lockedTitle: 'Deine Nachricht ist gespeichert',
      lockedText: 'Sie ist mit deinem Kuchen unterwegs. Möchtest du sie noch ändern, schreib uns an',
      lockedTextEnd: 'und wir kümmern uns darum.',
      editorTitle1: 'Hinterlasse eine Nachricht,',
      editorTitle2: 'die bleibt',
      editorDesc: 'Schreib ein paar Zeilen, nimm ein Video auf oder füge ein Foto hinzu. Wir bewahren alles sicher hinter deinem Code auf.',
      editableUntil: (date) => `Du kannst deine Nachricht bis ${date} ändern.`,
      draftRestored: 'Wir haben deinen Entwurf wiederhergestellt.',
      messageLabel: 'Deine Nachricht',
      messagePlaceholder: 'Schreib etwas von Herzen…',
      addVideo: 'Video hinzufügen',
      videoLimit: 'bis 100 MB',
      videoAdded: 'Video hinzugefügt',
      uploadingVideo: (percent) => `Video wird hochgeladen… ${percent}%`,
      addFile: 'Foto oder PDF hinzufügen',
      fileLimit: 'bis 25 MB',
      fileAdded: 'Datei hinzugefügt',
      uploadingFile: (percent) => `Wird hochgeladen… ${percent}%`,
      remove: 'Entfernen',
      videoTooLarge: 'Das Video ist zu gross (max. 100 MB). Versuch es mit einem kürzeren Clip.',
      videoFailed: 'Das Video konnte nicht hochgeladen werden. Bitte versuch es noch einmal.',
      fileTooLarge: 'Die Datei ist zu gross (max. 25 MB).',
      fileFailed: 'Die Datei konnte nicht hochgeladen werden. Bitte versuch es noch einmal.',
      nothingToSave: 'Füge zuerst eine Nachricht, ein Video oder ein Foto hinzu.',
      saveFailed: 'Deine Nachricht konnte nicht gespeichert werden. Bitte versuch es noch einmal.',
      save: 'Nachricht speichern',
      saveChanges: 'Änderungen speichern',
      saving: 'Wird gespeichert…',
      uploadingShort: 'Wird hochgeladen…',
      savedEyebrow: 'Nachricht gespeichert',
      savedTitle1: 'Alles',
      savedTitle2: 'bereit.',
      savedText: 'Wir legen den Code zu deinem Kuchen. Die beschenkte Person scannt ihn – und deine Nachricht öffnet sich.',
      savedEditHint: (date) => `Du kannst sie bis ${date} über den Link in deiner E-Mail ändern.`,
      preview: 'Ansehen, was sie sehen',
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
      hippo: 'Cremige Haselnuss-Kakao-Creme auf unserem seidigen Käsekuchen. Limitierte Edition — nur solange der Vorrat reicht.',
    },
    relatedProducts: {
      title: 'PASST PERFEKT DAZU',
      add: 'DAZU',
      addAria: (name) => `${name} (8–10 Personen) in den Warenkorb`,
    },
    checkout: {
      emptyCart: 'Ihr Warenkorb ist leer',
      continueShopping: 'Weiter einkaufen',
      breadcrumbCart: 'Warenkorb',
      breadcrumbDetails: 'Angaben',
      breadcrumbPayment: 'Zahlung',
      contact: 'Kontakt',
      contactGift: 'Deine Daten',
      signIn: 'Anmelden',
      emailPlaceholder: 'E-Mail',
      phonePlaceholder: 'Handynummer (z.B. +41 79 123 45 67)',
      newsletter: 'Senden Sie mir Neuigkeiten und Angebote per E-Mail',
      deliveryAddress: 'Lieferadresse',
      deliveryAddressGift: 'Wohin liefern wir den Kuchen?',
      country: 'Schweiz',
      firstNamePlaceholder: 'Vorname',
      lastNamePlaceholder: 'Nachname',
      addressPlaceholder: 'Adresse',
      cityPlaceholder: 'Stadt',
      postalCodePlaceholder: 'Postleitzahl',
      formError: 'Bitte füllen Sie alle Pflichtfelder aus (rot markiert).',
      postalCodeError: 'Leider liefern wir nur im Umkreis von 10km um Zürich Zentrum. Ihre Postleitzahl liegt ausserhalb unseres Liefergebiets.',
      deliveryTitle: 'Lieferung',
      deliveryQuestion: 'Wann sollen wir liefern?',
      deliveryNotice: 'Alle Käsekuchen werden frisch für Sie gebacken. Deshalb brauchen wir mindestens 24 Stunden Vorlaufzeit.',
      chooseDateLabel: 'Lieferdatum',
      moreDates: 'Anderes Datum',
      chooseTimeLabel: 'Lieferzeit',
      deliveryError: 'Bitte wählen Sie Lieferdatum und -zeit.',
      continueToDetails: 'Weiter zu den Angaben',
      continueToPayment: 'Weiter zur Zahlung',
      backToDetails: 'Zurück zu den Angaben',
      paymentTitle: 'Zahlung',
      orderSummary: 'Bestellübersicht',
      qty: 'Menge:',
      discountCodePlaceholder: 'Rabattcode',
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
      slotExpired: 'Die gewählte Lieferzeit liegt jetzt innerhalb der 24 Stunden Vorlaufzeit. Bitte wählen Sie einen neuen Termin.',
      dateUnavailable: 'Dieses Lieferdatum ist nicht mehr verfügbar. Bitte wählen Sie ein anderes Datum.',
      orderChanged: 'Ihre Bestellung hat sich geändert. Bitte bestätigen Sie sie noch einmal.',
      change: 'Ändern',
      persons: 'Personen',
    },
    paymentSuccess: {
      title: 'Vielen Dank',
      message: 'Ihre Bestellung ist bestätigt. Wir backen Ihren Kuchen frisch für Ihren Liefertermin.',
      pendingTitle: 'Zahlung wird bestätigt',
      pendingMessage: 'Ihre Zahlung wird gerade bestätigt. Das dauert in der Regel nur einen Moment – diese Seite aktualisiert sich automatisch. Bitte nicht erneut bezahlen.',
      slowTitle: 'Bestätigung ausstehend',
      slowMessage: 'Die Bestätigung dauert länger als üblich. Sobald die Zahlung eingegangen ist, erhalten Sie eine E-Mail. Bitte nicht erneut bezahlen – bei Fragen sind wir gerne für Sie da.',
      checkAgain: 'Erneut prüfen',
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
      fromPrice: (price) => `from CHF ${price}`,
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
      remove: 'Remove',
      decrease: 'Decrease quantity',
      increase: 'Increase quantity',
    },
    delivery: {
      earliest: 'Earliest delivery',
      tomorrow: 'tomorrow',
    },
    consent: {
      text: 'We use cookies for statistics and advertising (Microsoft Clarity, Google, Meta) to improve our site.',
      accept: 'Accept',
      decline: 'Decline',
      learnMore: 'Learn more',
      settings: 'Cookie settings',
    },
    marquee: '10% DISCOUNT FROM CHF 100 • FREE DELIVERY',
    products: {
      heading: 'OUR',
      subtitle: 'Six varieties, all freshly baked to order.',
      pistachio: 'Made with pure Sicilian pistachio paste. No colouring, no artificial flavouring.',
      classic: 'Our classic original recipe, creamy and delicate. The authentic traditional taste...',
      lotus: 'Cheesecake with Lotus Biscoff cookies, irresistible spiced caramel flavour...',
      schoggi: 'Intense cheesecake with Swiss chocolate, for true cocoa lovers...',
      dulceDeLeche: 'Indulgent cheesecake with creamy Dulce de Leche and delicate caramel...',
      hippo: 'Creamy hazelnut-cocoa cream on our silky cheesecake. Limited edition...',
      limited: 'Limited Edition',
      monthlySpecial: 'Cake of the Month',
    },
    quality: {
      title1: 'YOUR',
      title2: 'AS IT SHOULD BE',
      desc: 'Surprise your friends, family or colleagues with our freshly baked cheesecakes. From CHF 100 you get 10% discount and free shipping!',
      cta: 'ORDER NOW',
    },
    forYou: {
      eyebrow: 'New · Emilia For You',
      included: 'Personalisation included',
      title1: 'Their favourite cake.',
      titleSerif: 'Your personal message.',
      desc: 'Make their birthday or your thank-you a little more personal. Add a video, photo or note they can open with the code included with their cake.',
      cta: 'Personalise your gift',
      ctaNote: 'Choose your cake first. Add your message after checkout.',
      flowLabel: 'How it works:',
      flowStep1: 'Choose your cake',
      flowStep2: 'Pay',
      flowStep3: 'Add your message',
      flowNote: 'Video, photo or note',
      previewImageAlt: 'A mother with her daughter',
      hint: 'A gift? Add a video, photo or note at checkout – included.',
    },
    forYouPages: {
      landingEyebrow: 'Someone is thinking of you',
      landingTitle1: 'A message',
      landingTitle2: 'is waiting',
      landingDesc: 'Enter the code on your sticker to unlock your personal message.',
      codePlaceholder: 'Enter your code',
      codeMissing: 'Please enter your code.',
      openMessage: 'Open my message',
      messageForYou: 'A message for you',
      downloadFile: 'Download file',
      photoAlt: 'A photo for you',
      defaultEyebrow: 'For you',
      defaultTitle: 'Someone was thinking of you',
      defaultText: 'This cheesecake was freshly baked for you – with lots of love and the best ingredients. Enjoy every bite.',
      defaultNote: 'If a personal message is added, it will appear here.',
      notFoundTitle: 'Code not found',
      notFoundText: 'Please check the code on your sticker and try again.',
      enterCode: 'Enter code',
      ctaTitle: 'Want to make someone\'s day?',
      ctaButton: 'Discover our cakes',
      handcrafted: 'Handcrafted in Zürich',
      loading: 'Loading…',
      notAuthorizedTitle: 'Open the link from your e-mail',
      notAuthorizedText: 'To create or change your message, open the link in your order confirmation e-mail – on any device.',
      viewMessage: 'View the message',
      trouble: 'Having trouble?',
      lockedTitle: 'Your message is saved',
      lockedText: 'It travels with your cake. If you\'d like to change it, write to us at',
      lockedTextEnd: 'and we\'ll take care of it.',
      editorTitle1: 'Leave a message',
      editorTitle2: 'they\'ll never forget',
      editorDesc: 'Write a note, record a video or add a photo. We\'ll keep it safe behind your code.',
      editableUntil: (date) => `You can change your message until ${date}.`,
      draftRestored: 'We restored your draft.',
      messageLabel: 'Your message',
      messagePlaceholder: 'Write something from the heart…',
      addVideo: 'Add a video',
      videoLimit: 'up to 100 MB',
      videoAdded: 'Video added',
      uploadingVideo: (percent) => `Uploading video… ${percent}%`,
      addFile: 'Add a photo or PDF',
      fileLimit: 'up to 25 MB',
      fileAdded: 'File added',
      uploadingFile: (percent) => `Uploading… ${percent}%`,
      remove: 'Remove',
      videoTooLarge: 'The video is too large (max 100 MB). Try a shorter clip.',
      videoFailed: 'The video could not be uploaded. Please try again.',
      fileTooLarge: 'The file is too large (max 25 MB).',
      fileFailed: 'The file could not be uploaded. Please try again.',
      nothingToSave: 'Add a message, a video or a photo first.',
      saveFailed: 'Could not save your message. Please try again.',
      save: 'Save my message',
      saveChanges: 'Save changes',
      saving: 'Saving…',
      uploadingShort: 'Uploading…',
      savedEyebrow: 'Message saved',
      savedTitle1: 'All',
      savedTitle2: 'set.',
      savedText: 'We add the code to your cake. They scan it – and your message opens.',
      savedEditHint: (date) => `You can change it until ${date} with the link in your e-mail.`,
      preview: 'See what they\'ll see',
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
      hippo: 'Creamy hazelnut-cocoa cream on our silky Basque-style cheesecake. Limited edition — only while stocks last.',
    },
    relatedProducts: {
      title: 'PAIRS PERFECTLY WITH',
      add: 'ADD',
      addAria: (name) => `Add ${name} (8–10 persons) to cart`,
    },
    checkout: {
      emptyCart: 'Your cart is empty',
      continueShopping: 'Continue shopping',
      breadcrumbCart: 'Cart',
      breadcrumbDetails: 'Details',
      breadcrumbPayment: 'Payment',
      contact: 'Contact',
      contactGift: 'Your details',
      signIn: 'Sign in',
      emailPlaceholder: 'Email',
      phonePlaceholder: 'Phone number (e.g. +41 79 123 45 67)',
      newsletter: 'Send me news and offers by email',
      deliveryAddress: 'Delivery Address',
      deliveryAddressGift: 'Where should we deliver the cake?',
      country: 'Switzerland',
      firstNamePlaceholder: 'First name',
      lastNamePlaceholder: 'Last name',
      addressPlaceholder: 'Address',
      cityPlaceholder: 'City',
      postalCodePlaceholder: 'Postal code',
      formError: 'Please fill in all required fields (highlighted in red).',
      postalCodeError: 'Unfortunately we only deliver within 10km of Zurich city centre. Your postal code is outside our delivery area.',
      deliveryTitle: 'Delivery',
      deliveryQuestion: 'When should we deliver?',
      deliveryNotice: 'Every cheesecake is freshly baked for you, so we need at least 24 hours\' notice.',
      chooseDateLabel: 'Delivery date',
      moreDates: 'Other date',
      chooseTimeLabel: 'Delivery time',
      deliveryError: 'Please select a delivery date and time.',
      continueToDetails: 'Continue to your details',
      continueToPayment: 'Continue to Payment',
      backToDetails: 'Back to your details',
      paymentTitle: 'Payment',
      orderSummary: 'Order Summary',
      qty: 'Qty:',
      discountCodePlaceholder: 'Discount code',
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
      slotExpired: 'Your delivery slot no longer meets the 24-hour lead time. Please pick a new one.',
      dateUnavailable: 'This delivery date is no longer available. Please choose another date.',
      orderChanged: 'Your order has changed. Please confirm it once more.',
      change: 'Change',
      persons: 'persons',
    },
    paymentSuccess: {
      title: 'Thank You',
      message: 'Your order is confirmed. We bake your cake fresh for your delivery date.',
      pendingTitle: 'Confirming your payment',
      pendingMessage: 'Your payment is being confirmed. This usually only takes a moment – this page will update automatically. Please do not pay again.',
      slowTitle: 'Confirmation pending',
      slowMessage: 'Confirmation is taking longer than usual. We will email you as soon as the payment arrives. Please do not pay again – if you have questions, we are happy to help.',
      checkAgain: 'Check again',
      backHome: 'Back to Home',
      questions: 'Questions?',
      contactUs: 'Contact us',
      loading: 'Loading...',
    },
  },
}
