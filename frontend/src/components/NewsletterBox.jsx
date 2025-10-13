import React, { useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'

const NewsletterBox = () => {
  const { backendUrl } = useContext(ShopContext)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [claimed, setClaimed] = useState(false)

  // cleanup legacy global flag so it doesn't force claimed for new users
  useEffect(() => {
    try { localStorage.removeItem('newsletter_claimed') } catch {}
  }, [])

  // when email changes, check claim state for that email only
  useEffect(() => {
    const key = `newsletter_claimed:${email.trim().toLowerCase()}`
    try {
      if (email && localStorage.getItem(key) === 'true') {
        setClaimed(true)
      } else {
        setClaimed(false)
      }
    } catch {
      setClaimed(false)
    }
  }, [email])

  const onSubmitHandler = async (event) => {
    event.preventDefault()
    if (!email) return toast.error('Enter email')
    try {
      setLoading(true)
      const res = await axios.post(backendUrl + '/api/newsletter/subscribe', { email })
      if (res.data.success) {
        setClaimed(true)
        try { localStorage.setItem(`newsletter_claimed:${email.trim().toLowerCase()}`, 'true') } catch {}
        toast.success(res.data.message || 'Check your email for the 20% coupon')
        // optionally show code in UI: res.data.code
        if (res.data.code) {
          // small notice
          toast.info(`Coupon: ${res.data.code}`)
        }
        setEmail('')
      } else {
        if (res.data.alreadyClaimed) {
          setClaimed(true)
          try { localStorage.setItem(`newsletter_claimed:${email.trim().toLowerCase()}`, 'true') } catch {}
          toast.info(res.data.message || 'Already claimed')
        } else {
          toast.error(res.data.message || 'Subscription failed')
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className=' text-center'>
      <p className='text-2xl font-medium text-gray-800'>Subscribe now & get 20% off</p>
      <p className='text-gray-400 mt-3'>
        Enter your email to receive a one-time 20% off coupon for your first order.
      </p>
      <form onSubmit={onSubmitHandler} className='w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3'>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className='w-full sm:flex-1 outline-none'
          type="email"
          placeholder='Enter your email'
          required
          disabled={claimed}
        />
        <button type='submit' className='bg-black text-white text-xs px-10 py-4' disabled={loading || claimed}>
          {loading ? 'Please wait...' : claimed ? 'CLAIMED' : 'SUBSCRIBE'}
        </button>
      </form>
    </div>
  )
}

export default NewsletterBox
