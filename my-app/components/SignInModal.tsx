"use client";
import React, { useState } from "react";

interface SignInModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignUp: () => void;
    setUser: (user: { id: number; name: string; email: string } | null) => void; // ✅ Ensure setUser is defined
}

const SignInModal: React.FC<SignInModalProps> = ({ isOpen, onClose, onSwitchToSignUp, setUser }) => { // ✅ Now we can use setUser
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log("Sending login request:", formData);
            const response = await fetch("http://localhost:5001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) {
                console.log("Login failed");
                setError(data.error);
            } else {
                console.log("Login successful, token received:", data.token);
                localStorage.setItem("token", data.token);

                // ✅ Fetch user details immediately
                const profileResponse = await fetch("http://localhost:5001/profile", {
                    method: "GET",
                    headers: { Authorization: `Bearer ${data.token}` },
                });

                if (!profileResponse.ok) throw new Error("Failed to get user profile");

                const userData = await profileResponse.json();
                console.log("User data fetched:", userData);

                setUser(userData); // ✅ Update user state immediately
                onClose(); // ✅ Close the login modal
            }
        } catch (error) {
            console.error("Login error:", error);
            setError(error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                <h2 className="text-2xl font-bold text-center text-gray-800">Sign In</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-md text-black"
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-md text-black"
                    />
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
                        Sign In
                    </button>
                </form>

                <p className="text-center mt-4 text-gray-600">
                    Don't have an account?{" "}
                    <span className="text-blue-500 cursor-pointer font-semibold" onClick={onSwitchToSignUp}>
                        Sign Up
                    </span>
                </p>

                <button
                    onClick={onClose}
                    className="mt-4 w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default SignInModal;
