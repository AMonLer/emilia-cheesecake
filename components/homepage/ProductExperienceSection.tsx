import Image from "next/image"

export default function ProductExperienceSection() {
    return (
        <section className="py-16 md:py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Image Side (Left on Desktop) */}
                    <div className="relative order-1 group">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[#EEC8B7] rounded-full mix-blend-multiply filter blur-[80px] opacity-40 group-hover:opacity-60 transition-opacity duration-700 pointer-events-none -z-10" />
                        <div className="relative h-[400px] lg:h-[600px] w-full transform transition-transform duration-700 group-hover:-translate-y-2">
                            <Image
                                src="/4.jpg"
                                alt="Liebe zum Detail"
                                fill
                                className="object-cover rounded-[2rem] shadow-2xl shadow-[#651A1A]/10 border border-white/50"
                            />
                        </div>
                        {/* Decorative elements matching QualitySection style */}
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#F5E6D3] rounded-full -z-10 hidden lg:block opacity-60"></div>
                        <div className="absolute -top-6 -left-6 w-24 h-24 border-4 border-[#651A1A]/10 rounded-full -z-10 hidden lg:block"></div>
                    </div>

                    {/* Text Side (Right on Desktop) */}
                    <div className="space-y-8 order-2 text-center">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.05] text-[#651A1A]">
                                SAN SEBASTIAN
                                <br />
                                <span className="font-serif italic font-medium capitalize text-5xl md:text-6xl lg:text-7xl text-[#651A1A]/90 tracking-normal mr-2">Cheesecake</span> AUS ZÜRICH
                            </h2>
                            <div className="w-24 h-5 bg-[#dec181] mx-auto rounded-full -mt-2 opacity-30 transform -rotate-1"></div>
                        </div>

                        <p className="text-lg md:text-xl leading-relaxed text-[#651A1A]/80 font-medium max-w-lg mx-auto">
                            Der erste San Sebastian Cheesecake in Zürich — handgemacht mit den besten Zutaten, frisch auf Bestellung.
                        </p>

                    </div>
                </div>
            </div>
        </section >
    )
}
