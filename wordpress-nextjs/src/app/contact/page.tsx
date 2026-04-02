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
        <></>
    );
}
