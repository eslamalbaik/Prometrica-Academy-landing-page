import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CreditCard, Lock, CheckCircle2, AlertCircle, Loader2, ShoppingBag, ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { useQueryClient } from '@tanstack/react-query'
import { pageTitle } from '@/lib/siteMeta'
import { getLoginUrl } from '@/lib/authSession'

export const Route = createFileRoute('/checkout')({
  head: () => ({ meta: [{ title: pageTitle('Checkout') }] }),
  component: CheckoutPage,
})

function CheckoutPage() {
  const { t } = useTranslation()
  const { items, total, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [cardNumber, setCardNumber]   = useState('')
  const [cardHolder, setCardHolder]   = useState('')
  const [cardExpiry, setCardExpiry]   = useState('')
  const [cardCvv, setCardCvv]         = useState('')
  const [isPaying, setIsPaying]       = useState(false)
  const [error, setError]             = useState<string | null>(null)
  const [success, setSuccess]         = useState(false)

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    window.location.href = getLoginUrl(window.location.href)
    return null
  }

  // Redirect to cart if empty
  if (items.length === 0 && !success) {
    navigate({ to: '/cart' })
    return null
  }

  const formatCardNumber = (val: string) =>
    val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
  }

  const handlePay = async () => {
    if (!cardNumber || !cardHolder || !cardExpiry || !cardCvv) {
      setError(t('validation.required', 'Please fill in all payment details.'))
      return
    }
    setError(null)
    setIsPaying(true)

    try {
      // Process each item in the cart
      for (const item of items) {
        if (item.type === 'course') {
          await api.post(`/courses/${item.id}/enroll`, { payment_confirmed: true })
        } else {
          await api.post(`/v1/digital-products/${item.id}/purchase`)
        }
      }

      queryClient.invalidateQueries({ queryKey: ['my-courses'] })
      queryClient.invalidateQueries({ queryKey: ['my-library'] })

      clearCart()
      setSuccess(true)

      setTimeout(() => navigate({ to: '/student/dashboard' }), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || t('enroll_error', 'An error occurred. Please try again.'))
    } finally {
      setIsPaying(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar variant="solid" />

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6">

        {success ? (
          /* ── Success State ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 border border-emerald-100">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            </div>
            <h2 className="mb-3 text-3xl font-bold text-primary">{t('checkout.success_title', 'Payment Successful!')}</h2>
            <p className="mb-2 text-muted-foreground">{t('checkout.success_desc', 'You are now enrolled. Redirecting to your dashboard…')}</p>
            <Loader2 className="mt-4 h-5 w-5 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-5">

            {/* ── Payment Form ── */}
            <div className="lg:col-span-3">
              <button
                onClick={() => navigate({ to: '/cart' })}
                className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> {t('cart.back_to_cart', 'Back to Cart')}
              </button>

              <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-primary">{t('checkout.payment_details', 'Payment Details')}</h2>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Lock className="h-3 w-3" /> {t('checkout.secure', 'Secure & encrypted')}
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-5">
                  {/* Card Number */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      {t('checkout.card_number', 'Card Number')}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="1234 5678 9012 3456"
                      dir="ltr"
                      value={cardNumber}
                      onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 transition"
                    />
                  </div>

                  {/* Card Holder */}
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                      {t('checkout.cardholder', 'Cardholder Name')}
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      dir="ltr"
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Expiry */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                        {t('checkout.expiry', 'Expiry Date')}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/YY"
                        dir="ltr"
                        value={cardExpiry}
                        onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 transition"
                      />
                    </div>
                    {/* CVV */}
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                        {t('checkout.cvv', 'CVV')}
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="123"
                        dir="ltr"
                        maxLength={4}
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15 transition"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePay}
                  disabled={isPaying}
                  className="mt-8 w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-white shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isPaying && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isPaying
                    ? t('checkout.processing', 'Processing…')
                    : `${t('checkout.pay_now', 'Pay Now')} — $${total.toFixed(2)}`}
                </button>
              </div>
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  <h2 className="font-bold text-primary">{t('cart.order_summary', 'Order Summary')}</h2>
                </div>

                <div className="space-y-4">
                  {items.map(item => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center gap-3">
                      <div className="h-12 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
                        {item.thumbnail ? (
                          <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-primary/10" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground capitalize">{item.type}</p>
                      </div>
                      <span className="text-sm font-bold text-accent">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="my-4 border-t border-border" />

                <div className="flex justify-between font-bold text-primary">
                  <span>{t('cart.total', 'Total')}</span>
                  <span className="text-xl text-accent">${total.toFixed(2)}</span>
                </div>

                <p className="mt-4 text-xs text-muted-foreground text-center">
                  {t('checkout.instant_access', 'You get instant access after payment.')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
