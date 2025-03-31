import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { CartContext } from "../context/CartContext.jsx";
import { FaStar, FaCalendarAlt, FaTimesCircle } from "react-icons/fa";
import { FaTruckFast, FaLocationDot } from "react-icons/fa6";
import { toast } from "react-toastify";
import Slide from "../sections/Slide";
import Button from "../sections/Button.jsx";
import Loader from "../components/utils/Loader.jsx";

function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const { addToCart } = useContext(CartContext);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/products/')) {
            sessionStorage.setItem('lastPath', currentPath);
        }
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/${id}`);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }
                const data = await response.json();
                setProduct(data);
                setLoading(false);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/products`)
            .then((res) => {
                setProducts(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Failed to load products.");
                setLoading(false);
            });
    }, []);

    const handleAddToCart = async () => {
        try {
            if (!product) {
                toast.error("Product not available");
                return;
            }
            await addToCart(product, quantity);
        } catch (error) {
            console.error("Add to cart error:", error);
            toast.error("Failed to add to cart");
        }
    };

    const open_payment = () => {
        const modifiedProduct = {
            id: product._id,
            title: product.title,
            price: product.price,
            prev_price: product.prev_price,
            discount: product.discount,
            img: product.img,
            quantity: product.quantity,
        };
        navigate(`/checkout`, { state: { product: modifiedProduct } });
    };

    if (loading) return <Loader />;
    if (error) return <div className="text-center text-red-500 py-20">{error}</div>;
    if (!product) return <div className="text-center text-red-500 py-20">Product not found</div>;


    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="lg:px-8 max-w-7xl mx-auto px-4 py-8 sm:px-6">
                {/* Breadcrumb */}
                <nav className="mb-8">
                    <ol className="flex text-gray-500 text-sm items-center space-x-2">
                        <li><a href="/" className="hover:text-gray-900">Home</a></li>
                        <li>/</li>
                        <li><a href="/products" className="hover:text-gray-900">Products</a></li>
                        <li>/</li>
                        <li className="text-gray-900 font-medium">{product.title}</li>
                    </ol>
                </nav>

                <div className="lg:gap-x-12 lg:grid lg:grid-cols-2 lg:items-start">
                    {/* Image gallery */}
                    <div className="flex flex-col">
                        <div className="relative">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                                className="bg-white rounded-2xl aspect-h-1 aspect-w-1 overflow-hidden"
                            >
                                <img
                                    src={product.img}
                                    alt={product.title}
                                    className="h-full w-full duration-500 hover:scale-105 object-center object-cover transition-transform"
                                />
                            </motion.div>
                            {product.discount && (
                                <div className="bg-red-500 rounded-full text-sm text-white absolute font-semibold left-4 px-3 py-1 top-4">
                                    {product.discount}% OFF
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Product info */}
                    <div className="lg:mt-0 mt-10 px-4 sm:mt-16 sm:px-0">
                        <h1 className="text-gray-900 text-lg font-bold sm:text-2xl tracking-tight">{product.title}</h1>

                        <div className="mt-2">
                            <div className="flex items-center space-x-4">
                                <p className="text-3xl text-gray-900 font-bold">₹{product.price}</p>
                                {product.prev_price && (
                                    <p className="text-gray-500 text-xl line-through">₹{product.prev_price}</p>
                                )}
                            </div>
                            <div className="flex items-center mt-3 space-x-2">
                                <div className="flex items-center">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} className={`h-5 w-5 ${i < product.rating ? 'text-yellow-600' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                                <span className="text-gray-500 text-sm">({product.rating} out of 5 stars)</span>
                            </div>
                        </div>

                        {/* Quantity selector */}
                        <div className="mt-5">
                            <div className="flex items-center space-x-4">
                                <label htmlFor="quantity" className="text-gray-700 text-sm font-medium">
                                    Quantity
                                </label>
                                <div className="flex border border-gray-300 rounded-lg items-center">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="text-gray-600 hover:text-gray-700 px-3 py-2"
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        id="quantity"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="border-gray-300 border-x text-center w-16 py-2"
                                    />
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="text-gray-600 hover:text-gray-700 px-3 py-2"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Add to cart and Buy Now buttons */}
                        <div className="mt-5 space-y-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-gray-700 rounded-full text-lg text-white w-full duration-200 font-semibold hover:bg-gray-900 px-6 py-3 transition-colors"
                                onClick={handleAddToCart}
                            >
                                Add to Cart
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-yellow-600 rounded-full text-lg text-white w-full duration-200 font-semibold hover:bg-yellow-700 px-6 py-3 transition-colors"
                                onClick={open_payment}
                            >
                                Buy Now
                            </motion.button>
                        </div>
                        

                        {/* Delivery information */}
                        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm mt-5">
                            <h3 className="text-lg font-semibold mb-4">Delivery & Returns</h3>
                            <div className="space-y-4">
                                <div className="flex text-gray-600 items-center space-x-3">
                                    <FaTruckFast className="h-5 text-yellow-600 w-5" />
                                    <span>Free delivery on orders over ₹999</span>
                                </div>
                                <div className="flex text-gray-600 items-center space-x-3">
                                    <FaCalendarAlt className="h-5 text-yellow-600 w-5" />
                                    <span>Dispatches within 1–3 business days</span>
                                </div>
                                <div className="flex text-gray-600 items-center space-x-3">
                                    <FaLocationDot className="h-5 text-yellow-600 w-5" />
                                    <span>Ships from our local warehouse</span>
                                </div>
                                <div className="flex text-gray-600 items-center space-x-3">
                                    <FaTimesCircle className="h-5 text-yellow-600 w-5" />
                                    <span>7-day return policy</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related products */}

            </div>
            <div className="mt-16">
                <Slide products={products.filter(p => p.page === product.page && p.id !== id).slice(0, 8)} heading={"You may also like"} />
                <Slide products={products.filter(p => p.page === product.page && p.id !== id).slice(8, 16)} heading={"More from this shop"} />
                <Slide products={products.filter(p => p.page === product.page && p.id !== id).slice(16, 24)} showHeading={false} />
                <Slide products={products.filter(p => p.page === product.page && p.id !== id).slice(24, 32)} showHeading={false} />
                <Slide products={products.filter(p => p.page === product.page && p.id !== id).slice(32, 40)} showHeading={false} />
                <div className="text-center mt-8">
                    <Button onClick={() => navigate("/showmore")}>Show More</Button>
                </div>
            </div>
        </div>
    );
}

export default ProductDetails;




