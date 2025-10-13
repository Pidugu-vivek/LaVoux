import React, { useState, useContext } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'

const ForgotPassword = () => {
  const { backendUrl } = useContext(ShopContext)
  const [email, setEmail] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      // backend must implement POST /api/user/forgot to handle this
      const res = await axios.post(backendUrl + '/api/user/forgot', { email })
      if (res.data.success) {
        toast.success(res.data.message || 'Check your email for reset link')
      } else {
        toast.error(res.data.message || 'Failed')
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className='min-h-[60vh] flex items-center justify-center'>
      <form onSubmit={onSubmit} className='w-full max-w-md p-6 border rounded'>
        <h2 className='text-xl mb-4'>Forgot Password</h2>
        <input required value={email} onChange={(e)=>setEmail(e.target.value)} className='w-full px-3 py-2 mb-3' type="email" placeholder='Enter your email' />
        <button type='submit' className='bg-black text-white px-4 py-2'>Send reset link</button>
      </form>
    </div>
  )
}

export default ForgotPassword