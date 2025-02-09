"use client";
import React, { useState, useEffect, useRef } from "react";
import { FcGlobe } from "react-icons/fc";
import { FaShoppingCart, FaBars, FaTimes, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";

interface NavbarProps {
    user: { id: number; name: string; email: string } | null;
    onLoginClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLoginClick }) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [cartItems] = useState(2);
    const dropdownRef = useRef<HTMLDivElement | null>(null);


    // Close dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="bg-gray-900 text-white px-6 py-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                    <FcGlobe className="text-4xl" />
                    <h1 className="text-2xl font-bold tracking-wide">E-Shop</h1>
                </div>

                {/* Menu Links */}
                <ul className="hidden md:flex space-x-8 text-lg">
                    <li className="hover:text-gray-400 cursor-pointer transition duration-300">Home</li>
                    <li className="hover:text-gray-400 cursor-pointer transition duration-300">Products</li>
                    <li className="hover:text-gray-400 cursor-pointer transition duration-300">Contact</li>
                </ul>

                {/* Right Section */}
                <div className="flex items-center space-x-6">
                    {/* Cart Icon */}
                    <div className="relative cursor-pointer">
                        <FaShoppingCart className="text-2xl hover:text-gray-400 transition duration-300" />
                        {cartItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {cartItems}
                            </span>
                        )}
                    </div>

                    {/* Account Section */}
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="bg-green-500 px-4 py-2 rounded-md hover:bg-green-600 transition flex items-center space-x-2"
                            >
                                <FaUser />
                                <span>My Account</span>
                            </button>

                            {/* Dropdown Menu */}
                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 shadow-lg rounded-md overflow-hidden">
                                    <ul className="text-sm">
                                        <li className="px-4 py-3 border-b font-semibold">{user.name}</li>
                                        <li
                                            className="px-4 py-2 flex items-center space-x-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => alert("Navigate to settings")}
                                        >
                                            <FaCog /> <span>Settings</span>
                                        </li>
                                        <li
                                            className="px-4 py-2 flex items-center space-x-2 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => alert("Navigate to My Cart")}
                                        >
                                            <FaShoppingCart /> <span>My Cart</span>
                                        </li>
                                        <li
                                            className="px-4 py-2 flex items-center space-x-2 text-red-600 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => {
                                                localStorage.removeItem("token");
                                                window.location.reload(); // Force refresh on logout
                                            }}
                                        >
                                            <FaSignOutAlt /> <span>Logout</span>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={onLoginClick}
                            className="bg-blue-500 px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center space-x-2"
                        >
                            <FaUser />
                            <span>Login</span>
                        </button>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button className="md:hidden text-2xl" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FaTimes /> : <FaBars />}
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
