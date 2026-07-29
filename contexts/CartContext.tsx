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
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// The 2-3 photos moved from .png to .jpeg. Carts live in localStorage for 48h,
// so a cart saved before that change still points at files that no longer exist.
// Rewrite those paths on load instead of leaving people with broken thumbnails.
const LEGACY_SMALL_PHOTO = /^\/(pistacho|original|cafe|chocolate|lotus)3\.png$/

function migrateItem(item: CartItem): CartItem {
  if (typeof item?.image === 'string' && LEGACY_SMALL_PHOTO.test(item.image)) {
    return { ...item, image: item.image.replace(/\.png$/, '.jpeg') }
  }
  return item
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Load cart from localStorage on mount (expires after 48h)
  useEffect(() => {
    const savedCart = localStorage.getItem('emilia-cart')
    const savedTimestamp = localStorage.getItem('emilia-cart-timestamp')
    if (savedCart && savedTimestamp) {
      const hoursElapsed = (Date.now() - Number(savedTimestamp)) / (1000 * 60 * 60)
      if (hoursElapsed < 48) {
        try {
          const parsed = JSON.parse(savedCart)
          setCartItems(Array.isArray(parsed) ? parsed.map(migrateItem) : [])
        } catch (e) {
          console.error('Error loading cart from localStorage:', e)
        }
      } else {
        localStorage.removeItem('emilia-cart')
        localStorage.removeItem('emilia-cart-timestamp')
      }
    }
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('emilia-cart', JSON.stringify(cartItems))
      if (cartItems.length > 0) {
        // Only update timestamp when items are added, not on every change
        if (!localStorage.getItem('emilia-cart-timestamp')) {
          localStorage.setItem('emilia-cart-timestamp', String(Date.now()))
        }
      } else {
        localStorage.removeItem('emilia-cart-timestamp')
      }
    }
  }, [cartItems, isInitialized])

  const addToCart = (item: CartItem) => {
    setCartItems(prev => [...prev, item])
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
    // Si solo quedan productos de upsell, vaciar el carrito para evitar exploits
    const hasNonSpecialItems = newItems.some(item => !item.id.includes('upsell'))
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
