export const products: { [key: string]: any } = {
    "pistacho": {
        name: "PISTACHIO",
        prices: {
            "8-10": 49.90,  // CHF for 8-10 people
            "2-3": 18.90    // CHF for 2-3 people
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
                name: "CLASSIC",
                price: 42.90,
                image: "/original1.png"
            },
            {
                id: 2,
                name: "SCHOGGI",
                price: 44.90,
                image: "/chocolate1.png"
            }
        ]
    },
    "lotus": {
        name: "LOTUS",
        prices: {
            "8-10": 44.90,
            "2-3": 16.90
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
                name: "PISTACHIO",
                price: 49.90,
                image: "/pistacho1.png"
            },
            {
                id: 2,
                name: "DULCE DE LECHE",
                price: 45.90,
                image: "/cafe1.png"
            }
        ]
    },
    "chocolate": {
        name: "SCHOGGI",
        prices: {
            "8-10": 44.90,
            "2-3": 16.90
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
                name: "DULCE DE LECHE",
                price: 45.90,
                image: "/cafe1.png"
            },
            {
                id: 2,
                name: "CLASSIC",
                price: 42.90,
                image: "/original1.png"
            }
        ]
    },
    "original": {
        name: "CLASSIC",
        prices: {
            "8-10": 42.90,
            "2-3": 15.90
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
                name: "PISTACHIO",
                price: 49.90,
                image: "/pistacho1.png"
            },
            {
                id: 2,
                name: "LOTUS",
                price: 44.90,
                image: "/lotus1.png"
            }
        ]
    },
    "cafe": {
        name: "DULCE DE LECHE",
        prices: {
            "8-10": 45.90,
            "2-3": 17.40
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
                price: 44.90,
                image: "/chocolate1.png"
            },
            {
                id: 2,
                name: "PISTACHIO",
                price: 49.90,
                image: "/pistacho1.png"
            }
        ]
    }
}
