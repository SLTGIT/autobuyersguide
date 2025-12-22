'use client';

import type { Metadata } from 'next';
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
        <div className="container mx-auto px-4 py-12">
            {/* Page Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4 text-gray-800">Contact Us</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Get in touch with us. We'd love to hear from you!
                </p>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Contact Form */}
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800">Send us a message</h2>

                    {isSubmitted && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
                            Thank you for your message! We'll get back to you soon.
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="name" className="block text-gray-700 font-semibold mb-2">
                                Name *
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Your name"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                                Email *
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="subject" className="block text-gray-700 font-semibold mb-2">
                                Subject *
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="What is this about?"
                            />
                        </div>

                        <div className="mb-6">
                            <label htmlFor="message" className="block text-gray-700 font-semibold mb-2">
                                Message *
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={6}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                placeholder="Your message..."
                            ></textarea>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            Send Message
                        </button>
                    </form>
                </div>

                {/* Contact Information */}
                <div>
                    <div className="bg-white rounded-lg shadow-md p-8 mb-6">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Contact Information</h2>

                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="text-blue-600 text-2xl mr-4">📧</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Email</h3>
                                    <p className="text-gray-600">info@example.com</p>
                                    <p className="text-gray-600">support@example.com</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="text-blue-600 text-2xl mr-4">📞</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Phone</h3>
                                    <p className="text-gray-600">+1 234 567 890</p>
                                    <p className="text-gray-600">+1 234 567 891</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="text-blue-600 text-2xl mr-4">📍</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Address</h3>
                                    <p className="text-gray-600">123 Main Street</p>
                                    <p className="text-gray-600">Suite 100</p>
                                    <p className="text-gray-600">City, State 12345</p>
                                    <p className="text-gray-600">Country</p>
                                </div>
                            </div>

                            <div className="flex items-start">
                                <div className="text-blue-600 text-2xl mr-4">🕒</div>
                                <div>
                                    <h3 className="font-semibold text-gray-800">Business Hours</h3>
                                    <p className="text-gray-600">Monday - Friday: 9:00 AM - 6:00 PM</p>
                                    <p className="text-gray-600">Saturday: 10:00 AM - 4:00 PM</p>
                                    <p className="text-gray-600">Sunday: Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-600 text-white rounded-lg p-8">
                        <h3 className="text-xl font-bold mb-3">Need immediate help?</h3>
                        <p className="mb-4">
                            Check out our documentation or browse through our FAQ section for quick answers.
                        </p>
                        <div className="flex gap-3">
                            <button className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100 transition-colors">
                                View Docs
                            </button>
                            <button className="border border-white text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors">
                                View FAQ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
