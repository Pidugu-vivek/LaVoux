import React, { useEffect, useState, useContext } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const Profile = () => {
  const { backendUrl, token, navigate } = useContext(ShopContext)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // UI state
  const [tab, setTab] = useState('security') // 'security' | 'address' | 'manage'
  const [form, setForm] = useState({ name: '', email: '', phone: '' })
  const [editMode, setEditMode] = useState({ name: false, email: false, phone: false })
  const [savingField, setSavingField] = useState({ name: false, email: false, phone: false })

  // OTP state
  const [otpVisible, setOtpVisible] = useState(false)
  const [otpValue, setOtpValue] = useState('')
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [otpVerified, setOtpVerified] = useState(false)

  // password change form state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [changingPassword, setChangingPassword] = useState(false)

  // address form state
  const [addressForm, setAddressForm] = useState({ _id: '', firstName: '', lastName: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '', country: '', isPrimary: false })
  const [addressEditMode, setAddressEditMode] = useState(false)
  const [savingAddress, setSavingAddress] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        navigate('/login')
        return
      }
      try {
        const res = await axios.get(backendUrl + '/api/user/profile', { headers: { token } })
        if (res.data.success) {
          setUser(res.data.user)
          setForm({
            name: res.data.user.name || '',
            email: res.data.user.email || '',
            phone: res.data.user.phone || ''
          })
          // seed address form from user data
          const a = res.data.user.address || (res.data.user.addresses?.[0]) || {}
          setAddressForm({
            _id: a._id || '',
            firstName: a.firstName || '',
            lastName: a.lastName || '',
            phone: a.phone || '',
            line1: a.line1 || '',
            line2: a.line2 || '',
            city: a.city || '',
            state: a.state || '',
            zip: a.zip || '',
            country: a.country || '',
            isPrimary: !!a.isPrimary
          })
        } else {
          if (res.data.message && res.data.message.toLowerCase().includes('not authorized')) {
            navigate('/login'); return
          }
          toast.error(res.data.message || 'Failed to load profile')
        }
      } catch (err) {
        toast.error(err.response?.data?.message || err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [token])

  const toggleEdit = (field) => setEditMode(e => ({ ...e, [field]: !e[field] }))

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const saveField = async (field) => {
    if (!token) return navigate('/login')
    const value = form[field]?.trim?.()
    if (!value && field !== 'phone') return toast.error('Value required')
    try {
      setSavingField(s => ({ ...s, [field]: true }))
      const payload = { [field]: value }
      const res = await axios.post(backendUrl + '/api/user/profile/update', payload, { headers: { token } })
      if (res.data.success) {
        setUser(res.data.user)
        setForm(f => ({ ...f, [field]: res.data.user[field] || '' }))
        setEditMode(e => ({ ...e, [field]: false }))
        toast.success('Saved')
      } else {
        toast.error(res.data.message || 'Update failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setSavingField(s => ({ ...s, [field]: false }))
    }
  }

  const onOtpVerify = async () => {
    if (!otpValue || otpValue.length !== 6) return toast.error('Enter 6-digit code')
    try {
      setVerifyingOtp(true)
      const res = await axios.post(backendUrl + '/api/user/profile/verify-otp', { otp: otpValue }, { headers: { token } })
      if (res.data.success) {
        toast.success('Code verified — you can change password now')
        setOtpVerified(true)
        setOtpVisible(false)
      } else {
        toast.error(res.data.message || 'Verification failed')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setVerifyingOtp(false)
    }
  }

  const onChangePw = (e) => setPwForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const onChangeAddress = (e) => {
    const { name, value, type, checked } = e.target
    setAddressForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  const startAddAddress = () => {
    setAddressForm({ _id: '', firstName: '', lastName: '', phone: '', line1: '', line2: '', city: '', state: '', zip: '', country: '', isPrimary: !(user?.addresses?.some(a => a.isPrimary)) })
    setAddressEditMode(true)
  }

  const startEditAddress = (id) => {
    // prefill from address by id, fallback to primary
    const a = (user?.addresses || []).find(x => String(x._id) === String(id)) || user?.address || {}
    setAddressForm({
      _id: a._id || '',
      firstName: a.firstName || '',
      lastName: a.lastName || '',
      phone: a.phone || '',
      line1: a.line1 || '',
      line2: a.line2 || '',
      city: a.city || '',
      state: a.state || '',
      zip: a.zip || '',
      country: a.country || '',
      isPrimary: !!a.isPrimary
    })
    setAddressEditMode(true)
  }

  const saveAddress = async () => {
    if (!token) return navigate('/login')
    if (!addressForm.line1 || !addressForm.city || !addressForm.country) {
      toast.error('Please fill Line 1, City and Country')
      return
    }
    try {
      setSavingAddress(true)
      // Reuse profile update endpoint to upsert address
      const payload = { address: { ...addressForm } }
      if (!payload.address._id) delete payload.address._id
      const res = await axios.post(backendUrl + '/api/user/profile/update', payload, { headers: { token } })
      if (res.data.success) {
        setUser(res.data.user)
        // ensure form reflects saved address
        const a = res.data.user.address || res.data.user.addresses?.find(x => x._id === addressForm._id) || res.data.user.addresses?.[0] || addressForm
        setAddressForm({
          _id: a._id || '', line1: a.line1 || '', line2: a.line2 || '', city: a.city || '', state: a.state || '', zip: a.zip || '', country: a.country || '', isPrimary: !!a.isPrimary
        })
        setAddressEditMode(false)
        toast.success('Address saved')
      } else {
        toast.error(res.data.message || 'Failed to save address')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setSavingAddress(false)
    }
  }

  const submitPasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('New passwords do not match')
    if (pwForm.newPassword.length < 8) return toast.error('New password must be at least 8 chars')
    try {
      setChangingPassword(true)
      const res = await axios.post(backendUrl + '/api/user/profile/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }, { headers: { token } })
      if (res.data.success) {
        toast.success(res.data.message || 'Password changed')
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        setOtpVerified(false)
      } else {
        toast.error(res.data.message || 'Failed to change password')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message)
    } finally {
      setChangingPassword(false)
    }
  }

  if (loading) return <div className='min-h-[60vh] flex items-center justify-center'>Loading...</div>
  if (!user) return <div className='min-h-[60vh] flex items-center justify-center'>No profile found.</div>

  return (
    <div className='min-h-[60vh]'>
      <div className='max-w-3xl mx-auto py-8'>
        <h2 className='text-2xl mb-6'>My Account</h2>

        <div className='flex gap-4 mb-6'>
          <button onClick={() => setTab('security')} className={`px-4 py-2 border ${tab === 'security' ? 'bg-gray-100' : ''}`}>Login & security</button>
          <button onClick={() => setTab('address')} className={`px-4 py-2 border ${tab === 'address' ? 'bg-gray-100' : ''}`}>Your address</button>
          <button onClick={() => setTab('manage')} className={`px-4 py-2 border ${tab === 'manage' ? 'bg-gray-100' : ''}`}>Manage your seller account</button>
        </div>

        {tab === 'manage' && (
          <div className='border p-6 rounded'>
            <h3 className='font-semibold mb-3'>Manage your seller account</h3>
            <p className='text-sm text-gray-600 mb-4'>Placeholder for seller settings. Implement seller onboarding here.</p>
            <button onClick={() => toast.info('Seller settings not implemented yet')} className='px-4 py-2 bg-black text-white'>Open seller settings</button>
          </div>
        )}

        {tab === 'address' && (
          <div className='border p-6 rounded'>
            <h3 className='font-semibold mb-3'>Your address</h3>

            {!addressEditMode ? (
              <>
                <div className='space-y-4'>
                  {(user?.addresses?.length ? user.addresses : (user?.address ? [user.address] : [])).length ? (
                    <ul className='divide-y'>
                      {(user.addresses?.length ? user.addresses : [user.address]).map((a) => (
                        <li key={a._id || a.line1} className='py-2 flex items-start justify-between gap-4'>
                          <div className='text-sm text-gray-700'>
                            <p className='font-medium'>
                              {a.label || 'Address'} {a.isPrimary && <span className='ml-2 text-xs text-green-700 border border-green-700 px-1 rounded'>Primary</span>}
                            </p>
                            {(a.firstName || a.lastName) && (
                              <p>{[a.firstName, a.lastName].filter(Boolean).join(' ')}</p>
                            )}
                            {a.phone && <p>Phone: {a.phone}</p>}
                            <p>{a.line1}</p>
                            {a.line2 && <p>{a.line2}</p>}
                            <p>{[a.city, a.state, a.zip].filter(Boolean).join(', ')}</p>
                            <p>{a.country}</p>
                          </div>
                          <div className='flex gap-2'>
                            {!a.isPrimary && (
                              <button onClick={async () => {
                                try {
                                  const res = await axios.post(backendUrl + '/api/user/profile/update', { address: { _id: a._id, isPrimary: true } }, { headers: { token } })
                                  if (res.data.success) setUser(res.data.user)
                                  else toast.error(res.data.message || 'Failed to set primary')
                                } catch (err) {
                                  toast.error(err.response?.data?.message || err.message)
                                }
                              }} className='px-3 py-1 border text-xs'>Set Primary</button>
                            )}
                            <button onClick={() => startEditAddress(a._id)} className='px-3 py-1 border text-xs'>Edit</button>
                            <button onClick={async () => {
                              if (!confirm('Delete this address?')) return
                              try {
                                const res = await axios.post(backendUrl + '/api/user/profile/update', { address: { _id: a._id, delete: true } }, { headers: { token } })
                                if (res.data.success) setUser(res.data.user)
                                else toast.error(res.data.message || 'Failed to delete address')
                              } catch (err) {
                                toast.error(err.response?.data?.message || err.message)
                              }
                            }} className='px-3 py-1 border text-xs text-red-600'>Delete</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className='text-gray-500 text-sm'>No address saved.</p>
                  )}
                  <div className='pt-2'>
                    <button onClick={startAddAddress} className='px-4 py-2 border'>Add address</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm text-gray-600'>First name</label>
                    <input name='firstName' value={addressForm.firstName} onChange={onChangeAddress} className='w-full border px-3 py-2 mt-1' />
                  </div>
                  <div>
                    <label className='text-sm text-gray-600'>Last name</label>
                    <input name='lastName' value={addressForm.lastName} onChange={onChangeAddress} className='w-full border px-3 py-2 mt-1' />
                  </div>
                  <div className='sm:col-span-2'>
                    <label className='text-sm text-gray-600'>Phone</label>
                    <input name='phone' value={addressForm.phone} onChange={onChangeAddress} className='w-full border px-3 py-2 mt-1' />
                  </div>
                  <div>
                    <label className='text-sm text-gray-600'>Address line 1</label>
                    <input name='line1' value={addressForm.line1} onChange={onChangeAddress} className='w-full border px-3 py-2 mt-1' required />
                  </div>
                  <div>
                    <label className='text-sm text-gray-600'>Address line 2</label>
                    <input name='line2' value={addressForm.line2} onChange={onChangeAddress} className='w-full border px-3 py-2 mt-1' />
                  </div>
                  <div>
                    <label className='text-sm text-gray-600'>City</label>
                    <input name='city' value={addressForm.city} onChange={onChangeAddress} className='w-full border px-3 py-2 mt-1' required />
                  </div>
                  <div>
                    <label className='text-sm text-gray-600'>State</label>
                    <input name='state' value={addressForm.state} onChange={onChangeAddress} className='w-full border px-3 py-2 mt-1' />
                  </div>
                  <div>
                    <label className='text-sm text-gray-600'>ZIP / Postal code</label>
                    <input name='zip' value={addressForm.zip} onChange={onChangeAddress} className='w-full border px-3 py-2 mt-1' />
                  </div>
                  <div>
                    <label className='text-sm text-gray-600'>Country</label>
                    <input name='country' value={addressForm.country} onChange={onChangeAddress} className='w-full border px-3 py-2 mt-1' required />
                  </div>
                  <div className='sm:col-span-2'>
                    <label className='inline-flex items-center gap-2 mt-2'>
                      <input type='checkbox' name='isPrimary' checked={!!addressForm.isPrimary} onChange={onChangeAddress} />
                      <span className='text-sm text-gray-700'>Make this my primary address</span>
                    </label>
                  </div>
                </div>
                <div className='mt-4 flex gap-3 justify-end'>
                  <button disabled={savingAddress} onClick={() => setAddressEditMode(false)} className='px-4 py-2 border'>Cancel</button>
                  <button disabled={savingAddress} onClick={saveAddress} className='px-4 py-2 bg-black text-white'>{savingAddress ? 'Saving...' : 'Save address'}</button>
                </div>
              </>
            )}
          </div>
        )}

        {tab === 'security' && (
          <div className='border p-6 rounded space-y-6'>
            <h3 className='font-semibold'>Login & security</h3>

            {/* NAME */}
            <div className='flex items-center justify-between gap-4'>
              <div className='flex-1'>
                <label className='text-sm text-gray-600'>Name</label>
                {editMode.name ? (
                  <input name='name' value={form.name} onChange={onChange} className='w-full border px-3 py-2 mt-1' />
                ) : (
                  <p className='mt-1'>{user.name}</p>
                )}
              </div>
              <div className='w-36 text-right'>
                {editMode.name ? (
                  <button disabled={savingField.name} onClick={() => saveField('name')} className='px-3 py-2 bg-black text-white'>{savingField.name ? 'Saving...' : 'Save'}</button>
                ) : (
                  <button onClick={() => toggleEdit('name')} className='px-3 py-2 border'>Edit</button>
                )}
              </div>
            </div>

            {/* EMAIL */}
            <div className='flex items-center justify-between gap-4'>
              <div className='flex-1'>
                <label className='text-sm text-gray-600'>Email</label>
                {editMode.email ? (
                  <input name='email' value={form.email} onChange={onChange} className='w-full border px-3 py-2 mt-1' />
                ) : (
                  <p className='mt-1'>{user.email}</p>
                )}
              </div>
              <div className='w-36 text-right'>
                {editMode.email ? (
                  <button disabled={savingField.email} onClick={() => saveField('email')} className='px-3 py-2 bg-black text-white'>{savingField.email ? 'Saving...' : 'Save'}</button>
                ) : (
                  <button onClick={() => toggleEdit('email')} className='px-3 py-2 border'>Edit</button>
                )}
              </div>
            </div>

            {/* PHONE */}
            <div className='flex items-center justify-between gap-4'>
              <div className='flex-1'>
                <label className='text-sm text-gray-600'>Phone</label>
                {editMode.phone ? (
                  <input name='phone' value={form.phone} onChange={onChange} className='w-full border px-3 py-2 mt-1' />
                ) : (
                  <p className='mt-1'>{user.phone || '—'}</p>
                )}
              </div>
              <div className='w-36 text-right'>
                {editMode.phone ? (
                  <button disabled={savingField.phone} onClick={() => saveField('phone')} className='px-3 py-2 bg-black text-white'>{savingField.phone ? 'Saving...' : 'Save'}</button>
                ) : (
                  <button onClick={() => toggleEdit('phone')} className='px-3 py-2 border'>Edit</button>
                )}
              </div>
            </div>

            {/* PASSWORD (masked) */}
            <div className='flex items-center justify-between gap-4 mt-4'>
              <div className='flex-1'>
                <label className='text-sm text-gray-600'>Password</label>
                <p className='mt-1'>
                  {/* show bullets equal to password length from backend */}
                  {Array.from({ length: user.passwordLength || 8 }).map((_, i) => <span key={i}>•</span>)}
                </p>
                <p className='text-xs text-gray-400 mt-1'>Hidden for your security</p>
              </div>
              <div className='w-36 text-right'>
                <button onClick={async () => {
                  if (!token) { navigate('/login'); return }
                  try {
                    const res = await axios.post(backendUrl + '/api/user/profile/send-otp', {}, { headers: { token } })
                    if (res.data.success) {
                      toast.success(res.data.message || 'Verification code sent to your email')
                      setOtpVisible(true)
                      setOtpValue('')
                      // optional: log preview url if present
                      if (res.data.previewUrl) console.log('Email preview:', res.data.previewUrl)
                    } else {
                      toast.error(res.data.message || 'Failed to send code')
                    }
                  } catch (err) {
                    toast.error(err.response?.data?.message || err.message)
                  }
                }} className='px-3 py-2 border'>Edit</button>
              </div>
            </div>

            {/* OTP input */}
            {otpVisible && (
              <div className='mt-3 flex items-center gap-3'>
                <input value={otpValue} onChange={(e) => setOtpValue(e.target.value.replace(/\D/g,''))} maxLength={6} className='border px-3 py-2 w-36' placeholder='Enter 6-digit code' />
                <button disabled={verifyingOtp} onClick={onOtpVerify} className='px-3 py-2 bg-black text-white'>{verifyingOtp ? 'Verifying...' : 'Verify'}</button>
                <button onClick={() => { setOtpVisible(false); setOtpValue('') }} className='px-3 py-2 border'>Cancel</button>
              </div>
            )}

            {/* Change password form (shown after OTP verified) */}
            {otpVerified && (
              <form onSubmit={submitPasswordChange} className='mt-4 border p-4 rounded space-y-3'>
                <div>
                  <label className='text-sm text-gray-600'>Current password</label>
                  <input name='currentPassword' type='password' value={pwForm.currentPassword} onChange={onChangePw} className='w-full border px-3 py-2 mt-1' required />
                </div>
                <div>
                  <label className='text-sm text-gray-600'>New password</label>
                  <input name='newPassword' type='password' value={pwForm.newPassword} onChange={onChangePw} className='w-full border px-3 py-2 mt-1' required />
                </div>
                <div>
                  <label className='text-sm text-gray-600'>Re-enter new password</label>
                  <input name='confirmPassword' type='password' value={pwForm.confirmPassword} onChange={onChangePw} className='w-full border px-3 py-2 mt-1' required />
                </div>
                <div className='text-right'>
                  <button disabled={changingPassword} type='submit' className='px-4 py-2 bg-black text-white'>{changingPassword ? 'Saving...' : 'Change password'}</button>
                </div>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

export default Profile