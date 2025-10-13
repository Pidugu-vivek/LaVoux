import React, { useState, useContext } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext';
import Title from './Title';

const FeedbackForm = ({ order, onClose }) => {
    const { backendUrl, token } = useContext(ShopContext);
    const [deliveryRating, setDeliveryRating] = useState(0);
    const [deliveryComment, setDeliveryComment] = useState('');
    const [productReviews, setProductReviews] = useState(
        order.items.map(item => ({ product: item._id, rating: 0, comment: '' }))
    );

    const handleProductReviewChange = (index, field, value) => {
        const updatedReviews = [...productReviews];
        updatedReviews[index][field] = value;
        setProductReviews(updatedReviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const reviewData = {
            orderId: order._id,
            deliveryRating,
            deliveryComment,
            productReviews
        };

        console.log('Submitting review data:', reviewData);

        try {
            const response = await axios.post(`${backendUrl}/api/review/submit`, reviewData, { headers: { token } });
            
            console.log('Server response:', response.data);

            if (response.data.success) {
                onClose(); // Close modal on success
            } else {
                console.error('Failed to submit review:', response.data.message);
                alert('Error: ' + response.data.message);
            }
        } catch (error) {
            console.error('Error submitting review:', error.response ? error.response.data : error.message);
            alert('An error occurred while submitting your review. Please try again.');
        }
    };

    return (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center'>
            <div className='bg-white p-8 rounded-lg w-full max-w-2xl'>
                <Title text1='Leave a' text2='Review' />
                <form onSubmit={handleSubmit}>
                    {/* Delivery Review */}
                    <div className='mt-4'>
                        <h3 className='text-lg font-medium'>Delivery Feedback</h3>
                        <div className='flex items-center gap-2 mt-2'>
                            {[...Array(5)].map((_, i) => (
                                <span key={i} onClick={() => setDeliveryRating(i + 1)} className={`cursor-pointer text-2xl ${i < deliveryRating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                            ))}
                        </div>
                        <textarea
                            className='w-full border rounded-md p-2 mt-2'
                            placeholder='Tell us about your delivery experience...'
                            value={deliveryComment}
                            onChange={(e) => setDeliveryComment(e.target.value)}
                        />
                    </div>

                    {/* Product Reviews */}
                    <div className='mt-6'>
                        <h3 className='text-lg font-medium'>Product Reviews</h3>
                        {order.items.map((item, index) => (
                            <div key={item._id} className='mt-4 border-t pt-4'>
                                <p className='font-medium'>{item.name}</p>
                                <div className='flex items-center gap-2 mt-2'>
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} onClick={() => handleProductReviewChange(index, 'rating', i + 1)} className={`cursor-pointer text-2xl ${i < productReviews[index].rating ? 'text-yellow-500' : 'text-gray-300'}`}>★</span>
                                    ))}
                                </div>
                                <textarea
                                    className='w-full border rounded-md p-2 mt-2'
                                    placeholder={`What did you think of ${item.name}?`}
                                    value={productReviews[index].comment}
                                    onChange={(e) => handleProductReviewChange(index, 'comment', e.target.value)}
                                />
                            </div>
                        ))}
                    </div>

                    <div className='flex justify-end gap-4 mt-6'>
                        <button type='button' onClick={onClose} className='border px-4 py-2 text-sm font-medium rounded-sm'>Cancel</button>
                        <button type='submit' className='bg-black text-white px-4 py-2 text-sm font-medium rounded-sm'>Submit Review</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeedbackForm;
