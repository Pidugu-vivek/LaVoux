import React, { useState, useContext } from 'react'
import Title from '../components/Title'
import { assets } from '../assets/assets'
import NewsletterBox from '../components/NewsletterBox'
import axios from 'axios'
import { toast } from 'react-toastify'
import { ShopContext } from '../context/ShopContext'

const Contact = () => {
  const { backendUrl, token } = useContext(ShopContext)
  const [form, setForm] = useState({ name: '', email: '', subject: '', category: 'Other', orderId: '', message: '' })
  const [submitting, setSubmitting] = useState(false)

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill name, email, subject and message')
      return
    }
    try {
      setSubmitting(true)
      await axios.post(backendUrl + '/api/issue', { ...form }, token ? { headers: { token } } : {})
      toast.success('Issue submitted. We will get back to you soon.')
      setForm({ name: '', email: '', subject: '', category: 'Other', orderId: '', message: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      
      <div className='text-center text-2xl pt-10 border-t'>
          <Title text1={'CONTACT'} text2={'US'} />
      </div>

      <div className='my-10 flex flex-col justify-center md:flex-row gap-10 mb-28'>
        <img className='w-full md:max-w-[480px]' src={assets.contact_img} alt="" />
        <div className='flex flex-col justify-center items-start gap-6'>
          <p className='font-semibold text-xl text-gray-600'>Our Store</p>
          <p className=' text-gray-500'>54709 Willms Station <br /> Suite 350, Washington, USA</p>
          <p className=' text-gray-500'>Tel: (415) 555-0132 <br /> Email: admin@lavoux.com</p>
          <p className='font-semibold text-xl text-gray-600'>Careers at LaVoux</p>
          <p className=' text-gray-500'>Learn more about our teams and job openings.</p>
          <button className='border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500'>Explore Jobs</button>
          
          <div className='w-full mt-8'>
            <h3 className='font-semibold text-lg mb-3'>Report an Issue</h3>
            <form onSubmit={onSubmit} className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              <input name='name' value={form.name} onChange={onChange} placeholder='Your name' className='border px-3 py-2' required />
              <input name='email' value={form.email} onChange={onChange} placeholder='Your email' className='border px-3 py-2' required />
              <input name='subject' value={form.subject} onChange={onChange} placeholder='Subject' className='border px-3 py-2 sm:col-span-2' required />
              <div>
                <label className='text-sm text-gray-600'>Category</label>
                <select name='category' value={form.category} onChange={onChange} className='border px-3 py-2 w-full mt-1'>
                  <option>Delivery</option>
                  <option>Payment</option>
                  <option>Product</option>
                  <option>Account</option>
                  <option>Other</option>
                </select>
              </div>
              <input name='orderId' value={form.orderId} onChange={onChange} placeholder='Order ID (optional)' className='border px-3 py-2' />
              <textarea name='message' value={form.message} onChange={onChange} placeholder='Describe the issue' className='border px-3 py-2 sm:col-span-2 min-h-28' required />
              <div className='sm:col-span-2 text-right'>
                <button disabled={submitting} type='submit' className='bg-black text-white px-6 py-2'>{submitting ? 'Submitting...' : 'Submit issue'}</button>
              </div>
            </form>
          </div>
        </div>
      </div>

    </div>
  )
}

export default Contact
