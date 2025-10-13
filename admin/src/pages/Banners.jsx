import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';

const Banners = ({ token }) => {
    const [banners, setBanners] = useState([]);
    const [newBanner, setNewBanner] = useState({ title: '', link: '', order: 0, active: true, image: null });
    const [editingBanner, setEditingBanner] = useState(null);

    const fetchBanners = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/banner/list`);
            if (response.data.success) {
                setBanners(response.data.banners);
            }
        } catch (error) {
            toast.error('Failed to fetch banners');
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        const banner = editingBanner ? { ...editingBanner } : { ...newBanner };
        if (type === 'file') {
            banner.image = files[0];
        } else if (type === 'checkbox') {
            banner.active = checked;
        } else {
            banner[name] = value;
        }
        if (editingBanner) {
            setEditingBanner(banner);
        } else {
            setNewBanner(banner);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const bannerData = new FormData();
        const banner = editingBanner || newBanner;

        Object.keys(banner).forEach(key => {
            if (key !== 'image' || banner.image) {
                bannerData.append(key, banner[key]);
            }
        });

        try {
            let response;
            if (editingBanner) {
                response = await axios.put(`${backendUrl}/api/banner/update/${editingBanner._id}`, bannerData, { headers: { token } });
            } else {
                response = await axios.post(`${backendUrl}/api/banner/add`, bannerData, { headers: { token } });
            }

            if (response.data.success) {
                toast.success(editingBanner ? 'Banner updated successfully' : 'Banner added successfully');
                setNewBanner({ title: '', link: '', order: 0, active: true, image: null });
                setEditingBanner(null);
                fetchBanners();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${backendUrl}/api/banner/remove/${id}`, { headers: { token } });
            if (response.data.success) {
                toast.success('Banner removed successfully');
                fetchBanners();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const startEditing = (banner) => {
        setEditingBanner({ ...banner, image: null });
    };

    return (
        <div className='p-4'>
            <h2 className='text-xl font-semibold mb-4'>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h2>
            <form onSubmit={handleSubmit} className='mb-8 p-4 border rounded-lg bg-white'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <input name='title' value={editingBanner?.title || newBanner.title} onChange={handleInputChange} placeholder='Title' className='p-2 border rounded' />
                    <input name='link' value={editingBanner?.link || newBanner.link} onChange={handleInputChange} placeholder='Link URL' className='p-2 border rounded' />
                    <input name='order' type='number' value={editingBanner?.order || newBanner.order} onChange={handleInputChange} placeholder='Order' className='p-2 border rounded' />
                    <div className='flex items-center gap-2'>
                        <input name='active' type='checkbox' checked={editingBanner?.active ?? newBanner.active} onChange={handleInputChange} className='h-5 w-5' />
                        <label>Active</label>
                    </div>
                    <input name='image' type='file' onChange={handleInputChange} className='p-2 border rounded col-span-2' />
                </div>
                <div className='mt-4'>
                    <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded mr-2'>{editingBanner ? 'Update Banner' : 'Add Banner'}</button>
                    {editingBanner && <button onClick={() => setEditingBanner(null)} className='bg-gray-500 text-white px-4 py-2 rounded'>Cancel</button>}
                </div>
            </form>

            <h2 className='text-xl font-semibold mb-4'>Existing Banners</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                {banners.map(banner => (
                    <div key={banner._id} className='border rounded-lg p-4 bg-white'>
                        <img src={banner.imageUrl} alt={banner.title} className='w-full h-32 object-cover rounded-md mb-4' />
                        <h3 className='font-semibold'>{banner.title}</h3>
                        <p className='text-sm text-gray-500'>Order: {banner.order}</p>
                        <p className='text-sm text-gray-500'>Active: {banner.active ? 'Yes' : 'No'}</p>
                        <div className='mt-4'>
                            <button onClick={() => startEditing(banner)} className='bg-yellow-500 text-white px-3 py-1 rounded text-sm mr-2'>Edit</button>
                            <button onClick={() => handleDelete(banner._id)} className='bg-red-500 text-white px-3 py-1 rounded text-sm'>Delete</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Banners;
