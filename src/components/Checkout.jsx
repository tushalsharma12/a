import React from 'react';
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useLocation } from "react-router-dom";
import { Package, Truck, CreditCard, Shield } from 'lucide-react';
import PaymentForm from "../components/PaymentForm.jsx";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const Checkout = () => {
    const location = useLocation();
    const product = location.state?.product || {};
    

    const calculateTotal = () => {
        const subtotal = parseFloat(product.price) || 0;
        const shipping = 50;
        const total = subtotal + shipping ;
        return total.toFixed(2);
    };

    return (
        <Elements stripe={stripePromise}>
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column - Order Summary */}
                        <div className="lg:w-1/2">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
                                
                                <div className="flex items-start space-x-4 mb-6">
                                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                                        <img 
                                            src={product.img} 
                                            alt={product.title} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900">{product.title}</h3>
                                        <div className="flex items-center">
                                            <span className="text-sm text-gray-600">Quantity:</span>
                                            <input 
                                                type="number" 
                                                value={product.quantity} 
                                                min="1" 
                                                className="ml-2 w-16 border rounded p-1"
                                                onChange={(e) => updateQuantity(e.target.value)}
                                            />
                                        </div>
                                        <div className="mt-1 flex items-center">
                                            <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                                            {product.prev_price && (
                                                <span className="ml-2 text-sm text-gray-500 line-through">₹{product.prev_price}</span>
                                            )}
                                        </div>
                                        {product.discount && (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2">
                                                {product.discount}% OFF
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <dl className="space-y-3">
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-600">Subtotal</dt>
                                            <dd className="text-sm font-medium text-gray-900">₹{product.price}</dd>
                                        </div>
                                        <div className="flex justify-between">
                                            <dt className="text-sm text-gray-600">Shipping</dt>
                                            <dd className="text-sm font-medium text-gray-900">₹50</dd>
                                        </div>
                                        {product.discount && (
                                            <div className="flex justify-between text-green-600">
                                                <dt className="text-sm">Discount</dt>
                                                <dd className="text-sm font-medium">-₹{(product.price * (product.discount / 100)).toFixed(2)}</dd>
                                            </div>
                                        )}
                                        <div className="flex justify-between border-t border-gray-200 pt-3">
                                            <dt className="text-base font-medium text-gray-900">Total</dt>
                                            <dd className="text-base font-bold text-gray-900">₹{calculateTotal()}</dd>
                                        </div>
                                    </dl>
                                </div>

                                <div className="mt-8">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Why Shop With Us</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                                            <Package className="w-5 h-5 text-indigo-600" />
                                            <span>Handcrafted Quality</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                                            <Truck className="w-5 h-5 text-indigo-600" />
                                            <span>Fast Delivery</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                                            <Shield className="w-5 h-5 text-indigo-600" />
                                            <span>Secure Shopping</span>
                                        </div>
                                        <div className="flex items-center space-x-3 text-sm text-gray-600">
                                            <CreditCard className="w-5 h-5 text-indigo-600" />
                                            <span>Easy Payments</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Payment Form */}
                        <div className="lg:w-1/2">
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
                                <PaymentForm amount={calculateTotal()} cartItems={[]} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Elements>
    );
};

export default Checkout;