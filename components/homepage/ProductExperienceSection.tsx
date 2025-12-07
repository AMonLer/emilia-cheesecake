import Image from "next/image"
import { Star, ChefHat } from "lucide-react"

export default function ProductExperienceSection() {
    return (
        <section className="py-16 md:py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Image Side (Left on Desktop) */}
                    <div className="relative order-1">
                        <div className="relative h-[400px] lg:h-[600px] w-full">
                            <Image
                                src="/foto2.jpeg"
                                alt="Liebe zum Detail"
                                fill
                                className="object-cover rounded-3xl shadow-2xl"
                            />
                        </div>
                        {/* Decorative elements matching QualitySection style */}
                        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#F5E6D3] rounded-full -z-10 hidden lg:block opacity-60"></div>
                        <div className="absolute -top-6 -left-6 w-24 h-24 border-4 border-[#651A1A]/10 rounded-full -z-10 hidden lg:block"></div>
                    </div>

                    {/* Text Side (Right on Desktop) */}
                    <div className="space-y-8 order-2 text-center">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-[#651A1A]">
                                LIEBE ZUM
                                <br />
                                DETAIL
                            </h2>
                            <div className="w-24 h-1 bg-[#dec181] mx-auto rounded-full"></div>
                        </div>

                        <p className="text-lg md:text-xl leading-relaxed text-[#651A1A]/80 font-medium max-w-lg mx-auto">
                            Wir wählen nur das Beste aus und achten auf jedes Detail, um Ihnen ein unvergessliches Erlebnis zu bieten.
                        </p>

                        <div className="grid grid-cols-2 gap-6 pt-4 max-w-md mx-auto">
                            <div className="flex flex-col items-center space-y-2">
                                <Star className="w-8 h-8 text-[#651A1A]" strokeWidth={1.5} />
                                <span className="text-sm font-bold tracking-wider text-[#651A1A] uppercase">Exzellente Qualität</span>
                            </div>
                            <div className="flex flex-col items-center space-y-2">
                                <ChefHat className="w-8 h-8 text-[#651A1A]" strokeWidth={1.5} />
                                <span className="text-sm font-bold tracking-wider text-[#651A1A] uppercase">Handwerkliche Perfektion</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
