import React, { useState, useEffect } from 'react';
import './HeroCarousel.css';

const images = [
    {
        url: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=2670&auto=format&fit=crop',
        alt: 'Fresh Vegetables'
    },

    {
        url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2670&auto=format&fit=crop',
        alt: 'Healthy Dish'
    },
    {
        url: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2670&auto=format&fit=crop',
        alt: 'Fresh Salad'
    }
];

const HeroCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000); // Change image every 5 seconds

        return () => clearInterval(interval);
    }, []);

    return null;

    return (
        <div className="hero-carousel">
            {images.map((image, index) => (
                <div
                    key={index}
                    className={`hero-slide ${index === currentIndex ? 'active' : ''}`}
                    style={{ backgroundImage: `url(${image.url})` }}
                >
                    <div className="hero-overlay"></div>
                </div>
            ))}

            <div className="hero-content">
                <h2 className="hero-title">
                    프레시 & 슬로우
                </h2>
                <p className="hero-subtitle">
                    신선하고 지속 가능한 식재료로 만든 맛있는 레시피를 발견하세요.<br />
                    요리의 과정을 천천히 즐겨보세요.
                </p>
            </div>

            <div className="hero-indicators">
                {images.map((_, index) => (
                    <button
                        key={index}
                        className={`indicator-dot ${index === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(index)}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;
