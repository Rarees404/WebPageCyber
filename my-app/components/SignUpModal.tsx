"use client";
import React, { useState } from "react";

interface SignUpModal {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToSignIn: () => void; // New prop to switch to sign-in modal
}

const SignUpModal: React.FC<SignUpModal> = ({ isOpen, onClose, onSwitchToSignIn }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
    });
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            console.log("Sending signup request:", formData);
            const response = await fetch("http://localhost:5001/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error);

            console.log("Registration successful:", data);
            alert("Registration successful! You can now log in.");
            onClose();
        } catch (error) {
            console.error("Registration error:", error);
            setError(error.message);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                <h2 className="text-2xl font-bold text-center text-gray-800">Sign Up</h2>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-md text-black"
                    />
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
                    <input
                        type="text"
                        name="phone"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-md text-black"
                    />
                    <input
                        type="text"
                        name="address"
                        placeholder="Address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                        className="w-full p-3 border rounded-md text-black"
                    />
                    <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600">
                        Sign Up
                    </button>
                </form>

                <p className="text-center mt-4 text-gray-600">
                    Already have an account?{" "}
                    <span className="text-blue-500 cursor-pointer font-semibold" onClick={onSwitchToSignIn}>
                        Sign In
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

export default SignUpModal;
