import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from '../components/Title';
import axios from 'axios';
import FeedbackForm from '../components/FeedbackForm';

const Orders = () => {

  const { backendUrl, token , currency} = useContext(ShopContext);

  const [orders, setOrders] = useState([]);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleOpenFeedbackModal = (order) => {
    setSelectedOrder(order);
    setShowFeedbackModal(true);
  };

  const handleCloseFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedOrder(null);
    loadOrderData(); // Refresh orders to update feedback status
  };

  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.post(`${backendUrl}/api/order/userorders`, {}, { headers: { token } });
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      console.error("Error loading orders:", error);
    }
  };

  useEffect(()=>{
    loadOrderData()
  },[token])

  return (
    <div className='border-t pt-16'>

        <div className='text-2xl'>
            <Title text1={'MY'} text2={'ORDERS'}/>
        </div>

        <div>
            {
              orders.map((order) => (
                <div key={order._id} className='py-4 border-t border-b text-gray-700 flex flex-col gap-4'>
                  <div className='flex justify-between items-center'>
                    <div>
                      <p className='font-medium'>Order ID: {order._id}</p>
                      <p className='text-sm text-gray-500'>Date: {new Date(order.date).toDateString()}</p>
                      <p className='text-sm text-gray-500'>Payment: {order.paymentMethod}</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      <p className={`min-w-2 h-2 rounded-full ${order.status === 'Delivered' ? 'bg-green-500' : 'bg-yellow-500'}`}></p>
                      <p className='text-sm md:text-base'>{order.status}</p>
                    </div>
                  </div>
                  {order.items.map((item) => {
                    const productReview = order.review?.productReviews.find(pr => pr.product === item._id);
                    return (
                      <div key={item._id} className='flex flex-col gap-2 text-sm'>
                        <div className='flex items-start gap-6'>
                          <img className='w-16 sm:w-20' src={item.image[0]} alt="" />
                          <div>
                            <p className='sm:text-base font-medium'>{item.name}</p>
                            <div className='flex items-center gap-3 mt-1 text-base text-gray-700'>
                              <p>{currency}{item.price}</p>
                              <p>Quantity: {item.quantity}</p>
                              <p>Size: {item.size}</p>
                            </div>
                          </div>
                        </div>
                        {productReview && (
                          <div className='pl-22 mt-2 text-xs'>
                            <div className='flex items-center gap-1'>
                              <p className='font-medium'>Your Rating:</p>
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-lg ${i < productReview.rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                              ))}
                            </div>
                            {productReview.comment && <p className='mt-1 text-gray-600'>"{productReview.comment}"</p>}
                          </div>
                        )}
                      </div>
                    );
                  })} 
                  {order.review && (
                    <div className='mt-4 pt-4 border-t text-sm'>
                      <h4 className='font-medium'>Delivery Feedback</h4>
                      <div className='flex items-center gap-1 mt-1'>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xl ${i < order.review.deliveryRating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                        ))}
                      </div>
                      {order.review.deliveryComment && <p className='mt-1 text-gray-600'>"{order.review.deliveryComment}"</p>}
                    </div>
                  )}
                  <div className='flex justify-end gap-4 mt-4'>
                    <button onClick={() => window.location.href=`/track/${order._id}`} className='border px-4 py-2 text-sm font-medium rounded-sm'>Track Order</button>
                    {order.status === 'Delivered' && !order.feedbackSubmitted && (
                      <button onClick={() => handleOpenFeedbackModal(order)} className='bg-black text-white px-4 py-2 text-sm font-medium rounded-sm'>Leave a Review</button>
                    )}
                  </div>
                </div>
              ))
            }
        </div>
        {showFeedbackModal && selectedOrder && (
            <FeedbackForm order={selectedOrder} onClose={handleCloseFeedbackModal} />
        )}
    </div>
  )
}

export default Orders
