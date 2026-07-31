import type { Appearance } from '@stripe/stripe-js'

// El PaymentElement se dibuja dentro de un iframe de Stripe, así que no se puede tocar
// con CSS propio: el aspecto va por la Appearance API. Reutilizamos el mismo lenguaje
// que los tramos de entrega (beige + borde burdeos) para que elegir TWINT, tarjeta o
// Klarna se sienta igual que elegir una hora, y no un widget pegado de fuera.
const PM_SELECTED_BG = '#F5E6D3'
const PM_SELECTED_BORDER = '#651A1A'
const PM_HOVER_BG = '#FFFCF8'
const PM_IDLE_BORDER = '#D1D5DB'

// Los selectores dependen del layout que Stripe decida usar —pestañas o acordeón—,
// así que definimos los dos; el que no aplique simplemente no se usa.
export const stripeAppearance: Appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#000000',
    borderRadius: '12px',
  },
  rules: {
    '.Tab': {
      border: `1px solid ${PM_IDLE_BORDER}`,
      boxShadow: 'none',
    },
    '.Tab:hover': {
      backgroundColor: PM_HOVER_BG,
      color: PM_SELECTED_BORDER,
    },
    '.Tab--selected': {
      backgroundColor: PM_SELECTED_BG,
      border: `2px solid ${PM_SELECTED_BORDER}`,
      color: PM_SELECTED_BORDER,
      boxShadow: 'none',
    },
    // Sin esto, el cursor que se queda encima tras el clic deja el hover por encima
    // del estado elegido y el beige no llega a verse en escritorio.
    '.Tab--selected:hover': {
      backgroundColor: PM_SELECTED_BG,
      color: PM_SELECTED_BORDER,
    },
    '.TabLabel--selected': { color: PM_SELECTED_BORDER },
    '.TabIcon--selected': { color: PM_SELECTED_BORDER },
    '.AccordionItem': {
      border: `1px solid ${PM_IDLE_BORDER}`,
      boxShadow: 'none',
    },
    '.AccordionItem:hover': {
      backgroundColor: PM_HOVER_BG,
    },
    '.AccordionItem--selected': {
      backgroundColor: PM_SELECTED_BG,
      border: `2px solid ${PM_SELECTED_BORDER}`,
      color: PM_SELECTED_BORDER,
      boxShadow: 'none',
    },
    '.AccordionItem--selected:hover': {
      backgroundColor: PM_SELECTED_BG,
      color: PM_SELECTED_BORDER,
    },
  },
}
