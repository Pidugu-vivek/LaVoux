import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';

const Product = () => {

  const { productId } = useParams();
  const { products, currency ,addToCart, backendUrl, token } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState('')
  const [size,setSize] = useState('')
  const [avgRating, setAvgRating] = useState(0)
  const [numReviews, setNumReviews] = useState(0)
  const [reviews, setReviews] = useState([])
  const [ratingInput, setRatingInput] = useState(5)
  const [commentInput, setCommentInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [addedTick, setAddedTick] = useState(false)

  const fetchProductData = async () => {

    products.map((item) => {
      if (item._id === productId) {
        setProductData(item)
        setImage(item.image[0])
        return null;
      }
    })

  }

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/product/${productId}/reviews`)
      if (res.data.success) {
        setAvgRating(res.data.averageRating || 0)
        setNumReviews(res.data.numReviews || 0)
        setReviews(res.data.reviews || [])
      }
    } catch (err) {
      // silent fail; keep defaults
    }
  }

  const renderStars = (value) => {
    const filled = Math.round(Number(value) || 0)
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <img key={i} src={i <= filled ? assets.star_icon : assets.star_dull_icon} alt="" className="w-3 5" />
      )
    }
    return stars
  }

  const submitReview = async (e) => {
    e.preventDefault()
    if (!token) return
    try {
      setSubmitting(true)
      await axios.post(`${backendUrl}/api/product/${productId}/reviews`, { rating: ratingInput, comment: commentInput }, { headers: { token } })
      setCommentInput('')
      setRatingInput(5)
      await fetchReviews()
    } catch (err) {
      // optionally toast error
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    fetchProductData();
  }, [productId,products])

  useEffect(() => {
    if (productId) fetchReviews()
  }, [productId])

  const handleAddToCart = () => {
    addToCart(productData._id, size)
    setAddedTick(true)
    setTimeout(() => setAddedTick(false), 1200)
  }

  return productData ? (
    <div className='border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100'>
      {/*----------- Product Data-------------- */}
      <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>

        {/*---------- Product Images------------- */}
        <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
          <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
              {
                productData.image.map((item,index)=>(
                  <img onClick={()=>setImage(item)} src={item} key={index} className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer' alt="" />
                ))
              }
          </div>
          <div className='w-full sm:w-[80%]'>
              <img className='w-full h-auto' src={image} alt="" />
          </div>
        </div>

        {/* -------- Product Info ---------- */}
        <div className='flex-1'>
          <h1 className='font-medium text-2xl mt-2'>{productData.name}</h1>
          <div className=' flex items-center gap-1 mt-2'>
              {renderStars(avgRating)}
              <p className='pl-2'>({numReviews})</p>
          </div>
          <p className='mt-5 text-3xl font-medium'>{currency}{productData.price}</p>
          <p className='mt-5 text-gray-500 md:w-4/5'>{productData.description}</p>
          <div className='flex flex-col gap-4 my-8'>
              <p>Select Size</p>
              <div className='flex gap-2'>
                {productData.sizes.map((item,index)=>(
                  <button onClick={()=>setSize(item)} className={`border py-2 px-4 bg-gray-100 ${item === size ? 'border-orange-500' : ''}`} key={index}>{item}</button>
                ))}
              </div>
          </div>
          <div className='flex items-center gap-2'>
            <button onClick={handleAddToCart} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>ADD TO CART</button>
            {addedTick && (
              <div className='relative h-6 w-6'>
                <span className='absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75 animate-ping'></span>
                <div className='relative h-6 w-6 rounded-full bg-green-500 flex items-center justify-center text-white'>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className='h-4 w-4'>
                    <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            )}
          </div>
          <hr className='mt-8 sm:w-4/5' />
          <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
              <p>100% Original product.</p>
              <p>Cash on delivery is available on this product.</p>
              <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className='mt-20'>
        <div className='flex'>
          <b className='border px-5 py-3 text-sm'>Description</b>
          <p className='border px-5 py-3 text-sm'>Reviews ({numReviews})</p>
        </div>
        <div className='flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500'>
          <p>An e-commerce website is an online platform that facilitates the buying and selling of products or services over the internet. It serves as a virtual marketplace where businesses and individuals can showcase their products, interact with customers, and conduct transactions without the need for a physical presence. E-commerce websites have gained immense popularity due to their convenience, accessibility, and the global reach they offer.</p>
          <p>E-commerce websites typically display products or services along with detailed descriptions, images, prices, and any available variations (e.g., sizes, colors). Each product usually has its own dedicated page with relevant information.</p>
        </div>

        {/* Reviews list */}
        <div className='mt-6 border px-6 py-6'>
          <h3 className='font-medium mb-3'>Customer Reviews</h3>
          <div className='flex items-center gap-2 mb-4'>
            {renderStars(avgRating)}
            <span className='text-sm text-gray-600'>Average {avgRating.toFixed(1)} out of 5</span>
          </div>
          <div className='flex flex-col gap-4'>
            {reviews.length === 0 && <p className='text-sm text-gray-500'>No reviews yet.</p>}
            {reviews.map((r, idx) => (
              <div key={idx} className='border-b pb-3'>
                <div className='flex items-center gap-2 text-sm'>
                  {renderStars(r.rating)}
                  <span className='text-gray-600'>by {r.user?.name || 'Anonymous'}</span>
                </div>
                {r.comment && <p className='text-sm mt-1'>{r.comment}</p>}
              </div>
            ))}
          </div>

          {/* Review form (only if logged in) */}
          {token && (
            <form onSubmit={submitReview} className='mt-6 flex flex-col gap-3'>
              <div className='flex items-center gap-3'>
                <label className='text-sm'>Your rating:</label>
                <select value={ratingInput} onChange={e => setRatingInput(Number(e.target.value))} className='border px-2 py-1'>
                  {[5,4,3,2,1].map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <textarea value={commentInput} onChange={e => setCommentInput(e.target.value)} placeholder='Write a review (optional)' className='border p-2 min-h-24'></textarea>
              <button disabled={submitting} type='submit' className='bg-black text-white px-4 py-2 w-40'>
                {submitting ? 'Submitting...' : 'Submit review'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* --------- display related products ---------- */}

      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />

    </div>
  ) : <div className=' opacity-0'></div>
}

export default Product
