import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { ShopContext } from '../context/ShopContext.jsx';

const Hero = () => {
    const { backendUrl } = useContext(ShopContext);
  const [banners, setBanners] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
                const response = await axios.get(`${backendUrl}/api/banner/list?activeOnly=true`);
        if (response.data.success) {
          setBanners(response.data.banners);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };
    fetchBanners();
    }, [backendUrl]);

  const goTo = (i) => {
    if (banners.length > 0) {
      setIndex((i + banners.length) % banners.length);
    }
  };

  useEffect(() => {
    if (banners.length > 0) {
      const t = setInterval(() => setIndex((i) => (i + 1) % banners.length), 4000);
      return () => clearInterval(t);
    }
  }, [banners.length]);

  if (banners.length === 0) {
    return <div className='w-full h-64 bg-gray-200 flex items-center justify-center'>Loading banners...</div>;
  }

  return (
    <div className='relative overflow-hidden'>
      {/* track */}
      <div
        className='flex transition-transform duration-500 ease-in-out'
        style={{ width: `${banners.length * 100}%`, transform: `translateX(-${index * (100 / banners.length)}%)` }}
      >
        {banners.map((banner, i) => (
          <a href={banner.link || '#'} key={banner._id} className='w-full flex-shrink-0' style={{ width: `${100 / banners.length}%` }} target="_blank" rel="noopener noreferrer">
            <div className='flex flex-col sm:flex-row border border-gray-400'>
              {/* Hero Left Side */}
              <div className='w-full sm:w-1/2 flex items-center justify-center py-10 sm:py-0'>
                <div className='text-[#414141] text-center'>
                  <div className='flex items-center gap-2 justify-center'>
                    <p className='w-8 md:w-11 h-[2px] bg-[#414141]'></p>
                    <p className='font-medium text-sm md:text-base'>NEW COLLECTION</p>
                  </div>
                  <h1 className='prata-regular text-3xl sm:py-3 lg:text-5xl leading-relaxed'>{banner.title || 'Latest Arrivals'}</h1>
                  <div className='flex items-center gap-2 justify-center'>
                    <p className='font-semibold text-sm md:text-base'>SHOP NOW</p>
                    <p className='w-8 md:w-11 h-[1px] bg-[#414141]'></p>
                  </div>
                </div>
              </div>
              {/* Hero Right Side */}
              <img className='w-full sm:w-1/2 h-64 sm:h-auto object-cover' src={banner.imageUrl} alt={banner.title || `banner-${i + 1}`} />
            </div>
          </a>
        ))}
      </div>

      {/* dots */}
      <div className='absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2'>
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full ${i === index ? 'bg-black' : 'bg-black/50'} border border-white`}
          />
        ))}
      </div>
    </div>
  )
}

export default Hero
