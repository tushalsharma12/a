import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import Loader from "../sections/Loader";

const Admin2 = () => {

  // const { user } = useContext(AuthContext);
  const { isAdmin, isAuthenticated } = useContext(AuthContext);
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // ✅ Fetch all orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:5000/api/order", {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        });
        console.log("Fetched orders:", response.data);
        setOrders(response.data);
        setLoadingOrders(false);
      } catch (err) {
        console.error("Error fetching orders:", err);
      }
    };

    fetchOrders();
  }, []);

  // ✅ Update Order Status
  const handleStatusUpdate = (orderId, newStatus) => {
    const token = localStorage.getItem("token");
    axios.put(`http://localhost:5000/api/order/${orderId}`, { orderStatus: newStatus },{ 
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === orderId ? { ...order, orderStatus: newStatus } : order
          )
        );
      })
      .catch((err) => console.error("Error updating order:", err));
  };

  // ✅ Delete Order
  const handleDelete = async (orderId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.delete(`http://localhost:5000/api/order/${orderId}`, { 
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Deleted order:", response.data);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      setLoadingOrders(false);
    } catch (err) {
      console.error("Error deleting order:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);


  const fetchMessages = async () => {
    const res = await axios.get("http://localhost:5000/api/Contact/messages");
    setMessages(res.data);  
  };

  const deleteMessage = async (id) => {
    await axios.delete(`http://localhost:5000/api/Contact/messages/${id}`);
    fetchMessages();
  };

  const [formData, setFormData] = useState({
    title: "",
    rating: "",
    price: "",
    prev_price: "",
    discount: "",
    page: "Dining",
    section: "DiningRounded1",
    img: null,
  });
  const [editId, setEditId] = useState(null);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/products");
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Handle Form Inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, img: e.target.files[0] });
  };

  // Handle Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== null) data.append(key, formData[key]);
    });

    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/products/${editId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("http://localhost:5000/api/products/add", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setEditId(null);
      setFormData({
        title: "",
        rating: "",
        price: "",
        prev_price: "",
        discount: "",
        page: "Home",
        section: "Gifts",
        img: null,
      });
      const res = await axios.get("http://localhost:5000/api/products");
      setProducts(res.data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/delete/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  // Handle Edit
  const handleEdit = (product) => {
    setFormData({
      title: product.title,
      rating: product.rating,
      price: product.price,
      prev_price: product.prev_price,
      discount: product.discount,
      page: product.page,
      section: product.section,
      img: null, // ✅ Image URL ko set kar rahe hain
      existingImg: product.img.startsWith("http") ? product.img : `http://localhost:5000${product.img}`, // ✅ Fix existingImg
    });
    setEditId(product._id);
  };

  
    // Check authentication and admin status
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
  }
  
  if (!isAdmin) {
      return <Navigate to="/" />;
  } 

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>

      <form className="bg-white p-4 shadow-md rounded-md" onSubmit={handleSubmit} encType="multipart/form-data">
        <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} className="block w-full p-2 border mb-2" required />
        <input type="number" name="rating" placeholder="Rating" value={formData.rating} onChange={handleChange} className="block w-full p-2 border mb-2" required />
        <input type="text" name="price" placeholder="Price" value={formData.price} onChange={handleChange} className="block w-full p-2 border mb-2" required />
        <input type="text" name="prev_price" placeholder="Previous Price" value={formData.prev_price} onChange={handleChange} className="block w-full p-2 border mb-2" />
        <input type="text" name="discount" placeholder="Discount" value={formData.discount} onChange={handleChange} className="block w-full p-2 border mb-2" />

        <select name="page" value={formData.page} onChange={handleChange} className="block w-full p-2 border mb-2">
          {["Dining", "Lighting", "Decor", "Garden", "Home", "Dining", "Lighting", "Decor", "Garden", "ProductDetails", "Showmore"].map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select name="section" value={formData.section} onChange={handleChange} className="block w-full p-2 border mb-2">
          {["testimonials","More_Garden_Product","Garden_Decor_Product2","Garden_Decor_Product1","Decorative_Hangings2","Decorative_Hangings1","Pots_Planters2","Pots_Planters1","GardenRounded2","GardenRounded1","BathDecor2","BathDecor1","OfficeDesk2","OfficeDesk1","Vases2","Vases1","Wall_Decor2","Wall_Decor1","DecorRounded2","DecorRounded1","Candles2","Candles1","DiyaSet2","DiyaSet1","Lamps2","Lamps1","Festivallight2","Festivallight1","LightingRounded2","LightingRounded1","Cutlery","Serveware2","Serveware1","Tableware2","Tableware1","Drinkware2","Drinkware1","DiningRounded2","DiningRounded1","Gifts", "today_big_deals", "New Arrivals", "Most Loved", "Indian Art Forms", "explore", "Special Price", "Popular", "SliderImages", "Slider2Images"].map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        {(formData.img || formData.existingImg) && (
          <img
            src={
              typeof formData.img === "string"
                ? formData.img
                : formData.img
                  ? URL.createObjectURL(formData.img)
                  : formData.existingImg
            }
            alt="Preview"
            width="100"
            className="mt-2 rounded-md"
          />
        )}



        <input type="file" onChange={handleFileChange} className="block w-full p-2 border mb-2" />

        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-md">
          {loading ? "Processing..." : editId ? "Update Product" : "Add Product"}
        </button>
      </form>

      {loading ? <p>Loading...</p> : (
        <ul className="mt-6 space-y-4">
          {products.map((product) => (
            <li key={product._id} className="bg-white p-4 shadow-md flex items-center justify-between">
              <div>
                <p className="font-bold">{product.title}</p>
                <p> <span className="font-semibold">Page:</span> {product.page} |<span className="font-semibold">Section:</span>{product.section} </p>
                <p><span className="font-semibold">Price: </span> ₹{product.price} |<span className="font-semibold"> Previous Price: </span> <span className="line-through">₹{product.prev_price}  </span> </p>
                <p> <span className="font-semibold">Discount:</span>{product.discount}% off | <span className="font-semibold">Rating: </span>{product.rating} <i className="fa-solid fa-star text-yellow-600"></i></p>
                {product.img && (
                  <img src={product.img.startsWith("http") ? product.img : `http://localhost:5000${product.img}`} alt={product.title} width="100" className="mt-2" />
                )}
              </div>
              <div>
                <button onClick={() => handleEdit(product)} className="bg-yellow-500 text-white px-3 py-1 rounded-md mr-2">Edit</button>
                <button onClick={() => deleteProduct(product._id)} className="bg-red-500 text-white px-3 py-1 rounded-md">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="my-20 flex flex-col items-center">
      <h2>Contact Messages</h2>
      <ul className="mt-6 space-y-4">
        {messages.map((msg) => (
          <li key={msg._id}>
            <div>Name :{msg.name}</div>
            <div>Email :{msg.email}</div>
            <div>Message :{msg.message}</div>
            <button className="bg-red-500 text-white px-3 py-1 rounded-md mr-2 hover:bg-red-600" onClick={() => deleteMessage(msg._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
    <table className="w-full border-collapse border border-gray-300">
  <thead>
    <tr className="bg-gray-100">
      <th className="border p-2">Order ID</th>
      <th className="border p-2">Customer</th>
      <th className="border p-2">Items</th>
      <th className="border p-2">Total</th>
      <th className="border p-2">Status</th>
      <th className="border p-2">Payment</th>
      <th className="border p-2">Date</th>
      <th className="border p-2">Actions</th>
    </tr>
  </thead>
  <tbody>
    {orders.map((order) => (
      <tr key={order._id} className="border hover:bg-gray-50">
        <td className="border p-2">{order._id}</td>
        <td className="border p-2">{order.userId?.name || "Unknown"}</td>
        <td className="border p-2">
          <ul className="list-disc pl-4">
            {order.items?.map((item) => (
              <li key={item._id}>
                {item.title} (x{item.quantity})
              </li>
            ))}
          </ul>
        </td>
        <td className="border p-2">₹{order.totalAmount}</td>
        <td className="border p-2">
          <select
            value={order.orderStatus}
            onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
            className="border p-1 rounded"
          >
            <option value="Processing">Processing</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </td>
        <td className="border p-2">
          <span className={`px-2 py-1 rounded-full text-sm ${
            order.paymentStatus === 'paid' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {order.paymentStatus}
          </span>
        </td>
        <td className="border p-2">
          {new Date(order.createdAt).toLocaleDateString()}
        </td>
        <td className="border p-2">
          <button 
            onClick={() => handleDelete(order._id)} 
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </td>
      </tr>
    ))}
  </tbody>
</table>
    </div>

  );
};

export default Admin2;







////////////////////////////////////////////////////////////////////////////////////////////////
productDetails.jsx 

import { useParams } from "react-router-dom";
import "../assets/styles/style.css";
import { motion } from "framer-motion"
import Slide from "../sections/Slide.jsx";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import axios from "axios";
import { useContext } from "react";
import { CartContext } from "../context/CartContext.jsx";
import { FaStar, FaCalendarAlt, FaTimesCircle } from "react-icons/fa";
import { FaTruckFast, FaLocationDot } from "react-icons/fa6";
import { toast } from "react-toastify";
import Button from "../sections/Button.jsx";
import Loader from "../sections/Loader";

function ProductDetails() {

    const { id } = useParams();
    const navigate = useNavigate();
    const showmore = () => {
        navigate("/showmore")
    }
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [products, setProducts] = useState([]);
    const { addToCart } = useContext(CartContext);
    const [quantity, setQuantity] = useState(1);


    useEffect(() => {
        // Save the current page as the source when viewing product details
        const currentPath = window.location.pathname;
        if (!currentPath.includes('/products/')) {
            sessionStorage.setItem('lastPath', currentPath);
        }
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0); // Scroll to top on mount
        // ✅ Backend se data fetch karna
        const fetchProduct = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/products/${id}`);
                console.log("API Response:", response);
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} - ${response.statusText}`);
                }
                const data = await response.json();
                console.log("Product Data:", data);

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
        axios.get("http://localhost:5000/api/products")
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

    if (!product) {
        return <div className="text-center py-20 text-red-500">Product not found</div>;
    }

    const handleAddToCart = async () => {
        try {
            if (!product) {
                toast.error("Product not available");
                return;
            }

            console.log("Adding product to cart:", { product, quantity }); // Debug log
            await addToCart(product, quantity);
        } catch (error) {
            console.error("Add to cart error:", error);
            toast.error("Failed to add to cart");
        }
    };

    // const open_payment = () => {
    //     navigate(`/checkout`, { state: { product } });
    // }?.
    const open_payment = () => {
        const modifiedProduct = {
            id: product._id,
            title: product.title,  // Title ko Name bana diya
            price: product.price,
            prev_price: product.prev_price,
            discount: product.discount,
            img: product.img , // image URL set kiya
            quantity: 1, // Default quantity set ki
        };
        
    
        console.log("Sending Product:", modifiedProduct);  // ✅ Debugging
        console.log("Product",product);
    console.log("img",product.img );  
        navigate(`/checkout`, { state: { product: modifiedProduct } });
    };

    
    if (loading) {
        return <div className="text-center py-20">Loading...</div>;
    }
    if (error) {
        return <div className="text-center py-20 text-red-500">{error}</div>;
    }
    const getSectionProducts = (page) => {
        return products.filter(product => product.page === page && product.id !== id);
    };
    const relatedProducts = product ? getSectionProducts(product.page) : [];

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="max-w-screen-2xl">
            <div className="max-w-[1360px]  mx-auto     ">
                <div className="max-w-7xl mx-auto p-6 lg:my-10 md:my-7 my-5">
                    <div className="grid md:grid-cols-2 grid-cols-1 gap-16 items-start">
                        {/* Product Image */}
                        <div className="relative border border-gray-300 rounded-xl overflow-hidden shadow-lg">
                            <img
                                src={product.img}
                                alt={product.title}
                                className="w-full  object-cover hover:scale-105 transition-transform duration-300"
                            />
                        </div>

                        {/* Product Details */}
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-gray-900">{product.title}</h2>


                            {/* Price & Discount */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <p className="text-3xl font-bold text-yellow-600">₹{product.price}</p>
                                    <p className="text-lg line-through text-gray-400">₹{product.prev_price}</p>
                                    <span className="bg-yellow-500 text-white font-semibold text-sm px-3 py-1 rounded-xl">{product.discount}% off</span>

                                </div>
                                <div className="flex items-center gap-2 text-yellow-600">
                                    <span className="text-lg font-semibold">{product.rating}</span>
                                    <FaStar className="text-xl" />
                                </div>
                            </div>

                            <p className="text-sm text-gray-600">Local taxes included (where applicable)</p>

                            {/* Quantity & Buttons */}
                            <div className="flex flex-col gap-4">
                                <label className="text-md font-semibold">Quantity</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="w-20 text-lg text-center border border-gray-400 rounded-lg py-2"
                                    />
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        className="bg-black text-white px-5 py-3 rounded-full text-lg font-bold hover:bg-gray-800 w-full"
                                        onClick={handleAddToCart}
                                    >
                                        Add to Cart<i className="fa-solid fa-cart-plus ml-2"></i>
                                    </motion.button>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    className="bg-yellow-600 text-white px-5 py-3 rounded-full text-lg font-bold hover:bg-yellow-500 w-full"
                                    onClick={open_payment}
                                >
                                    Buy Now <i className="fa-solid fa-credit-card ml-2"></i>

                                </motion.button>
                            </div>

                            {/* Delivery Information */}
                            <div className=" p-5 rounded-xl shadow-[0_0_7px_rgba(0,0,0,0.4)]">
                                <p className="text-lg font-semibold mb-2">Delivery & Return Policies</p>
                                <div className="flex items-center gap-2 text-gray-700 mb-2">
                                    <FaCalendarAlt />
                                    <p>Dispatches within 1–3 business days</p>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 mb-2">
                                    <FaTimesCircle />
                                    <p>Returns & exchanges not accepted</p>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700 mb-2">
                                    <FaTruckFast />
                                    <p>Delivery cost: ₹50</p>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <FaLocationDot />
                                    <p>Dispatched from: United States</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="">
                <Slide today_big_deals={relatedProducts.slice(0, 8)} heading={"You may also like"} />
                <Slide today_big_deals={relatedProducts.slice(8, 16)} heading={"More from this shop"} />
                <Slide today_big_deals={relatedProducts.slice(16, 24)} showHeading={false} />
                <Slide today_big_deals={relatedProducts.slice(24, 32)} showHeading={false} />
                <Slide today_big_deals={relatedProducts.slice(32, 40)} showHeading={false} />
                <Button onClick={showmore}>Show More</Button>
            </div>
        </div>
    );
}

export default ProductDetails;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
import { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { Link, useLocation } from "react-router-dom";
import "../assets/styles/style.css";
import logo from "../assets/images/logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { AuthContext } from "../context/AuthContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";
import { FaUserCircle } from "react-icons/fa";

const drop_down = [
    { name: "Home Decor", icon: <i className="fa-solid fa-house text-yellow-500"></i>, path: "/Decor" },
    { name: "Dining & Kitchen", icon: <i className="fa-solid fa-utensils text-red-500"></i>, path: "/Dining" },
    { name: "Lighting", icon: <i className="fa-solid fa-lightbulb text-blue-500"></i>, path: "/Lighting" },
    { name: "Garden & Outdoor", icon: <i className="fa-solid fa-campground text-green-500"></i>, path: "/Garden" },
];

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [drop_down_Click, set_drop_down_Click] = useState(false);
    const location = useLocation();
    const [currentPath, setCurrentPath] = useState(location.pathname);
    const [placeholder, setPlaceholder] = useState("");
    const { user, logout } = useContext(AuthContext);
    const { clearCart } = useContext(CartContext);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [sections, setSections] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            const placeholderText = "Find your favorite handcrafted piece...";
            setPlaceholder(placeholderText.substring(0, index + 1));
            index = (index + 1) % (placeholderText.length + 1);
        }, 100);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setCurrentPath(location.pathname);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const sidebar = document.querySelector('.mobile-sidebar');
            const toggleButton = document.querySelector('.sidebar-toggle');
            
            if (sidebar && !sidebar.contains(event.target) && toggleButton && !toggleButton.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            await clearCart();
            localStorage.removeItem("token");
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            if (searchQuery.trim() === "") {
                setFilteredProducts([]);
                setShowDropdown(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/api/products/search`, {
                    params: { query: searchQuery }
                });
                setFilteredProducts(response.data);
                setShowDropdown(true);
            } catch (error) {
                console.error("Search Error:", error);
            }
        };

        fetchProducts();
    }, [searchQuery]);

    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/products/sections");
                setSections(response.data);
            } catch (error) {
                console.error("Categories Fetch Error:", error);
            }
        };

        fetchSections();
    }, []);

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                try {
                    const res = await fetch("http://localhost:5000/api/auth/profile", {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    });
                    const data = await res.json();
                    setUserProfile(data);
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
        };
        fetchUserProfile();
    }, [user]);

    return (
        <nav className="sticky top-0 z-50 bg-white">
            {/* Mobile Header */}
            <div className="max-w-[1360px] mx-auto search-container relative  flex  items-center pt-4 relative justify-between ">
                            <motion.div className="logo" onClick={() => navigate("/")}>
                                <img src={logo} alt="" width="70px" />
                            </motion.div>
            
                            <div className="relative ">
                                <button className=" px-3 py-2 rounded-lg overflow-hidden category-btn group lg:flex hidden " onClick={() => setIsOpen(prev => !prev)}>
                                    <span className="absolute inset-0 bg-gray-200 scale-0 transition-transform duration-500 group-hover:scale-90  rounded-xl" ></span>
                                    <div className="relative flex items-center gap-2 z-10 bg-gray-100 px-3 shadow-[0px_0px_5px_rgba(0,0,0,0.5)] py-1 rounded-lg ">
                                        <i className="fa-solid fa-bars"></i>
                                        <span>Categories</span>
                                    </div>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.3 }} className="drop-down absolute -left-10 z-50 top-12 bg-white text-start shadow-[0px_5px_10px_rgba(0,0,0,0.5)]   rounded-lg">
                                            {drop_down.map((item, index) => (
                                                <ul key={index} className=" py-2 px-3  hover:bg-gray-100" style={{ width: "200px" }} >
                                                    <Link to={item.path} onClick={() => setIsOpen(false)}>
                                                        <li onClick={() => set_drop_down_Click(!drop_down_Click)} className={`flex items-center gap-2 ${currentPath === item.path ? "text-yellow-600" : ""}`}>{item.icon} {item.name}</li>
                                                    </Link>
                                                </ul>
                                            ))}
            
                                        </motion.div>
                                    )}
                                </button>
                            </div>
            
                            <div className="lg:flex w-2/3 mx-5 rounded-full overflow-hidden hidden group shadow-[0px_0px_7px_rgba(0,0,0,0.5)]">
                                <motion.input type="text" name="search" id="search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowDropdown(true)}
                                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                                    placeholder={placeholder} className="searchbar w-full  px-4 py-2 outline-none placeholder:text-gray-400 placeholder:text-sm " />
            
                                <button className="bg-yellow-600 text-white rounded-full group-hover:rounded-none   group-hover:m-0 group-hover:p-1 m-1 transition-all ease-in-out duration-700 "><i className="fa-solid fa-magnifying-glass m-2"></i></button>
                                {showDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="absolute w-2/3 top-20 mt-1 rounded-xl z-50 shadow-lg border border-gray-200 bg-white
                                   overflow-y-auto max-h-[300px]"
                                    >
                                        {/* Popular Searches */}
                                        {searchQuery.trim() === "" && (
                                            <div className="p-4">
                                                <div className="text-gray-600 text-md font-bold flex items-center py-2">
                                                    <i className="fa-solid fa-arrow-trend-up mx-2 text-xs"></i>Popular Searches
                                                </div>
                                                {sections.map((product) => (
                                                    <div
                                                        key={product}
                                                        onClick={() => navigate(`/${product}`)}
                                                        onMouseDown={(e) => e.preventDefault()}
                                                        className="block cursor-pointer text-sm font-semibold flex justify-between p-2 
                                                   hover:text-yellow-600 hover:bg-gray-100 transition-all duration-300 text-gray-600"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <i className="fa-regular fa-eye text-xs"></i>
                                                            <span className="">Looking for a {product}</span>
                                                        </div>
                                                        <i className="fa-solid fa-magnifying-glass text-xs"></i>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
            
                                        {/* Search Results */}
                                        {searchQuery.trim() !== "" && (
                                            <div className="p-4">
                                                {filteredProducts.length > 0 ? (
                                                    filteredProducts.map((product) => (
                                                        <Link
                                                            key={product._id}
                                                            to={`/products/${product._id}`}
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => setShowDropdown(false)}
                                                            className="block cursor-pointer text-sm font-semibold flex justify-between p-2 
                                                       hover:text-yellow-600 hover:bg-gray-100 transition-all duration-300 text-gray-600"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <i className="fa-solid fa-magnifying-glass text-xs"></i>
                                                                <div>{product.title}</div>
                                                            </div>
                                                            <div className="ml-10 text-gray-500">{product.page}</div>
                                                        </Link>
                                                    ))
                                                ) : (
                                                    <div className="p-3 text-gray-500 text-center">No Results Found</div>
                                                )}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
            
                           
                                {/* <Link to="/Login" className={`hover:bg-yellow-600 hover:text-white text-md font-semibold rounded-full ${currentPath === "/Login" ? "bg-yellow-600 text-white text-md  " : "bg-white text-black"}`}><i className="fa-regular fa-user m-2"></i></Link> */}
            
                             {user ? (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="relative w-8 h-8 rounded-full overflow-hidden transition-all duration-300">
                                            <img
                                                src={userProfile?.profilePicture || logo}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = logo;
                                                }}
                                            />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="absolute top-2 translate-x-[-50%] mt-2 w-52 bg-white shadow-lg rounded-md border z-50">
                                            <DropdownMenuItem className="hover:outline-none">
                                                <Link
                                                    to="/profile"
                                                    className="block px-4 py-2 text-sm hover:bg-gray-200 w-full"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <img
                                                            src={userProfile?.profilePicture || logo}
                                                            alt="Profile"
                                                            className="w-9 h-9 rounded-full object-cover"
                                                        />
                                                        <div className="flex flex-col ">
                                                            <span className="font-semibold text-sm">Profile</span>
                                                            <span className="text-xs text-gray-500 ">{userProfile?.name || 'Profile'}</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="hover:outline-none">
                                                <Link
                                                    to="/settings"
                                                    className="block px-4 py-2 text-sm hover:bg-gray-200 w-full"
                                                >
                                                    Account Settings
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="hover:outline-none">
                                                <Link
            
                                                    className="block px-4 py-1 text-xs  w-full"
                                                >
                                                    <p className="text-gray-500">
                                                        Joined: {user?.createdAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(user.createdAt)) : "N/A"}
                                                    </p>
            
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="hover:outline-none">
                                                <Link
                                                    className="block px-4 py-1 text-xs  w-full"
                                                >
                                                    <p className="text-gray-500">
                                                        Last Updated: {user?.updatedAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(user.updatedAt)) : "N/A"}
                                                    </p>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="hover:outline-none">
                                                <button
                                                    onClick={handleLogout}
                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-200"
                                                >
                                                    Logout ⏻
                                                </button>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    // <button
                                    //     onClick={handleLogout}
                                    //     className="px-5 py-2 text-sm font-semibold rounded-full shadow-md transition-all duration-300 ease-in-out transform  bg-white text-black border border-gray-300 hover:bg-red-600 hover:text-white"
                                    // >
                                    //     Logout
                                    // </button>
                                ) : (
                                    // Login Button - Professional Look
                                    <Link
                                        to="/Login"
                                        className={` rounded-full shadow-md transition-all duration-300 ease-in-out transform  ${currentPath === "/Login"
                                            ? "bg-yellow-600 text-white"
                                            : "bg-white text-black border border-gray-300 hover:bg-yellow-600  hover:text-white"
                                            }`}
                                    >
                                  
                                        <FaUserCircle className="text-[24px] cursor-pointer" />
            
                                    </Link>
                                )}
            
            
                                {user?.role === 'admin' && (
                                    <Link
                                        to="/Admin2"
                                        className={`text-md font-semibold rounded-full ${currentPath === "/Admin2" ? "text-yellow-600" : ""}`}
                                    >
                                        <i className="fa-solid fa-table-columns p-2 rounded-full text-[20px]"></i>
                                        
                                    </Link>
                                )}
                                
            
            
                                <Link to="/OrdersPage" className={`text-md font-semibold rounded-full hover:text-yellow-600 ${currentPath === "/OrdersPage" ? " text-yellow-600 " : ""}`}>
                                    <i className="fa-solid fa-shopping-bag p-2 rounded-full text-[20px]"></i></Link>
            
                                <Link to="/Cart" className={`text-md font-semibold rounded-full hover:text-yellow-600 ${currentPath === "/Cart" ? " text-yellow-600 " : ""}`}>
                                    <i className="fa-solid fa-cart-shopping p-2 rounded-full text-[20px]"></i></Link>
            
                        </div>
                        <div className="max-w-screen-xl w-2/4 mx-auto py-1 hidden lg:block">
                            <ul className="flex justify-between items-center xl:gap-4  ">
                                <li> <Link to="/" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent rounded-3xl hover:text-black hover:bg-gray-200 transition-colors  ease-in-out duration-500 ${currentPath === "/" ? "bg-gray-300 text-black" : "bg-white text-black"}`}> Home</Link></li>
                                <li> <Link to="/Dining" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent hover:text-black hover:bg-gray-200 transition-colors ease-in-out duration-500 ${currentPath === "/Dining" ? "bg-gray-200 text-black " : "bg-white text-black"}`}>Dining</Link></li>
                                <li> <Link to="/Lighting" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent hover:text-black hover:bg-gray-200 transition-colors ease-in-out duration-500 ${currentPath === "/Lighting" ? "bg-gray-200 text-black " : "bg-white text-black"}`}>Lighting</Link></li>
                                <li> <Link to="/Decor" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent hover:text-black hover:bg-gray-200 transition-colors ease-in-out duration-500 ${currentPath === "/Decor" ? "bg-gray-200 text-black " : "bg-white text-black"}`}>Decor</Link></li>
                                <li> <Link to="/Garden" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent hover:text-black hover:bg-gray-200 transition-colors ease-in-out duration-500 ${currentPath === "/Garden" ? "bg-gray-200 text-black " : "bg-white text-black"}`}>Garden</Link></li>
                                <li> <Link to="/About" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent hover:text-black hover:bg-gray-200 transition-colors ease-in-out duration-500 ${currentPath === "/About" ? "bg-gray-200 text-black " : "bg-white text-black"}`}>About</Link></li>
                                <li><Link to="/Contact" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent hover:text-black hover:bg-gray-200 transition-colors ease-in-out duration-500 ${currentPath === "/Contact" ? "bg-gray-200 text-black " : "bg-white text-black"} `}>Contact</Link></li>
                            </ul>
                        </div>
                        <div className="max-w-screen-xl mx-auto p-2 pl-4 flex gap-4 justify-between items-center lg:hidden">
                            <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                                <i className="fa-solid fa-bars text-2xl"></i>  {/* Sidebar Toggle Button */}
                            </button>
                            <div className="flex w-full border-2 border-gray-600 rounded-full overflow-hidden">
                                <input type="search" placeholder="Search for anything" className="w-full px-4 py-2 outline-none" />
                                <button className="bg-yellow-600 text-white rounded-full hover:rounded-none m-1"><i className="fa-solid fa-magnifying-glass m-2"></i></button>
                            </div>
                        </div>
            <div className="lg:hidden">
                <div className="flex items-center justify-between px-4 py-3">
                    <button 
                        className="sidebar-toggle text-2xl"
                        onClick={() => setIsOpen(true)}
                    >
                        <i className="fa-solid fa-bars"></i>
                    </button>
                    
                    <div className="logo" onClick={() => navigate("/")}>
                        <img src={logo} alt="Logo" className="h-10" />
                    </div>

                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                            className="text-2xl"
                        >
                            <i className="fa-solid fa-magnifying-glass"></i>
                        </button>
                        <Link to="/Cart" className="text-2xl">
                            <i className="fa-solid fa-cart-shopping"></i>
                        </Link>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <AnimatePresence>
                    {isMobileSearchOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 py-2 border-t border-gray-200"
                        >
                            <div className="relative">
                                <input
                                    type="search"
                                    placeholder="Search products..."
                                    className="w-full px-4 py-2 rounded-full border-2 border-gray-300 focus:border-yellow-500 outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg max-h-[60vh] overflow-y-auto">
                                        {filteredProducts.map((product) => (
                                            <Link
                                                key={product._id}
                                                to={`/products/${product._id}`}
                                                className="block px-4 py-2 hover:bg-gray-100"
                                                onClick={() => {
                                                    setIsMobileSearchOpen(false);
                                                    setSearchQuery("");
                                                }}
                                            >
                                                {product.title}
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Mobile Sidebar */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "tween", duration: 0.3 }}
                            className="mobile-sidebar fixed top-0 left-0 w-[80%] max-w-sm h-full bg-white z-50 overflow-y-auto"
                        >
                            <div className="flex justify-between items-center p-4 border-b">
                                <div className="logo">
                                    <img src={logo} alt="Logo" className="h-10" />
                                </div>
                                <button onClick={() => setIsOpen(false)} className="text-2xl">
                                    <i className="fa-solid fa-xmark"></i>
                                </button>
                            </div>

                            {user && (
                                <div className="p-4 border-b">
                                    <div className="flex items-center space-x-3">
                                        <img
                                            src={userProfile?.profilePicture || logo}
                                            alt="Profile"
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="font-semibold">{userProfile?.name || 'User'}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="py-2">
                                <Link to="/" 
                                    className="flex items-center px-6 py-3 hover:bg-gray-100"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <i className="fa-solid fa-home text-yellow-500 mr-3"></i>
                                    <span>Home</span>
                                </Link>

                                {drop_down.map((item, index) => (
                                    <Link
                                        key={index}
                                        to={item.path}
                                        className="flex items-center justify-between px-6 py-3 hover:bg-gray-100"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        <div className="flex items-center">
                                            {item.icon}
                                            <span className="ml-3">{item.name}</span>
                                        </div>
                                        <i className="fa-solid fa-chevron-right text-gray-400"></i>
                                    </Link>
                                ))}

                                <div className="border-t mt-2 pt-2">
                                    <Link to="/About" 
                                        className="block px-6 py-3 hover:bg-gray-100"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        About Us
                                    </Link>
                                    <Link to="/Contact" 
                                        className="block px-6 py-3 hover:bg-gray-100"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Contact
                                    </Link>
                                    <Link to="/OrdersPage" 
                                        className="block px-6 py-3 hover:bg-gray-100"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        My Orders
                                    </Link>
                                </div>

                                <div className="border-t mt-2 pt-2">
                                    {user ? (
                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsOpen(false);
                                            }}
                                            className="w-full text-left px-6 py-3 text-red-600 hover:bg-gray-100"
                                        >
                                            <i className="fa-solid fa-sign-out-alt mr-3"></i>
                                            Logout
                                        </button>
                                    ) : (
                                        <Link
                                            to="/Login"
                                            className="flex items-center px-6 py-3 text-blue-600 hover:bg-gray-100"
                                            onClick={() => setIsOpen(false)}
                                        >
                                            <i className="fa-solid fa-sign-in-alt mr-3"></i>
                                            Login
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Navigation */}
            <div className="hidden lg:block">
                {/* Your existing desktop navigation code */}
            </div>
        </nav>
    );
};

export default Navbar;



import { useState, useEffect, useContext } from "react";
import axios from 'axios';
import { Link, useLocation } from "react-router-dom";
import "../assets/styles/style.css";
import logo from "../assets/images/logo.png";
import { motion } from "framer-motion";
import { AuthContext } from "../context/AuthContext.jsx";
import { CartContext } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@radix-ui/react-dropdown-menu";

import { FaUserCircle } from "react-icons/fa"; // FontAwesome User Icon


const drop_down = [
    { name: "Home Decor", icon: <i className="fa-solid fa-house text-yellow-500"></i>, path: "/Decor" },
    { name: "Dining & Kitchen", icon: <i className="fa-solid fa-utensils text-red-500"></i>, path: "/Dining" },
    { name: "Lighting", icon: <i className="fa-solid fa-lightbulb text-blue-500"></i>, path: "/Lighting" },
    { name: "Garden & Outdoor", icon: <i className="fa-solid fa-campground text-green-500"></i>, path: "/Garden" },
]

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [drop_down_Click, set_drop_down_Click] = useState(false);
    const location = useLocation();
    const [currentPath, setCurrentPath] = useState(location.pathname);
    const [placeholder, setPlaceholder] = useState("");
    const { user, logout } = useContext(AuthContext);
    const { clearCart } = useContext(CartContext);
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState(""); // Search box ka value
    const [filteredProducts, setFilteredProducts] = useState([]); // API se filtered products
    const [showDropdown, setShowDropdown] = useState(true);
    // const [isDropdownSearch, setDropdownSearch] = useState(false);
    const [sections, setSections] = useState([]);

    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            const placeholderText = "Find your favorite handcrafted piece...";
            setPlaceholder(placeholderText.substring(0, index + 1)); // Animate text letter by letter
            index = (index + 1) % (placeholderText.length + 1); // Loop back to start
        }, 100); // Typing speed (adjustable)

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setCurrentPath(location.pathname);
    }, [location]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".drop-down") && !event.target.closest(".category-btn")) {
                setIsOpen(false);
            }
            if (!event.target.closest(".drop-down2") && !event.target.closest(".searchbar")) {
                setShowDropdown(false);
                setFilteredProducts([]);
                setSearchQuery("");
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await logout();
            await clearCart();
            localStorage.removeItem("token");

            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
            // You might want to show an error message to the user
        }
    };


    // Search API Call
    useEffect(() => {
        const fetchProducts = async () => {
            if (searchQuery.trim() === "") {
                setFilteredProducts([]);
                setShowDropdown(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/api/products/search`, {
                    params: { query: searchQuery }
                });

                setFilteredProducts(response.data);
                setShowDropdown(true);
            } catch (error) {
                console.error("Search Error:", error);
            }
        };

        fetchProducts();
    }, [searchQuery]);

    // Backend se Sections Fetch Karna
    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/products/sections");
                setSections(response.data);
            } catch (error) {
                console.error("Categories Fetch Error:", error);
            }
        };

        fetchSections();
    }, []);

    const [userProfile, setUserProfile] = useState(null);

    // Add this useEffect to fetch user profile
    useEffect(() => {
        const fetchUserProfile = async () => {
            if (user) {
                try {
                    const res = await fetch("http://localhost:5000/api/auth/profile", {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    });
                    const data = await res.json();
                    setUserProfile(data);
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            }
        };
        fetchUserProfile();
    }, [user]);

    return (


        <nav className="sticky top-0 z-50 bg-white space-y-2" >
            <div className="max-w-[1360px] mx-auto search-container relative  flex  items-center pt-4 relative justify-between ">
                <motion.div className="logo" onClick={() => navigate("/")}>
                    <img src={logo} alt="" width="70px" />
                </motion.div>

                <div className="relative ">
                    <button className=" px-3 py-2 rounded-lg overflow-hidden category-btn group lg:flex hidden " onClick={() => setIsOpen(prev => !prev)}>
                        <span className="absolute inset-0 bg-gray-200 scale-0 transition-transform duration-500 group-hover:scale-90  rounded-xl" ></span>
                        <div className="relative flex items-center gap-2 z-10 bg-gray-100 px-3 shadow-[0px_0px_5px_rgba(0,0,0,0.5)] py-1 rounded-lg ">
                            <i className="fa-solid fa-bars"></i>
                            <span>Categories</span>
                        </div>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }} className="drop-down absolute -left-10 z-50 top-12 bg-white text-start shadow-[0px_5px_10px_rgba(0,0,0,0.5)]   rounded-lg">
                                {drop_down.map((item, index) => (
                                    <ul key={index} className=" py-2 px-3  hover:bg-gray-100" style={{ width: "200px" }} >
                                        <Link to={item.path} onClick={() => setIsOpen(false)}>
                                            <li onClick={() => set_drop_down_Click(!drop_down_Click)} className={`flex items-center gap-2 ${currentPath === item.path ? "text-yellow-600" : ""}`}>{item.icon} {item.name}</li>
                                        </Link>
                                    </ul>
                                ))}

                            </motion.div>
                        )}
                    </button>
                </div>

                <div className="lg:flex w-2/3 mx-5 rounded-full overflow-hidden hidden group shadow-[0px_0px_7px_rgba(0,0,0,0.5)]">
                    <motion.input type="text" name="search" id="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setShowDropdown(true)}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        placeholder={placeholder} className="searchbar w-full  px-4 py-2 outline-none placeholder:text-gray-400 placeholder:text-sm " />

                    <button className="bg-yellow-600 text-white rounded-full group-hover:rounded-none   group-hover:m-0 group-hover:p-1 m-1 transition-all ease-in-out duration-700 "><i className="fa-solid fa-magnifying-glass m-2"></i></button>
                    {showDropdown && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3 }}
                            className="absolute w-2/3 top-20 mt-1 rounded-xl z-50 shadow-lg border border-gray-200 bg-white
                       overflow-y-auto max-h-[300px]"
                        >
                            {/* Popular Searches */}
                            {searchQuery.trim() === "" && (
                                <div className="p-4">
                                    <div className="text-gray-600 text-md font-bold flex items-center py-2">
                                        <i className="fa-solid fa-arrow-trend-up mx-2 text-xs"></i>Popular Searches
                                    </div>
                                    {sections.map((product) => (
                                        <div
                                            key={product}
                                            onClick={() => navigate(`/${product}`)}
                                            onMouseDown={(e) => e.preventDefault()}
                                            className="block cursor-pointer text-sm font-semibold flex justify-between p-2 
                                       hover:text-yellow-600 hover:bg-gray-100 transition-all duration-300 text-gray-600"
                                        >
                                            <div className="flex items-center gap-2">
                                                <i className="fa-regular fa-eye text-xs"></i>
                                                <span className="">Looking for a {product}</span>
                                            </div>
                                            <i className="fa-solid fa-magnifying-glass text-xs"></i>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Search Results */}
                            {searchQuery.trim() !== "" && (
                                <div className="p-4">
                                    {filteredProducts.length > 0 ? (
                                        filteredProducts.map((product) => (
                                            <Link
                                                key={product._id}
                                                to={`/products/${product._id}`}
                                                onMouseDown={(e) => e.preventDefault()}
                                                onClick={() => setShowDropdown(false)}
                                                className="block cursor-pointer text-sm font-semibold flex justify-between p-2 
                                           hover:text-yellow-600 hover:bg-gray-100 transition-all duration-300 text-gray-600"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <i className="fa-solid fa-magnifying-glass text-xs"></i>
                                                    <div>{product.title}</div>
                                                </div>
                                                <div className="ml-10 text-gray-500">{product.page}</div>
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-3 text-gray-500 text-center">No Results Found</div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>

               
                    {/* <Link to="/Login" className={`hover:bg-yellow-600 hover:text-white text-md font-semibold rounded-full ${currentPath === "/Login" ? "bg-yellow-600 text-white text-md  " : "bg-white text-black"}`}><i className="fa-regular fa-user m-2"></i></Link> */}

                 {user ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger className="relative w-8 h-8 rounded-full overflow-hidden transition-all duration-300">
                                <img
                                    src={userProfile?.profilePicture || logo}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = logo;
                                    }}
                                />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="absolute top-2 translate-x-[-50%] mt-2 w-52 bg-white shadow-lg rounded-md border z-50">
                                <DropdownMenuItem className="hover:outline-none">
                                    <Link
                                        to="/profile"
                                        className="block px-4 py-2 text-sm hover:bg-gray-200 w-full"
                                    >
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={userProfile?.profilePicture || logo}
                                                alt="Profile"
                                                className="w-9 h-9 rounded-full object-cover"
                                            />
                                            <div className="flex flex-col ">
                                                <span className="font-semibold text-sm">Profile</span>
                                                <span className="text-xs text-gray-500 ">{userProfile?.name || 'Profile'}</span>
                                            </div>
                                        </div>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:outline-none">
                                    <Link
                                        to="/settings"
                                        className="block px-4 py-2 text-sm hover:bg-gray-200 w-full"
                                    >
                                        Account Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:outline-none">
                                    <Link

                                        className="block px-4 py-1 text-xs  w-full"
                                    >
                                        <p className="text-gray-500">
                                            Joined: {user?.createdAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(user.createdAt)) : "N/A"}
                                        </p>

                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:outline-none">
                                    <Link
                                        className="block px-4 py-1 text-xs  w-full"
                                    >
                                        <p className="text-gray-500">
                                            Last Updated: {user?.updatedAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(new Date(user.updatedAt)) : "N/A"}
                                        </p>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="hover:outline-none">
                                    <button
                                        onClick={handleLogout}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-200"
                                    >
                                        Logout ⏻
                                    </button>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        // <button
                        //     onClick={handleLogout}
                        //     className="px-5 py-2 text-sm font-semibold rounded-full shadow-md transition-all duration-300 ease-in-out transform  bg-white text-black border border-gray-300 hover:bg-red-600 hover:text-white"
                        // >
                        //     Logout
                        // </button>
                    ) : (
                        // Login Button - Professional Look
                        <Link
                            to="/Login"
                            className={` rounded-full shadow-md transition-all duration-300 ease-in-out transform  ${currentPath === "/Login"
                                ? "bg-yellow-600 text-white"
                                : "bg-white text-black border border-gray-300 hover:bg-yellow-600  hover:text-white"
                                }`}
                        >
                      
                            <FaUserCircle className="text-[24px] cursor-pointer" />

                        </Link>
                    )}


                    {user?.role === 'admin' && (
                        <Link
                            to="/Admin2"
                            className={`text-md font-semibold rounded-full ${currentPath === "/Admin2" ? "text-yellow-600" : ""}`}
                        >
                            <i className="fa-solid fa-table-columns p-2 rounded-full text-[20px]"></i>
                            
                        </Link>
                    )}
                    


                    <Link to="/OrdersPage" className={`text-md font-semibold rounded-full hover:text-yellow-600 ${currentPath === "/OrdersPage" ? " text-yellow-600 " : ""}`}>
                        <i className="fa-solid fa-shopping-bag p-2 rounded-full text-[20px]"></i></Link>

                    <Link to="/Cart" className={`text-md font-semibold rounded-full hover:text-yellow-600 ${currentPath === "/Cart" ? " text-yellow-600 " : ""}`}>
                        <i className="fa-solid fa-cart-shopping p-2 rounded-full text-[20px]"></i></Link>

            </div>
            <div className="max-w-screen-xl w-2/4 mx-auto py-1 hidden lg:block">
                <ul className="flex justify-between items-center xl:gap-4  ">
                    <li> <Link to="/" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent rounded-3xl hover:text-black hover:bg-gray-200 transition-colors  ease-in-out duration-500 ${currentPath === "/" ? "bg-gray-300 text-black" : "bg-white text-black"}`}> Home</Link></li>
                    <li> <Link to="/Dining" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent hover:text-black hover:bg-gray-200 transition-colors ease-in-out duration-500 ${currentPath === "/Dining" ? "bg-gray-200 text-black " : "bg-white text-black"}`}>Dining</Link></li>
                    <li> <Link to="/Lighting" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent hover:text-black hover:bg-gray-200 transition-colors ease-in-out duration-500 ${currentPath === "/Lighting" ? "bg-gray-200 text-black " : "bg-white text-black"}`}>Lighting</Link></li>
                    <li> <Link to="/Decor" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent hover:text-black hover:bg-gray-200 transition-colors ease-in-out duration-500 ${currentPath === "/Decor" ? "bg-gray-200 text-black " : "bg-white text-black"}`}>Decor</Link></li>
                    <li> <Link to="/Garden" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent hover:text-black hover:bg-gray-200 transition-colors ease-in-out duration-500 ${currentPath === "/Garden" ? "bg-gray-200 text-black " : "bg-white text-black"}`}>Garden</Link></li>
                    <li> <Link to="/About" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent hover:text-black hover:bg-gray-200 transition-colors ease-in-out duration-500 ${currentPath === "/About" ? "bg-gray-200 text-black " : "bg-white text-black"}`}>About</Link></li>
                    <li><Link to="/Contact" className={`text-sm font-semibold rounded-full py-1.5 px-4  border-transparent hover:text-black hover:bg-gray-200 transition-colors ease-in-out duration-500 ${currentPath === "/Contact" ? "bg-gray-200 text-black " : "bg-white text-black"} `}>Contact</Link></li>
                </ul>
            </div>
            <div className="max-w-screen-xl mx-auto p-2 pl-4 flex gap-4 justify-between items-center lg:hidden">
                <button onClick={() => setIsOpen(!isOpen)} className="p-2">
                    <i className="fa-solid fa-bars text-2xl"></i>  {/* Sidebar Toggle Button */}
                </button>
                <div className="flex w-full border-2 border-gray-600 rounded-full overflow-hidden">
                    <input type="search" placeholder="Search for anything" className="w-full px-4 py-2 outline-none" />
                    <button className="bg-yellow-600 text-white rounded-full hover:rounded-none m-1"><i className="fa-solid fa-magnifying-glass m-2"></i></button>
                </div>
            </div>
            

            <div className={`w-1/2 p-2 border lg:hidden absolute top-0 left-0 h-screen bg-white z-10 transition duration-500 ${isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full"}`}>
                <div className="flex justify-between items-center py-5">
                    <div className="logo">
                        <img src={logo} alt="Logo" width="70px" />
                    </div>
                    <i className="fa-solid fa-xmark pr-4 text-xl" onClick={() => setIsOpen(!isOpen)}></i>

                </div>
                <ul className="sidebar flex flex-col gap-5">
                    <Link to="/" className="flex justify-between hover:bg-gray-200 items-center rounded-full pb-2 p-1 px-3">
                        <li className={`text-lg font-medium  ${currentPath === "/" ? "sidebar-hidden" : ""} `}> Home</li>
                        <i className="fa-solid fa-arrow-right"></i></Link>
                    <Link to="/Dining" className="flex justify-between hover:bg-gray-200 items-center rounded-full pb-2 p-1 px-3">
                        <li className="text-lg font-medium rounded-full  ">Dining </li>
                        <i className="fa-solid fa-arrow-right"></i></Link>
                    <Link to="/Lighting" className="flex justify-between hover:bg-gray-200 items-center rounded-full pb-2 p-1 px-3">
                        <li className="text-lg font-medium rounded-full ">Lighting</li>
                        <i className="fa-solid fa-arrow-right"></i></Link>

                    <Link to="/Decor" className="flex justify-between hover:bg-gray-200 items-center rounded-full pb-2 p-1 px-3">
                        <li className="text-lg font-medium rounded-full ">Decor</li>
                        <i className="fa-solid fa-arrow-right"></i></Link>

                    <Link to="/Garden" className="flex justify-between hover:bg-gray-200 items-center rounded-full pb-2 p-1 px-3">
                        <li className="text-lg font-medium rounded-full ">Garden</li>
                        <i className="fa-solid fa-arrow-right"></i></Link>

                    <Link to="/About" className="flex justify-between hover:bg-gray-200 items-center rounded-full pb-2 p-1 px-3">
                        <li className="text-lg font-medium rounded-full  ">About Us</li>
                        <i className="fa-solid fa-arrow-right"></i></Link>

                    <Link to="/Contact" className="flex justify-between hover:bg-gray-200 items-center rounded-full pb-2 p-1 px-3">
                        <li className="text-lg font-medium">Contact</li>
                        <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                </ul>
            </div>

            <hr className="border border-gray-300 w-full" />
        </nav>

    );
}

export default Navbar;









////////////////////////////////about//////////////////////////////////////////////////////////////////////////////////

import Img1 from "../assets/aboutimg/aboutimg1.webp"
import Img4 from "../assets/aboutimg/aboutimg4.webp"
import Img5 from "../assets/aboutimg/aboutimg5.png"
import Img6 from "../assets/aboutimg/aboutimg6.jpeg"
import Img7 from "../assets/aboutimg/aboutimg7.jpg"
import Img8 from "../assets/aboutimg/aboutimg8.jpg"
import Img9 from "../assets/aboutimg/aboutimg9.jpg"
import Img10 from "../assets/aboutimg/aboutimg10.jpg"
import Img11 from "../assets/aboutimg/aboutimg11.jpg"
import Img12 from "../assets/aboutimg/aboutimg12.png"
import { motion } from "framer-motion";
import { motion_bottom_to_top, banner, fadein, motion_left_to_right, motion_right_to_left } from "../variables/animation";

const img = [Img6, Img7, Img8, Img9, Img10, Img11];

const About = () => {
    // const [isOpen, setIsOpen] = useState(false);

    return (
        <>

            <section className="About max-w-screen-2xl lg:mb-32 md:mb-10 mb-5">

                <div className="bg-gray-100 py-12">
                    <div className="max-w-6xl mx-auto text-center">
                        <h2 className="text-4xl font-bold text-gray-800">About Us</h2>
                        <p className="text-gray-600 mt-2">Get to know our story and passion for handcrafted art!</p>
                    </div>
                </div>

                <div className="max-w-[1360px] mx-auto lg:my-12 md:my-5 my-3">
                    <div className="grid grid-cols-12 sm:gap-10">
                        <motion.div {...motion_left_to_right} className="lg:col-span-6 md:col-span-5 col-span-12"><img src={Img1} alt="" className="w-full h-auto object-cover" /></motion.div>

                        <motion.div {...motion_right_to_left} className="flex items-center lg:col-span-6 md:col-span-7 col-span-12 lg:p-0 p-4">
                            <div className="flex flex-col">
                                {/* <img src={Img2} alt="" className="lg:size-20 size-10" /> */}
                                <div className="lg:text-5xl sm:text-xl text-sm ">
                                    Experience the Transformative Power of Art at ArtEssence
                                </div>
                                <svg xmlns="http://www.w3.org/2000/svg" className="size-10">
                                    <path d="M0 16.5 L3000 16.5" fill="none" stroke="#8d8032" strokeWidth="3px" ></path>
                                </svg>
                                <div className="space-y-3">
                                    <h2 className=" lg:text-lg sm:text-base text-sm ">Let your creativity soar and become a part of our vibrant community.</h2>
                                    <p className=" lg:text-base sm:text-sm text-xs text-justify">Our mission is to inspire and empower individuals of all ages and skill levels to explore their creative potential. Through our diverse range of workshops and courses, we provide a platform for artistic growth and self-discovery.</p>
                                    <p className=" lg:text-base sm:text-sm text-xs text-justify">With a team of experienced artists and instructors, we offer a supportive and encouraging environment where creativity flourishes. Whether you are a beginner taking your first steps in the art world or an experienced artist seeking further inspiration, our programs are designed to cater to your needs and aspirations.</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            <motion.section {...motion_bottom_to_top} className="vision lg:my-32 md:my-10 my-5">
                <div className="max-w-[1360px] mx-auto ">

                    <div className="grid grid-cols-12 lg:gap-12 sm:gap-4 gap-0 p-4 lg:p-0  lg:my-24  md:my-5 my-3">
                        <div className="md:col-span-4 col-span-12 sspace-y-5">
                            {/* <img src={Img3} alt="" className="lg:size-15 size-10" /> */}
                            <div className="lg:text-4xl sm:text-xl text-base  ">Learn About Our Mission and Vision</div>
                            <div className="lg:text-lg sm:text-sm text-xs  text-justify">We create our workshops with love for hand work and collaboration.</div>
                        </div>
                        <div className="md:col-span-4 col-span-12 space-y-5">
                            <div className="lg:text-xl sm:text-base text-sm  font-semibold">Our Mission</div>
                            <p className=" lg:text-base sm:text-sm text-xs text-justify">Our mission at ArtEssence is to ignite creativity, inspire artistic exploration, and nurture a deep appreciation for the arts.</p>
                            <p className=" lg:text-base sm:text-sm text-xs text-justify">We strive to provide a welcoming and inclusive space where individuals of all backgrounds can unleash their creativity, develop their artistic skills, and express themselves authentically.</p>
                        </div>
                        <div className="md:col-span-4 col-span-12 space-y-5">
                            <div className="lg:text-xl text-base  font-semibold">Our Vision</div>
                            <p className=" lg:text-base sm:text-sm text-xs text-justify">We believe that pottery should be accessible to all. We strive to make it easy to come together and create unique pieces of art.</p>
                            <p className=" lg:text-base sm:text-sm text-xs text-justify">We’re committed to fostering a love of pottery in all forms by providing a place where everyone can come to learn, discover, practice and create items that brings them joy and pride.

                            </p>
                        </div>

                    </div>
                    <img src={Img4} alt="" className="sm:pt-10 pt-5 w-full object-cover lg:max-h-[450px] max-h-[300px] lg:p-0 p-4" />
                </div>

            </motion.section>

            <motion.section {...banner} className="gift lg:my-32 md:my-10 my-5">
                <div className="max-w-[1360px] mx-auto ">
                    <div className="grid md:grid-cols-2 grid-cols-1 lg:gap-20 sm:gap-10 gap-5 p-4 lg:p-0">
                        <div className=" flex items-center">
                            <h2 className="lg:text-5xl sm:text-2xl text-sm ">Place your first order and get 50% off on any product!</h2>
                        </div>
                        <div className="">
                            <img src={Img12} alt="" className="w-full max-h-[350px] object-cover" />
                        </div>
                    </div>
                </div>
            </motion.section>

            <motion.section {...fadein} className="meetOurSeller lg:my-32 md:my-10 my-5">
                <div className="max-w-6xl mx-auto ">
                    <div className="lg:text-3xl sm:text-xl text-sm font-semibold  text-center">
                        Meet Our Seller
                    </div>
                    <div className="lg:text-xl sm:text-sm text-xs text-center sm:py-5 py-2">These artisans carefully design and create handmade products with excellent quality.</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:space-y-10 md:gap-0 gap-5 sm:space-y-5 space-y-2 place-items-center">
                        {img.map((item, index) => (
                            <div className=" col-span-1 " key={index}>
                                <div> <img src={item} alt="" className="rounded-full   transition-transform duration-300 ease-in-out hover:scale-105  object-cover" />
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </motion.section>

            <motion.section {...motion_bottom_to_top} className="Questions lg:my-32 md:my-10 my-5 ">
                <div className="max-w-[1360px] mx-auto ">
                    <div className="grid grid-cols-12 md:gap-10 p-4 lg:p-0">
                        <div className="lg:col-span-7 col-span-12 flex flex-col justify-center ">
                            <h2 className="lg:text-5xl sm:text-2xl text-sm  font-semibold">Have Questions? Read Our Frequently Asked Questions</h2>
                            <svg xmlns="http://www.w3.org/2000/svg" className="size-10">
                                <path d="M0 16.5 L3000 16.5" fill="none" stroke="#8d8032" strokeWidth="3px" ></path>
                            </svg>
                            <div className="space-y-5 ">

                                <div className="lg:text-xl sm:text-base text-sm text-justify text-amber-700">If you have any further questions or need more information, please dont hesitate to contact our friendly team.</div>
                                <div className="space-y-4">
                                    <div className="group">

                                        <div className="flex justify-between items-center cursor-pointer">
                                            <div className="lg:text-lg sm:text-sm text-xs   font-semibold">
                                                How can I contact customer support if I have an issue?
                                            </div>
                                            <div className="lg:text-4xl sm:text-2xl text-lg font-semibold duration-700  group-hover:rotate-45 transition-transform ">+</div>
                                        </div>
                                        <hr className="w-full" />
                                        <p className="opacity-0 max-h-0 transition-all duration-700 ease-in-out group-hover:max-h-2 group-hover:block text-gray-600 group-hover:opacity-100 ">
                                            You can reach our customer support via email, phone, or live chat available on our website.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 ">
                                    <div className="group">

                                        <div className="flex justify-between items-center cursor-pointer">
                                            <div className="lg:text-lg sm:text-sm text-xs  font-semibold">
                                                Do I need to create an account to shop?
                                            </div>
                                            <div className="lg:text-4xl sm:text-2xl text-lg font-semibold  group-hover:rotate-45 transition-transform duration-700">+</div>
                                        </div>
                                        <hr className="w-full" />

                                        <p className="opacity-0 max-h-0 transition-all duration-700 ease-in-out group-hover:max-h-2 group-hover:block text-gray-600 group-hover:opacity-100 ">
                                            Yes, you need to create an account to place an order and track your purchases.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 ">
                                    <div className="group">

                                        <div className="flex justify-between items-center cursor-pointer">
                                            <div className="lg:text-lg sm:text-sm text-xs  font-semibold">
                                                Are the handicrafts handmade and authentic?
                                            </div>
                                            <div className="lg:text-4xl sm:text-2xl text-lg font-semibold  group-hover:rotate-45 transition-transform duration-700">+</div>
                                        </div>
                                        <hr className="w-full" />

                                        <p className="opacity-0 max-h-0 transition-all duration-700 ease-in-out group-hover:max-h-2 group-hover:block text-gray-600 group-hover:opacity-100 ">
                                            Yes, all our products are 100% handmade by skilled artisans using high-quality materials.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 ">
                                    <div className="group">

                                        <div className="flex justify-between items-center cursor-pointer">
                                            <div className="lg:text-lg sm:text-sm text-xs  font-semibold">
                                                How can I track my order status?      </div>
                                            <div className="lg:text-4xl sm:text-2xl text-lg font-semibold  group-hover:rotate-45 transition-transform duration-700">+</div>
                                        </div>
                                        <hr className="w-full" />

                                        <p className="opacity-0 max-h-0 transition-all duration-700 ease-in-out group-hover:max-h-2 group-hover:block text-gray-600 group-hover:opacity-100 ">
                                            Once your order is shipped, you will receive a tracking link via email or SMS.
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 ">
                                    <div className="group">

                                        <div className="flex justify-between items-center cursor-pointer">
                                            <div className="lg:text-lg sm:text-sm text-xs  font-semibold">
                                                Can I return a product if I don’t like it?   </div>
                                            <div className="lg:text-4xl sm:text-2xl text-lg font-semibold  group-hover:rotate-45 transition-transform duration-700">+</div>
                                        </div>
                                        <hr className="w-full" />

                                        <p className="opacity-0 max-h-0 transition-all duration-700 ease-in-out group-hover:max-h-2 group-hover:block text-gray-600 group-hover:opacity-100 ">
                                            Yes, we offer easy returns within a specified period. Please check our return policy for details
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 ">
                                    <div className="group">

                                        <div className="flex justify-between items-center cursor-pointer">
                                            <div className="lg:text-lg sm:text-sm text-xs  font-semibold">
                                                Can I cancel my order after placing it?  </div>
                                            <div className="lg:text-4xl sm:text-2xl text-lg font-semibold  group-hover:rotate-45 transition-transform duration-700">+</div>
                                        </div>
                                        <hr className="w-full" />

                                        <p className="opacity-0 max-h-0 transition-all duration-700 ease-in-out group-hover:max-h-2 group-hover:block text-gray-600 group-hover:opacity-100 ">
                                            Yes, you can cancel your order within a limited time before it is shipped.</p>
                                    </div>
                                </div>

                                <div className="space-y-4 ">
                                    <div className="group">

                                        <div className="flex justify-between items-center cursor-pointer">
                                            <div className="lg:text-lg sm:text-sm text-xs  font-semibold">
                                                How long does delivery take?  </div>
                                            <div className="lg:text-4xl sm:text-2xl text-lg font-semibold  group-hover:rotate-45 transition-transform duration-700">+</div>
                                        </div>
                                        <hr className="w-full" />

                                        <p className="opacity-0 max-h-0 transition-all duration-700 ease-in-out group-hover:max-h-2 group-hover:block text-gray-600 group-hover:opacity-100 ">
                                            Delivery time varies by location, but it usually takes 3-7 business days.
                                        </p>
                                    </div>
                                </div>                    </div></div>
                        <div className="md:col-span-5 col-span-12   max-h-[500px] justify-center flex items-center hidden lg:flex "><img src={Img5} alt="" className="object-cover object-center transition-all duration-500 ease-in-out" /></div>
                    </div>
                </div>
            </motion.section>



        </>
    );
};

export default About;


/////////////////////////////////////payment/////////////////////////////////////////////////////////////////////////////////////////
import { useState } from "react";
import PropTypes from "prop-types";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";


const PaymentForm = ({ amount, cartItems }) => { // Add cartItems prop
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please login to make payment");
                navigate("/login");
                return;
            }

            // Create payment intent
            const { data } = await axios.post(
                "http://localhost:5000/api/payment/create-payment-intent",
                { amount: Math.round(amount * 100) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );

            if (!data.clientSecret) {
                throw new Error("Failed to initialize payment");
            }

            // Process payment
            const { error: paymentError, paymentIntent } = await stripe.confirmCardPayment(
                data.clientSecret,
                {
                    payment_method: {
                        card: elements.getElement(CardElement),
                        billing_details: {
                            name: localStorage.getItem("userName") || 'Customer',
                        },
                    },
                }
            );

            if (paymentError) {
                throw new Error(paymentError.message);
            }

            if (paymentIntent.status === 'succeeded') {
                try {
                    // Create order after successful payment
                    const orderResponse = await axios.post(
                        'http://localhost:5000/api/order/add',
                        {
                            items: cartItems.map(item => ({
                                productId: item.productId._id,
                                title: item.productId.title,
                                price: Number(item.productId.price.replace(/[^0-9.-]+/g, "")),
                                quantity: item.quantity
                            })),
                            totalAmount: amount,
                            paymentIntentId: paymentIntent.id
                        },
                        {
                            headers: { Authorization: `Bearer ${token}` }
                        }
                    );

                    console.log("Order created:", orderResponse.data);
                    toast.success('Order placed successfully!');


                    navigate('/OrdersPage', { replace: true });
                } catch (orderError) {
                    console.error("Order creation failed:", orderError);
                    toast.error("Payment successful but order creation failed");
                }
            }
        } catch (error) {
            console.error("Payment error:", error);
            const errorMessage = error.response?.data?.error || error.message || "Payment failed";
            toast.error(errorMessage);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <form onSubmit={handleSubmit} className="space-y-6" role="form">
                <div className="p-4 border rounded-md bg-gray-50">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Details
                        <CardElement
                            options={{
                                style: {
                                    base: {
                                        fontSize: '16px',
                                        color: '#424770',
                                        '::placeholder': {
                                            color: '#aab7c4',
                                        },
                                    },
                                    invalid: {
                                        color: '#9e2146',
                                    },
                                },
                                hidePostalCode: true
                            }}
                            className="mt-1"
                        />
                    </label>
                </div>

                <button
                    type="submit"
                    disabled={!stripe || loading}
                    className={`w-full py-2 px-4 rounded-md text-white font-medium
                        ${loading
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-yellow-600 hover:bg-yellow-700'
                        }`}
                    aria-busy={loading}
                >
                    {loading ? "Processing..." : `Pay ₹${amount}`}
                </button>

                {error && (
                    <div role="alert" className="text-red-500 text-sm text-center">
                        {error}
                    </div>
                )}
            </form>
        </div>
    );
};

PaymentForm.propTypes = {
    amount: PropTypes.number.isRequired,
    cartItems: PropTypes.array.isRequired
};

export default PaymentForm;

