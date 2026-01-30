export default function Marquee() {
    return (
        <div className="bg-black text-white py-4 overflow-hidden">
            <div className="flex whitespace-nowrap animate-marquee">
                {[...Array(10)].map((_, i) => (
                    <span key={i} className="inline-block px-8 font-black text-sm tracking-wide">
                        10% RABATT AB 100 CHF • GRATIS VERSAND
                    </span>
                ))}
            </div>
        </div>
    )
}
