import React, { useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';

const CartTotal = ({ subtotal = 0, discount = 0 }) => {
  const { currency = '$', delivery_fee = 0, getCartAmount } = useContext(ShopContext);

  // prefer passed subtotal prop; fallback to getCartAmount()
  const numericSubtotal = Number(subtotal || getCartAmount()) || 0
  const numericDiscount = Number(discount) || 0
  const shipping = Number(delivery_fee) || 0
  const finalTotal = Math.max(0, numericSubtotal - numericDiscount + shipping)

  const fmt = (v) => {
    // if currency already includes symbol (e.g. '$'), avoid extra space
    return `${currency}${Number(v).toFixed(2)}`
  }

  return (
    <div className='w-full'>
      <div className='text-2xl'>
        <Title text1={'CART'} text2={'TOTALS'} />
      </div>

      <div className='flex flex-col gap-2 mt-2 text-sm'>
        <div className='flex justify-between'>
          <p>Subtotal</p>
          <p>{fmt(numericSubtotal)}</p>
        </div>

        {numericDiscount > 0 && (
          <>
            <div className='flex justify-between'>
              <p>Discount</p>
              <p className='text-green-600'>-{fmt(numericDiscount)}</p>
            </div>
            <hr />
          </>
        )}

        <div className='flex justify-between'>
          <p>Shipping Fee</p>
          <p>{fmt(shipping)}</p>
        </div>

        <hr />

        <div className='flex justify-between'>
          <b>Total</b>
          <b>{fmt(finalTotal)}</b>
        </div>
      </div>
    </div>
  )
}

export default CartTotal
