import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { ShoppingCart, Trash2, ArrowRight, PackageOpen } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useCart } from '@/contexts/CartContext'
import { pageTitle } from '@/lib/siteMeta'

export const Route = createFileRoute('/cart')({
  head: () => ({ meta: [{ title: pageTitle('Cart') }] }),
  component: CartPage,
})

function CartPage() {
  const { t } = useTranslation()
  const { items, removeFromCart, total, count } = useCart()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="solid" />

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="mb-10 flex items-center gap-3">
          <ShoppingCart className="h-7 w-7 text-primary" />
          <h1 className="text-3xl font-bold text-primary">{t('cart.title', 'Your Cart')}</h1>
          {count > 0 && (
            <span className="rounded-full bg-accent px-3 py-0.5 text-sm font-bold text-white">{count}</span>
          )}
        </div>

        {items.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-24 text-center">
            <PackageOpen className="mb-4 h-16 w-16 text-muted-foreground/40" />
            <h2 className="mb-2 text-xl font-semibold text-primary">{t('cart.empty', 'Your cart is empty')}</h2>
            <p className="mb-8 text-sm text-muted-foreground">{t('cart.empty_desc', 'Browse our courses and add them to your cart.')}</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
            >
              {t('cart.browse_courses', 'Browse Courses')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* ── Items List ── */}
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={`${item.type}-${item.id}`} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary/10">
                        <ShoppingCart className="h-6 w-6 text-primary/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                      {item.type === 'course' ? t('cart.course', 'Course') : t('cart.product', 'Product')}
                    </span>
                    <p className="font-semibold text-primary truncate">{item.title}</p>
                    <p className="text-lg font-bold text-accent">${item.price.toFixed(2)}</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id, item.type)}
                    className="flex-shrink-0 rounded-xl p-2 text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-colors"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-primary">{t('cart.order_summary', 'Order Summary')}</h2>

                <div className="space-y-3 text-sm">
                  {items.map(item => (
                    <div key={`${item.type}-${item.id}`} className="flex justify-between text-muted-foreground">
                      <span className="truncate max-w-[150px]">{item.title}</span>
                      <span className="font-semibold text-foreground">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="my-4 border-t border-border" />

                <div className="flex justify-between font-bold text-primary">
                  <span>{t('cart.total', 'Total')}</span>
                  <span className="text-accent text-xl">${total.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => navigate({ to: '/checkout' })}
                  className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white shadow-md hover:bg-primary/90 transition-colors"
                >
                  {t('cart.checkout', 'Proceed to Checkout')} <ArrowRight className="h-4 w-4" />
                </button>

                <Link
                  to="/"
                  className="mt-3 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {t('cart.continue_shopping', 'Continue Shopping')}
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
