import React, { useContext, useState, useEffect } from 'react'
import Title from '../components/Title'
import CartTotal from '../components/CartTotal'
import { assets } from '../assets/assets'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
const PlaceOrder = () => {

    const [method, setMethod] = useState('cod');
    const { navigate, backendUrl, token, cartItems, setCartItems, getCartAmount, delivery_fee, products, discountAmount } = useContext(ShopContext);
    const [addresses, setAddresses] = useState([]);
    const [userEmail, setUserEmail] = useState('');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        street: '',
        city: '',
        state: '',
        zipcode: '',
        country: '',
        phone: ''
    })

    useEffect(() => {
        // Require login
        if (!token) {
            toast.info('Please login to place an order')
            navigate('/login')
            return
        }
        // Block if cart empty (but allow success overlay to show after placing order)
        if (!showSuccess && getCartAmount() <= 0) {
            toast.info('No products available in your cart')
            navigate('/')
            return;
        }
        // Fetch profile addresses
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get(backendUrl + '/api/user/profile', { headers: { token } });
                if (data.success) {
                    const addrs = data.user.addresses || [];
                    setAddresses(addrs);
                    setUserEmail(data.user.email || '');
                    // seed email into form once
                    setFormData(prev => ({ ...prev, email: prev.email || data.user.email || '' }));
                    if (addrs.length > 0) {
                        const primary = addrs.find(a => a.isPrimary) || addrs[0];
                        setSelectedAddress(primary);
                    } else {
                        setShowAddressForm(true);
                    }
                }
            } catch (e) {
                // if profile fetch fails, fall back to form
                setShowAddressForm(true);
            }
        };
        fetchProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, cartItems, products, showSuccess])


    const onChangeHandler = (event) => {
        const name = event.target.name
        const value = event.target.value
        setFormData(data => ({ ...data, [name]: value }))
    }


    const onSubmitHandler = async (event) => {
        event.preventDefault()
        try {
            // Guard: block submission if cart empty
            if (getCartAmount() <= 0) {
               toast.info('No products available in your cart')
               return
            }
            if (!token) {
               toast.error('You must be logged in to proceed')
               navigate('/login')
               return
            }

            let orderItems = []

            for (const items in cartItems) {
                for (const item in cartItems[items]) {
                    if (cartItems[items][item] > 0) {
                        const itemInfo = structuredClone(products.find(product => product._id === items))
                        if (itemInfo) {
                            itemInfo.size = item
                            itemInfo.quantity = cartItems[items][item]
                            orderItems.push(itemInfo)
                        }
                    }
                }
            }

            // basic phone validation (7-15 digits)
            const phoneRaw = showAddressForm ? (formData.phone || '') : (selectedAddress?.phone || '');
            const phoneDigits = String(phoneRaw).replace(/\D/g, '');
            if (phoneDigits.length < 7 || phoneDigits.length > 15) {
                toast.error('Please enter a valid phone number');
                return;
            }

            // derive address to send
            let addressPayload;
            if (addresses.length > 0 && !showAddressForm && selectedAddress) {
                // map saved address format to order payload
                addressPayload = {
                    firstName: selectedAddress.firstName || formData.firstName,
                    lastName: selectedAddress.lastName || formData.lastName,
                    email: formData.email,
                    street: selectedAddress.line1 || '',
                    city: selectedAddress.city || '',
                    state: selectedAddress.state || '',
                    zipcode: selectedAddress.zip || '',
                    country: selectedAddress.country || '',
                    phone: selectedAddress.phone || formData.phone
                };
            } else {
                // using typed form; also upsert to profile before placing order
                addressPayload = { ...formData };
                try {
                    await axios.post(
                        backendUrl + '/api/user/profile/update',
                        {
                            email: formData.email,
                            address: {
                                firstName: formData.firstName,
                                lastName: formData.lastName,
                                phone: formData.phone,
                                line1: formData.street,
                                line2: '',
                                city: formData.city,
                                state: formData.state,
                                zip: formData.zipcode,
                                country: formData.country,
                                isPrimary: true
                            }
                        },
                        { headers: { token } }
                    );
                } catch (_) {
                    // non-blocking; continue with order
                }
            }

            let orderData = {
                address: addressPayload,
                items: orderItems,
                amount: getCartAmount() - discountAmount + delivery_fee
            }
            

            switch (method) {

                // API Calls for COD
                case 'cod':
                    const response = await axios.post(backendUrl + '/api/order/place',orderData,{headers:{token}})
                    if (response.data.success) {
                        setCartItems({})
                        setShowSuccess(true)
                        // Redirect after short delay so user sees the animation
                        setTimeout(() => {
                            navigate('/orders')
                        }, 1600)
                    } else {
                        toast.error(response.data.message)
                    }
                    break;

                case 'stripe':
                    const responseStripe = await axios.post(backendUrl + '/api/order/stripe',orderData,{headers:{token}})
                    if (responseStripe.data.success) {
                        const {session_url} = responseStripe.data
                        window.location.replace(session_url)
                    } else {
                        toast.error(responseStripe.data.message)
                    }
                    break;

                default:
                    break;
            }


        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }


    return (
        <>
        {showSuccess && (
            <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
                <div className='bg-white rounded-lg p-8 text-center shadow-xl'>
                    <div className='relative mx-auto mb-4 h-16 w-16'>
                        <span className='absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75 animate-ping'></span>
                        <div className='relative h-16 w-16 rounded-full bg-green-500 flex items-center justify-center text-white'>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className='h-8 w-8'>
                                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                    <h3 className='text-lg font-semibold'>Order placed</h3>
                    <p className='text-sm text-gray-600 mt-1'>Redirecting to your orders...</p>
                </div>
            </div>
        )}
        <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t'>
            {/* ------------- Left Side ---------------- */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl my-3'>
                    <Title text1={'DELIVERY'} text2={'INFORMATION'} />
                </div>

                {addresses.length > 0 && !showAddressForm ? (
                    <div>
                        <p className='font-semibold mb-2'>Select a delivery address:</p>
                        {addresses.map(addr => (
                            <div
                                key={addr._id}
                                onClick={() => setSelectedAddress(addr)}
                                className={`p-3 border rounded mb-2 cursor-pointer ${selectedAddress?._id === addr._id ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                            >
                                <p className='font-bold'>{addr.label || 'Address'}</p>
                                <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                                <p>{addr.city}, {addr.state} {addr.zip}</p>
                                <p>{addr.country}</p>
                                {selectedAddress?._id === addr._id && (
                                  <div className='mt-2'>
                                    <button
                                      type='button'
                                      className='text-blue-600 underline text-sm'
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowAddressForm(true);
                                        setFormData(prev => ({
                                          ...prev,
                                          email: userEmail || prev.email || '',
                                          firstName: addr.firstName || '',
                                          lastName: addr.lastName || '',
                                          phone: addr.phone || '',
                                          street: addr.line1 || '',
                                          city: addr.city || '',
                                          state: addr.state || '',
                                          zipcode: addr.zip || '',
                                          country: addr.country || ''
                                        }));
                                      }}
                                    >
                                      Edit this address
                                    </button>
                                  </div>
                                )}
                            </div>
                        ))}
                        <button type='button' onClick={() => setShowAddressForm(true)} className='text-blue-600 mt-2'>+ Add a new address</button>
                    </div>
                ) : (
                    <div>
                        <div className='flex gap-3'>
                            <input required onChange={onChangeHandler} name='firstName' value={formData.firstName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='First name' />
                            <input required onChange={onChangeHandler} name='lastName' value={formData.lastName} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Last name' />
                        </div>
                        <input required onChange={onChangeHandler} name='email' value={formData.email} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="email" placeholder='Email address' />
                        <input required onChange={onChangeHandler} name='street' value={formData.street} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Street' />
                        <div className='flex gap-3'>
                            <input required onChange={onChangeHandler} name='city' value={formData.city} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='City' />
                            <input onChange={onChangeHandler} name='state' value={formData.state} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='State' />
                        </div>
                        <div className='flex gap-3'>
                            <input required onChange={onChangeHandler} name='zipcode' value={formData.zipcode} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="number" placeholder='Zipcode' />
                            <input required onChange={onChangeHandler} name='country' value={formData.country} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="text" placeholder='Country' />
                        </div>
                        <input required onChange={onChangeHandler} name='phone' value={formData.phone} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' type="tel" placeholder='Phone' />
                    </div>
                )}

            </div>

            {/* ------------- Right Side ------------------ */}
            <div className='mt-8'>
                <div className='mt-8 min-w-80'>
                    <CartTotal subtotal={getCartAmount()} discount={discountAmount} />
                </div>

                <div className='mt-12'>
                    {/* --------------- Payment Method Selection ------------- */}
                    <div className='flex gap-3 flex-col lg:flex-row'>
                        <div onClick={() => setMethod('stripe')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'stripe' ? 'bg-green-400' : ''}`}></p>
                            <img className='h-5 mx-4' src={assets.stripe_logo} alt="" />
                        </div>
                        <div onClick={() => setMethod('cod')} className='flex items-center gap-3 border p-2 px-3 cursor-pointer'>
                            <p className={`min-w-3.5 h-3.5 border rounded-full ${method === 'cod' ? 'bg-green-400' : ''}`}></p>
                            <p className='text-gray-500 text-sm font-medium mx-4'>CASH ON DELIVERY</p>
                        </div>
                    </div>

                    <div className='w-full text-end mt-8'>
                        <button type='submit' className='bg-black text-white px-16 py-3 text-sm'>PLACE ORDER</button>
                    </div>
                </div>
            </div>
        </form>
        </>
    )
}

export default PlaceOrder
