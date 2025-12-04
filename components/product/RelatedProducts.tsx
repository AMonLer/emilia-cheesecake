"use client"

import Image from "next/image"
import Link from "next/link"
import { Plus } from "lucide-react"

interface RelatedProductsProps {
    products: any[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
    return (
        <div className="mt-24 border-t border-[#651A1A]/10 pt-16">
            <h3 className="font-black text-2xl md:text-3xl mb-8 md:mb-10 tracking-tight text-[#651A1A] text-center">
                PASST PERFEKT DAZU
            </h3>
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-4 lg:grid lg:grid-cols-4 lg:gap-6 no-scrollbar">
                {products.map((item: any) => (
                    <div key={item.id} className="min-w-[200px] md:min-w-0 snap-center group bg-white rounded-3xl p-4 hover:shadow-xl transition-all duration-500 border border-[#651A1A]/5">
                        <div className="aspect-square relative mb-4 bg-[#F5E6D3] rounded-2xl overflow-hidden">
                            <Image
                                src={item.image}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                        </div>
                        <div className="text-center">
                            <h4 className="font-black text-[#651A1A] tracking-tight mb-1">{item.name}</h4>
                            <p className="text-sm text-[#651A1A]/60 font-medium mb-4">{item.price} CHF</p>
                            <button className="w-full border-2 border-[#651A1A] text-[#651A1A] py-3 rounded-xl font-black text-xs tracking-widest uppercase hover:bg-[#651A1A] hover:text-white transition-colors flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" />
                                <span>DAZU</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
