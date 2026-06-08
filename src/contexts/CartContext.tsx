import React, { createContext, useContext, useState, useEffect } from 'react'

export interface CartItem {
  id: number
  type: 'course' | 'product'
  title: string
  price: number
  thumbnail: string | null
}

interface CartContextType {
  items: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (id: number, type: CartItem['type']) => void
  clearCart: () => void
  isInCart: (id: number, type: CartItem['type']) => boolean
  total: number
  count: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_KEY = 'prometrica_cart'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof localStorage === 'undefined') return []
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    }
  }, [items])

  const addToCart = (item: CartItem) => {
    setItems(prev => {
      // Digital products: max 1 of each item — no duplicates
      const exists = prev.some(i => i.id === item.id && i.type === item.type)
      if (exists) return prev
      return [...prev, item]
    })
  }

  const removeFromCart = (id: number, type: CartItem['type']) => {
    setItems(prev => prev.filter(i => !(i.id === id && i.type === type)))
  }

  const clearCart = () => setItems([])

  const isInCart = (id: number, type: CartItem['type']) =>
    items.some(i => i.id === id && i.type === type)

  const total = items.reduce((sum, i) => sum + i.price, 0)
  const count = items.length

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isInCart, total, count }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
