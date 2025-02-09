"use client";

import React, {Key, useEffect, useState} from "react";
import Navbar from "../components/NavBar";
import SignInModal from "../components/SignInModal";
import SignUpModal from "../components/SignUpModal";
import Image from "next/image";

interface Product {
    id: number;
    name: string;
    category: string;
    price: number;
    image_url: string;
}

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <div className="bg-white rounded-lg shadow-md p-4 transform transition duration-300 hover:scale-105">
        <Image
            src={product.image_url}
            alt={product.name}
            width={150}
            height={150}
            className="w-full h-40 object-cover rounded-md"
        />
        <h2 className="text-black font-semibold mt-2">{product.name}</h2>
        <p className="text-gray-600">${product.price}</p>
        <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Add to Cart
        </button>
    </div>
);


const Home: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSignInOpen, setIsSignInOpen] = useState(false);
    const [isSignUpOpen, setIsSignUpOpen] = useState(false);
    const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);

    // Fetch products
    useEffect(() => {
        console.log("Fetching products...");
        fetch("http://localhost:5001/products")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load products");
                return res.json();
            })
            .then((data) => setProducts(data))
            .catch((error) => setError(error.message));
    }, []);

    // Check if the user is logged in
    useEffect(() => {
        console.log("Checking user authentication...");

        // Clear token on startup to prevent auto-login after restart
        const token = localStorage.getItem("token");

        if (!token) {
            setUser(null);
            return;
        }

        localStorage.removeItem("token"); // Force logout on restart
        setUser(null); // Reset user to ensure login button appears

        const fetchUserProfile = async () => {
            try {
                const response = await fetch("http://localhost:5001/profile", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error("Invalid token");
                }

                const userData = await response.json();
                localStorage.setItem("token", token); // Restore valid token
                setUser(userData);
            } catch (error) {
                console.error("Authentication error:", error.message);
                localStorage.removeItem("token"); // Ensure invalid tokens are removed
                setUser(null);
            }
        };

        fetchUserProfile();
    }, []);




    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar user={user}
                onLoginClick={() => {
                    setIsSignInOpen(true);
                    setIsSignUpOpen(false); // Always start with SignInModal
                }}
            />
            <SignInModal
                isOpen={isSignInOpen}
                onClose={() => setIsSignInOpen(false)}
                onSwitchToSignUp={() => {
                    setIsSignInOpen(false);
                    setIsSignUpOpen(true);
                }}
                setUser={setUser}
            />
            <SignUpModal
                isOpen={isSignUpOpen}
                onClose={() => setIsSignUpOpen(false)}
                onSwitchToSignIn={() => {
                    setIsSignUpOpen(false);
                    setIsSignInOpen(true);
                }}
            />

            <header className="text-center py-12 bg-blue-500 text-white">
                <h1 className="text-4xl font-bold">Welcome to E-Shop</h1>
                <p className="mt-2">Find the best deals on premium products</p>
                {user && <p className="text-lg mt-4">Hello, {user.name}!</p>}
            </header>

            <div className="container mx-auto z-0 p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {error ? (
                    <p className="text-center text-red-600">Error: {error}</p>
                ) : products.length > 0 ? (
                    products.map((product) => <ProductCard key={product.id} product={product} />)
                ) : (
                    <p className="text-center text-gray-600">Loading products...</p>
                )}
            </div>

            <footer className="text-center py-6 bg-gray-900 text-white mt-6">
                <p>&copy; 2025 E-Shop. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Home;
