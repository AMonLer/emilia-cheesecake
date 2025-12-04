'use client'

import { useState, useEffect } from 'react'

const slides = [
  {
    id: 1,
    title: 'PUMPKIN CHEESECAKE IS BACK',
    image1: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=900&h=900&fit=crop&q=80',
    image2: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=900&h=500&fit=crop&q=80',
    reviews: '37,910 Reviews',
    description: 'At last, Pumpkin Cheesecake is back in its creamy, fall glory. With a graham cracker crust and perfectly smooth pumpkin filling, it\'s no surprise this cheesecake is a hit every holiday.',
    promos: [
      { amount: '$20 Off Orders $100+', code: 'EMILIA20' },
      { amount: '$25 Off Orders $125+', code: 'EMILIA25' },
    ],
    bgColor1: 'bg-[#6B8E6F]',
    bgColor2: 'bg-orange-100',
  },
  {
    id: 2,
    title: 'CLASSIC NEW YORK CHEESECAKE',
    image1: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=900&h=900&fit=crop&q=80',
    image2: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=900&h=500&fit=crop&q=80',
    reviews: '37,910 Reviews',
    description: 'The iconic New York cheesecake that started it all. Rich, creamy, and dense with the perfect balance of sweet and tangy. This is what dreams are made of.',
    promos: [
      { amount: 'Free Shipping', code: 'Orders $75+' },
    ],
    bgColor1: 'bg-cream-200',
    bgColor2: 'bg-rose-50',
  },
  {
    id: 3,
    title: 'FALL TREATS DELIVERED',
    image1: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=900&h=900&fit=crop&q=80',
    image2: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=900&h=500&fit=crop&q=80',
    reviews: '37,910 Reviews',
    description: 'The leaves are changing and your favorite Fall desserts are finally back. Our seasonal collection has earned thousands of 5-star reviews, and lucky for you we\'re shipping them straight to your door.',
    promos: [
      { amount: 'Same Day Delivery', code: 'Available' },
    ],
    bgColor1: 'bg-amber-100',
    bgColor2: 'bg-orange-50',
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative py-2 bg-white">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`transition-opacity duration-700 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'
          }`}
        >
          <div className="max-w-7xl mx-auto px-3">
            {/* Mobile Layout */}
            <div className="lg:hidden">
              <div className="relative rounded-2xl overflow-hidden" style={{ height: '500px' }}>
                <img
                  src="/mobil1.jpeg"
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                {/* Overlay content for mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-6">
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tighter leading-tight uppercase text-white mb-2">
                    {slide.title}
                  </h1>
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-yellow-400 text-base">★★★★★</span>
                    <span className="text-white text-xs font-black">{slide.reviews}</span>
                  </div>
                  <button className="bg-white text-black hover:bg-gray-100 font-black px-6 py-2.5 text-xs rounded-md tracking-tight uppercase w-fit">
                    ORDER NOW
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden lg:grid grid-cols-[45%_55%] gap-2 items-start">
              {/* Left - Large Image */}
              <div className="relative rounded-2xl overflow-hidden" style={{ height: '400px' }}>
                <img
                  src={slide.image1}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Right - Small Image + Content */}
              <div className="flex flex-col gap-2" style={{ height: '400px' }}>
                {/* Top - Small Image */}
                <div className="relative rounded-2xl overflow-hidden" style={{ height: '150px' }}>
                  <img
                    src={slide.image2}
                    alt={slide.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Bottom - Text Content */}
                <div className="flex-1 flex flex-col justify-start space-y-1.5 py-1">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter leading-[0.85] uppercase">
                    {slide.title}
                  </h1>

                  <div className="flex items-center gap-1.5">
                    <span className="text-yellow-500 text-base">★★★★★</span>
                    <span className="text-gray-900 text-xs font-black">{slide.reviews}</span>
                  </div>

                  <p className="text-xs leading-tight text-gray-700 pr-4">
                    {slide.description}
                  </p>

                  <div className="space-y-0 text-xs leading-tight">
                    {slide.promos.map((promo, idx) => (
                      <p key={idx} className="font-black text-gray-900">
                        {promo.amount} · Code {promo.code}
                      </p>
                    ))}
                  </div>

                  <div className="pt-1">
                    <button className="bg-black text-white hover:bg-gray-900 font-black px-6 py-2.5 text-xs rounded-md tracking-tight uppercase">
                      ORDER NOW
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-4 max-w-7xl mx-auto px-4">
        <button
          onClick={prevSlide}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Previous slide"
        >
          <svg className="h-6 w-6 text-gray-800" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-3 w-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-pink-500' : 'bg-gray-300'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={nextSlide}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Next slide"
        >
          <svg className="h-6 w-6 text-gray-800" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}
