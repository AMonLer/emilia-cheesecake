export const products: { [key: string]: any } = {
    "pistacho": {
        name: "VERDALIA",
        prices: {
            "8-10": 55.90,  // CHF for 8-10 people
            "2-3": 21.90    // CHF for 2-3 people
        },
        description: "Unser Bestseller. Echte Pistaziencreme, zarte Textur und ein grüner, eleganter und ausgewogener Geschmack. Delikat, aromatisch und süchtig machend.",
        images: ["/pistacho1.png", "/pistacho2.png"],
        includes: [
            "Pistazienkäsekuchen",
            "Handgefertigt nach traditionellem Rezept"
        ],
        frequentlyBought: [
            {
                id: 1,
                name: "CLÁSICA",
                price: 49.90,
                image: "/original1.png"
            },
            {
                id: 2,
                name: "SCHOGGI",
                price: 52.90,
                image: "/chocolate1.png"
            }
        ]
    },
    "lotus": {
        name: "EMILIA N.3",
        prices: {
            "8-10": 55.90,
            "2-3": 21.90
        },
        description: "Die süßeste aus der Kollektion. Karamell, sanfte Gewürze und eine umhüllende Creme, die jeden Bissen in puren Komfort verwandelt.",
        images: ["/lotus1.png", "/lotus2.png"],
        includes: [
            "Lotus Biscoff Käsekuchen",
            "Handgefertigt nach traditionellem Rezept"
        ],
        frequentlyBought: [
            {
                id: 1,
                name: "VERDALIA",
                price: 55.90,
                image: "/pistacho1.png"
            },
            {
                id: 2,
                name: "MANJAR",
                price: 52.90,
                image: "/cafe1.png"
            }
        ]
    },
    "chocolate": {
        name: "SCHOGGI",
        prices: {
            "8-10": 52.90,
            "2-3": 20.90
        },
        description: "Cremige Schweizer Schokolade mit einem tiefen Geschmack, der umhüllt, ohne zu überwältigen. Eine perfekte Balance zwischen Intensität und Sanftheit.",
        images: ["/chocolate1.png", "/chocolate2.png"],
        includes: [
            "Schokoladenkäsekuchen mit Schweizer Schokolade",
            "Handgefertigt nach traditionellem Rezept"
        ],
        frequentlyBought: [
            {
                id: 1,
                name: "MANJAR",
                price: 52.90,
                image: "/cafe1.png"
            },
            {
                id: 2,
                name: "CLÁSICA",
                price: 49.90,
                image: "/original1.png"
            }
        ]
    },
    "original": {
        name: "CLÁSICA",
        prices: {
            "8-10": 49.90,
            "2-3": 17.90
        },
        description: "Das Rezept, mit dem alles begann. Cremig, seidig und im baskischen Stil gebacken. Pure Emilia-Essenz: einfach, perfekt, unvergesslich.",
        images: ["/original1.png", "/original2.png"],
        includes: [
            "Original Käsekuchen im baskischen Stil",
            "Handgefertigt nach traditionellem Rezept"
        ],
        frequentlyBought: [
            {
                id: 1,
                name: "VERDALIA",
                price: 55.90,
                image: "/pistacho1.png"
            },
            {
                id: 2,
                name: "EMILIA N.3",
                price: 55.90,
                image: "/lotus1.png"
            }
        ]
    },
    "cafe": {
        name: "MANJAR",
        prices: {
            "8-10": 52.90,
            "2-3": 20.90
        },
        description: "Cremiges Dulce de Leche mit zartem Karamell und einer verführerischen Süße. Eine lateinamerikanische Köstlichkeit, die jeden Bissen zu einem unvergesslichen Erlebnis macht.",
        images: ["/cafe1.png", "/cafe2.png"],
        includes: [
            "Dulce de Leche Käsekuchen",
            "Handgefertigt nach traditionellem Rezept"
        ],
        frequentlyBought: [
            {
                id: 1,
                name: "SCHOGGI",
                price: 52.90,
                image: "/chocolate1.png"
            },
            {
                id: 2,
                name: "VERDALIA",
                price: 55.90,
                image: "/pistacho1.png"
            }
        ]
    }
}
