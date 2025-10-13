import React, { useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'

const CouponBlock = ({ subtotal = 0, onApplyDiscount = () => {} }) => {
  const { backendUrl } = useContext(ShopContext)
  const [code, setCode] = useState('')
  const [applying, setApplying] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState(null)

  const handleValidate = async () => {
    if (!code) return toast.error('Enter coupon code')
    try {
      setApplying(true)
      const res = await axios.post(`${backendUrl}/api/newsletter/validate`, { code })
      if (res.data.success && res.data.coupon) {
        const coupon = res.data.coupon
        setAppliedCoupon(coupon)
        const discountAmount = coupon.type === 'percent' ? subtotal * (coupon.value / 100) : coupon.value
        onApplyDiscount(discountAmount, coupon)
        toast.success(`Coupon valid — ${coupon.value}${coupon.type === 'percent' ? '%' : ''} off`)
      } else {
        toast.error(res.data.message || 'Invalid coupon')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="flex gap-2 items-center">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Coupon code"
          className="border px-3 py-2 flex-1"
        />
        <button
          onClick={handleValidate}
          disabled={applying || (appliedCoupon !== null)}
          className="px-4 py-2 bg-black text-white"
        >
          {appliedCoupon ? 'APPLIED' : applying ? 'Checking...' : 'Apply'}
        </button>
      </div>

      {appliedCoupon && (
        <p className="text-sm text-green-600 mt-2">
          Applied: {appliedCoupon.code} — {appliedCoupon.value}
          {appliedCoupon.type === 'percent' ? '%' : ''} off
        </p>
      )}
    </div>
  )
}

export default CouponBlock