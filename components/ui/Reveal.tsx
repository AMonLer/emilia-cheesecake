'use client'

import { useRef, useEffect, useState, type ReactNode } from 'react'

interface RevealProps {
    children: ReactNode
    className?: string
    /** Delay in ms before the entrance plays (used for staggering). */
    delay?: number
    /** Vertical travel distance in px. */
    y?: number
    /** How much of the element must be visible before it reveals (0-1). */
    amount?: number
}

/**
 * Lightweight scroll-reveal wrapper. Fades + lifts its children into place the
 * first time they enter the viewport, using an expo-out easing for a soft,
 * expensive-feeling settle. Honors prefers-reduced-motion (renders instantly).
 * No animation library required.
 */
export default function Reveal({
    children,
    className = '',
    delay = 0,
    y = 24,
    amount = 0.15,
}: RevealProps) {
    const ref = useRef<HTMLDivElement>(null)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReduced) {
            setVisible(true)
            return
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setVisible(true)
                        observer.unobserve(entry.target)
                    }
                })
            },
            { threshold: amount, rootMargin: '0px 0px -8% 0px' },
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [amount])

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : `translateY(${y}px)`,
                transition: `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
                willChange: visible ? 'auto' : 'opacity, transform',
            }}
        >
            {children}
        </div>
    )
}
