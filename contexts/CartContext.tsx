"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface CartItem {
  id: string
  name: string
  price: number
  size: string
  image: string
  quantity: number
}

interface CartContextType {
  cartItems: CartItem[]
  isCartOpen: boolean
  setIsCartOpen: (open: boolean) => void
  addToCart: (item: CartItem) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  totalPrice: number
  cartItemCount: number
  easterGiftPendingCakeId: string | null
  setEasterGiftPendingCakeId: (id: string | null) => void
  addEasterGift: (parentCakeId: string, gift: { name: string; image: string }) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const EASTER_GIFT_OPTIONS = [
  { slug: "pistacho", name: "PISTACHIO", image: "/pistacho3.png", realPrice: 21.90 },
  { slug: "original", name: "CLASSIC", image: "/original3.png", realPrice: 17.90 },
  { slug: "lotus", name: "LOTUS", image: "/lotus3.png", realPrice: 19.90 },
  { slug: "chocolate", name: "SCHOGGI", image: "/chocolate3.png", realPrice: 18.90 },
  { slug: "cafe", name: "DULCE DE LECHE", image: "/cafe3.png", realPrice: 20.90 },
]

export { EASTER_GIFT_OPTIONS }

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [easterGiftPendingCakeId, setEasterGiftPendingCakeId] = useState<string | null>(null)

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('emilia-cart')
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart))
      } catch (e) {
        console.error('Error loading cart from localStorage:', e)
      }
    }
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('emilia-cart', JSON.stringify(cartItems))
    }
  }, [cartItems, isInitialized])

  const addToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item])
    // If it's a large cake, show the Easter gift modal instead of opening the cart
    if (item.size === "8-10") {
      setEasterGiftPendingCakeId(item.id)
    } else {
      setIsCartOpen(true)
    }
  }

  const addEasterGift = (parentCakeId: string, gift: { name: string; image: string }) => {
    const giftItem: CartItem = {
      id: `easter-gift-${parentCakeId}`,
      name: `${gift.name} (Oster-Geschenk)`,
      price: 0,
      size: "2-3",
      image: gift.image,
      quantity: 1,
    }
    setCartItems(prev => [...prev, giftItem])
    setEasterGiftPendingCakeId(null)
    setIsCartOpen(true)
  }

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(cartItems.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ))
  }

  const removeItem = (id: string) => {
    let newItems = cartItems.filter(item => item.id !== id)
    // Also remove linked easter gift when a large cake is removed
    newItems = newItems.filter(item => item.id !== `easter-gift-${id}`)
    // Si solo quedan productos de upsell/gift, vaciar el carrito para evitar exploits
    const hasNonSpecialItems = newItems.some(item => !item.id.includes('upsell') && !item.id.includes('easter-gift'))
    setCartItems(hasNonSpecialItems ? newItems : [])
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{
      cartItems,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateQuantity,
      removeItem,
      totalPrice,
      cartItemCount,
      easterGiftPendingCakeId,
      setEasterGiftPendingCakeId,
      addEasterGift,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
