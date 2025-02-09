"use client";

import React, { useEffect, useState } from "react";

interface Product {
    id: number;
    name: string;
    category: string;
    image: string;
    price: number;
    units: number;
}

interface OrderSummary {
    totalOrders: number;
    totalAmount: number;
}

interface Ticket {
    id: number;
    description: string;
    status: string;
}

interface Customer {
    id: number;
    name: string;
    phone: string;
    address: string;
}

const AdminDashboard: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: "", category: "", price: "", image: "", units: "" });
    const [loading, setLoading] = useState(true);

    // Authentication States
    const [adminId, setAdminId] = useState("");
    const [password, setPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        if (token) {
            setIsAuthenticated(true);
            fetchData();
        }
    }, []);

    const fetchData = () => {
        setLoading(true);
        fetch("http://localhost:5001/inventory", {
            headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
        })
            .then(res => res.json())
            .then(setProducts)
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));

        Promise.all([
            fetch("http://localhost:5001/orders/summary", {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            }).then(res => res.json()),
            fetch("http://localhost:5001/tickets", {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            }).then(res => res.json()),
            fetch("http://localhost:5001/customers", {
                headers: { Authorization: `Bearer ${localStorage.getItem("adminToken")}` },
            }).then(res => res.json()),
        ])
            .then(([orders, tickets, customers]) => {
                setOrderSummary(orders);
                setTickets(tickets);
                setCustomers(customers);
                setError(null);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    };
    const addProduct = () => {
        fetch("http://localhost:5001/inventory/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`
            },
            body: JSON.stringify(newProduct),
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setNewProduct({ name: "", category: "", price: "", image: "", units: "" }); // Reset form
                    setIsModalOpen(false);  // Close the modal
                    fetchData(); // Refresh inventory after adding
                }
            })
            .catch(err => setError(err.message));
    };

    const closeTicket = (ticketId: number) => {
        fetch(`http://localhost:5001/tickets/${ticketId}/close`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            },
        })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    fetchData(); // Refresh tickets after closing
                }
            })
            .catch(err => setError(err.message));
    };

    const handleLogin = () => {
        fetch("http://localhost:5001/loginadmin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: adminId, password }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    localStorage.setItem("adminToken", data.token);
                    setIsAuthenticated(true);
                    setLoginError(null);
                    fetchData();
                } else {
                    setLoginError(data.error || "Invalid credentials. Please try again.");
                }
            })
            .catch(() => setLoginError("Server error. Please try again later."));
    };

    const handleLogout = () => {
        localStorage.removeItem("adminToken");
        setIsAuthenticated(false);
    };

    if (!isAuthenticated) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-900 text-white">
                <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
                    <h2 className="text-yellow-400 text-xl font-bold text-center">Admin Login</h2>
                    {loginError && <p className="text-red-500 text-sm text-center">{loginError}</p>}
                    <input
                        type="text"
                        placeholder="Admin ID"
                        className="w-full p-2 mt-4 text-black"
                        value={adminId}
                        onChange={(e) => setAdminId(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full p-2 mt-2 text-black"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        onClick={handleLogin}
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="container mx-auto">
                <div className="flex justify-between items-center">
                    <h1 className="text-white text-3xl font-bold">Admin Dashboard</h1>
                    <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
                <p className="text-gray-300">Manage inventory, clients, and user tickets</p>
                {error && <p className="text-red-500">Error: {error}</p>}
                {loading && <p className="text-gray-400">Loading...</p>}

                {/* Order Summary */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-yellow-400 text-xl font-bold">Orders Summary</h2>

                        <p className="text-white font-semibold">Total Orders: {orderSummary?.totalOrders || 0}</p>
                        <p className="text-white font-semibold">Total Revenue: ${orderSummary?.totalAmount || 0}</p>

                        <button onClick={() => setIsModalOpen(true)}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mt-4">
                            Add Product
                        </button>

                        {isModalOpen && (
                            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
                                    <h2 className="text-yellow-400 text-xl font-bold text-center">Add New Product</h2>

                                    <input type="text" placeholder="Product Name"
                                           value={newProduct.name}
                                           onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                                           className="text-black p-2 w-full mt-2"/>

                                    <input type="text" placeholder="Category"
                                           value={newProduct.category}
                                           onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                                           className="text-black p-2 w-full mt-2"/>

                                    <input type="number" placeholder="Price"
                                           value={newProduct.price}
                                           onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                                           className="text-black p-2 w-full mt-2"/>

                                    <input type="text" placeholder="Image URL"
                                           value={newProduct.image}
                                           onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                                           className="text-black p-2 w-full mt-2"/>

                                    <input type="number" placeholder="Number of Units"
                                           value={newProduct.units}
                                           onChange={(e) => setNewProduct({...newProduct, units: e.target.value})}
                                           className="text-black p-2 w-full mt-2"/>

                                    <div className="flex justify-between mt-4">
                                        <button onClick={addProduct}
                                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                            Confirm
                                        </button>
                                        <button onClick={() => setIsModalOpen(false)}
                                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Open Tickets */}
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-yellow-400 text-xl font-bold">Open Tickets</h2>
                        {tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <div key={ticket.id} className="mt-4">
                                    <p className="text-white font-semibold">{ticket.description}</p>
                                    <button
                                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                                        onClick={() => closeTicket(ticket.id)}
                                    >
                                        Close Ticket
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400">No open tickets.</p>
                        )}
                    </div>
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-yellow-400 text-xl font-bold mt-6">Customer Details</h2>
                        {customers.length > 0 ? (
                            customers.map(customer => (
                                <div key={customer.id} className="mt-4 border-b border-gray-700 pb-2">
                                    <p className="text-white font-semibold">{customer.name}</p>
                                    <p className="text-gray-400">Phone: {customer.phone}</p>
                                    <p className="text-gray-400">Address: {customer.address}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400">No customers available.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
