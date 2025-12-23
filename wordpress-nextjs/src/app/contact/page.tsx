'use client';

import Link from 'next/link';
import { useState, FormEvent } from 'react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: '',
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Here you would typically send the form data to your API
        console.log('Form submitted:', formData);

        // Show success message
        setIsSubmitted(true);

        // Reset form
        setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
        });

        // Hide success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    return (
        <div className="container mx-auto py-12 px-4">
            {/* Page Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">Contact Us</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Get in touch with us. We'd love to hear from you!
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Send us a message</h2>

                    {isSubmitted && (
                        <div className="mb-6 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg">
                            Thank you for your message! We'll get back to you soon.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                                placeholder="What is this about?"
                            />
                        </div>

                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={6}
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none"
                                placeholder="Your message..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors w-full shadow-lg shadow-blue-200 cursor-pointer"
                        >
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Contact Information */}
                <div className="space-y-8">
                    <div className="bg-gray-900 text-white p-8 rounded-xl shadow-xl">
                        <h2 className="text-2xl font-bold mb-8">Contact Information</h2>

                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="bg-blue-600 p-3 rounded-lg mr-4">
                                    <span className="text-xl">📧</span>
                                </div>
                                <div>
                                    <span className="block text-gray-400 text-sm uppercase font-bold tracking-wider">Email</span>
                                    <p className="text-lg">info@example.com</p>
                                    <p className="text-lg text-gray-400">support@example.com</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-blue-600 p-3 rounded-lg mr-4">
                                    <span className="text-xl">📞</span>
                                </div>
                                <div>
                                    <span className="block text-gray-400 text-sm uppercase font-bold tracking-wider">Phone</span>
                                    <p className="text-lg">+1 234 567 890</p>
                                    <p className="text-lg text-gray-400">+1 234 567 891</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-blue-600 p-3 rounded-lg mr-4">
                                    <span className="text-xl">📍</span>
                                </div>
                                <div>
                                    <span className="block text-gray-400 text-sm uppercase font-bold tracking-wider">Address</span>
                                    <p className="text-lg leading-relaxed">
                                        123 Main Street<br />
                                        Suite 100<br />
                                        City, State 12345<br />
                                        Country
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="bg-blue-600 p-3 rounded-lg mr-4">
                                    <span className="text-xl">🕒</span>
                                </div>
                                <div>
                                    <span className="block text-gray-400 text-sm uppercase font-bold tracking-wider">Business Hours</span>
                                    <p className="text-lg">Monday - Friday: 9:00 AM - 6:00 PM</p>
                                    <p className="text-lg">Saturday: 10:00 AM - 4:00 PM</p>
                                    <p className="text-lg text-gray-400">Sunday: Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-600 text-white p-8 rounded-xl shadow-lg relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold mb-4">Need immediate help?</h3>
                            <p className="text-blue-100 mb-8">
                                Check out our documentation or browse through our FAQ section for quick answers.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="#" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                                    View Docs
                                </Link>
                                <Link href="#" className="border-2 border-white text-white px-6 py-2 rounded-lg font-bold hover:bg-white/10 transition-colors">
                                    View FAQ
                                </Link>
                            </div>
                        </div>
                        {/* Decorative Circle */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-500 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
