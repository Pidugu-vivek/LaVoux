import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios'

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = '₹';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [discountAmount, setDiscountAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Set up a global axios interceptor to catch auth errors (e.g., expired JWT)
    useEffect(() => {
        const respInterceptor = axios.interceptors.response.use(
            (response) => {
                // Handle API patterns that return 200 with success=false for auth errors
                try {
                    if (response?.data?.success === false) {
                        const msg = (response.data.message || '').toLowerCase()
                        if (msg.includes('jwt expired') || msg.includes('not authorized')) {
                            toast.info('Session expired. Please login again.')
                            localStorage.removeItem('token')
                            setToken('')
                            navigate('/login')
                        }
                    }
                } catch (_) { }
                return response
            },
            (error) => {
                const status = error?.response?.status
                const msg = (error?.response?.data?.message || error.message || '').toLowerCase()
                if (status === 401 || msg.includes('jwt expired') || msg.includes('not authorized')) {
                    toast.info('Session expired. Please login again.')
                    localStorage.removeItem('token')
                    setToken('')
                    navigate('/login')
                }
                return Promise.reject(error)
            }
        )
        return () => axios.interceptors.response.eject(respInterceptor)
    }, [navigate])

    const addToCart = async (itemId, size) => {

        if (!size) {
            toast.error('Select Product Size');
            return;
        }
        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }
        setCartItems(cartData);

        if (token) {
            try {

                await axios.post(backendUrl + '/api/cart/add', { itemId, size }, { headers: { token } })

            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }

    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalCount;
    }

    const updateQuantity = async (itemId, size, quantity) => {

        let cartData = structuredClone(cartItems);

        cartData[itemId][size] = quantity;

        setCartItems(cartData)

        if (token) {
            try {

                await axios.post(backendUrl + '/api/cart/update', { itemId, size, quantity }, { headers: { token } })

            } catch (error) {
                console.log(error)
                toast.error(error.message)
            }
        }

    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalAmount += itemInfo.price * cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalAmount;
    }

    const applyCoupon = (coupon, subtotal) => {
        if (coupon) {
            const discount = coupon.type === 'percent' ? subtotal * (coupon.value / 100) : coupon.value;
            setDiscountAmount(discount);
            setAppliedCoupon(coupon);
        } else {
            setDiscountAmount(0);
            setAppliedCoupon(null);
        }
    };

    const getProductsData = async () => {
        try {

            const response = await axios.get(backendUrl + '/api/product/list')
            if (response.data.success) {
                setProducts(response.data.products.reverse())
            } else {
                toast.error(response.data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const getUserCart = async ( token ) => {
        try {
            
            const response = await axios.post(backendUrl + '/api/cart/get',{},{headers:{token}})
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        async function loadData() {
            await getProductsData();
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                setToken(storedToken);
                await getUserCart(storedToken);
            }
            setLoading(false);
        }
        loadData();
    }, [])

    const value = {
        products, currency, delivery_fee,
        search, setSearch, showSearch, setShowSearch,
        cartItems, addToCart,setCartItems,
        getCartCount, updateQuantity,
        getCartAmount, navigate, backendUrl, getUserCart,
        setToken, token,
        appliedCoupon, discountAmount, applyCoupon,
        loading
    }

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;