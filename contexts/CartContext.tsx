"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { products } from "@/lib/products"

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
  updateSize: (id: string, size: CartSize) => void
  removeItem: (id: string) => void
  totalPrice: number
  cartItemCount: number
}

export type CartSize = "2-3" | "8-10"

// Catalogue items are added as `${slug}-${size}-${timestamp}`. The checkout
// upsell has a special price, so it is not a catalogue item and stays fixed.
export function productSlugForItem(item: { id: string }): string | null {
  if (item.id.includes('upsell')) return null
  const slug = item.id.split('-')[0]
  return products[slug] ? slug : null
}

// The 2-3 size has its own photo of the cake in its box, named by slug.
export function cartImageFor(slug: string, size: CartSize): string {
  return size === "2-3" ? `/${slug}3.jpeg` : products[slug].images[0]
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
    setCartItems(items => items.map(item =>
      item.id === id ? { ...item, quantity: newQuantity } : item
    ))
  }

  // Buyers tapped the size in the cart expecting to change it. Switching keeps
  // the quantity and folds into an existing line of the same cake and size.
  const updateSize = (id: string, size: CartSize) => {
    setCartItems(items => {
      const target = items.find(item => item.id === id)
      const slug = target ? productSlugForItem(target) : null
      const price = slug ? products[slug].prices[size] : undefined
      if (!target || !slug || !price || target.size === size) return items
      const twin = items.find(item => item.id !== id && item.size === size && productSlugForItem(item) === slug)
      if (twin) {
        return items
          .filter(item => item.id !== id)
          .map(item => item.id === twin.id ? { ...item, quantity: item.quantity + target.quantity } : item)
      }
      return items.map(item =>
        item.id === id ? { ...item, size, price, image: cartImageFor(slug, size) } : item
      )
    })
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
      updateSize,
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
