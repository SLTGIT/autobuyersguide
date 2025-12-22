'use client';

import { VehicleImage } from '@/types/vehicle';
import { useState } from 'react';
import Image from 'next/image';

interface VehicleGalleryProps {
    featuredImage: string;
    galleryImages: VehicleImage[];
    title: string;
}

export default function VehicleGallery({ featuredImage, galleryImages, title }: VehicleGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(featuredImage);
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const allImages = [
        { url: featuredImage, alt: title },
        ...galleryImages.map(img => ({ url: img.large, alt: img.alt || title }))
    ].filter(img => img.url);

    return (
        <div className="vehicle-gallery">
            {/* Main Image */}
            <div className="gallery-main" onClick={() => setLightboxOpen(true)}>
                {selectedImage ? (
                    <Image
                        src={selectedImage}
                        alt={title}
                        width={800}
                        height={600}
                        className="main-image"
                        priority
                    />
                ) : (
                    <div className="image-placeholder">
                        <span>No Image Available</span>
                    </div>
                )}
            </div>

            {/* Thumbnails */}
            {allImages.length > 1 && (
                <div className="gallery-thumbnails">
                    {allImages.map((image, index) => (
                        <div
                            key={index}
                            className={`thumbnail ${selectedImage === image.url ? 'active' : ''}`}
                            onClick={() => setSelectedImage(image.url)}
                        >
                            <Image
                                src={image.url}
                                alt={image.alt}
                                width={100}
                                height={75}
                                className="thumbnail-image"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox */}
            {lightboxOpen && (
                <div className="gallery-lightbox" onClick={() => setLightboxOpen(false)}>
                    <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
                        <button className="lightbox-close" onClick={() => setLightboxOpen(false)}>
                            &times;
                        </button>
                        <Image
                            src={selectedImage}
                            alt={title}
                            width={1200}
                            height={900}
                            className="lightbox-image"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
