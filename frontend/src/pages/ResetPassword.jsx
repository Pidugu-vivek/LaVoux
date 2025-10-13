import React, { useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'

const ResetPassword = () => {
  const { backendUrl } = useContext(ShopContext)
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    if (password !== confirm) return toast.error('Passwords do not match')
    try {
      setLoading(true)
      const res = await axios.post(`${backendUrl}/api/user/reset/${token}`, { password })
      if (res.data.success) {
        toast.success(res.data.message || 'Password reset successful')
        navigate('/login')
      } else {
        toast.error(res.data.message || 'Reset failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-[60vh] flex items-center justify-center'>
      <form onSubmit={onSubmit} className='w-full max-w-md p-6 border rounded'>
        <h2 className='text-xl mb-4'>Reset Password</h2>
        <input required value={password} onChange={(e)=>setPassword(e.target.value)} className='w-full px-3 py-2 mb-3' type="password" placeholder='New password' />
        <input required value={confirm} onChange={(e)=>setConfirm(e.target.value)} className='w-full px-3 py-2 mb-3' type="password" placeholder='Confirm new password' />
        <button type='submit' className='bg-black text-white px-4 py-2' disabled={loading}>{loading ? 'Saving...' : 'Reset password'}</button>
      </form>
    </div>
  )
}

export default ResetPassword