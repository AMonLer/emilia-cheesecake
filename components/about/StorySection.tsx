import Image from "next/image"

export default function StorySection() {
    return (
        <section className="py-24 px-4 bg-white">
            <div className="container mx-auto max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left - Image */}
                    <div className="relative h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl group">
                        <Image
                            src="/uberuns.png"
                            alt="Emilia Cheesecake"
                            fill
                            className="object-cover object-[30%] lg:object-center transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>

                    {/* Right - Text */}
                    <div className="space-y-8">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#651A1A] tracking-tight leading-[0.95]">
                            ES BEGANN MIT <br />EINEM REZEPT
                        </h2>
                        <div className="space-y-6 text-lg leading-relaxed text-gray-700 font-light">
                            <p>
                                In den engen Gassen von <span className="font-medium text-[#651A1A]">San Sebastián</span>, wo die Luft nach frisch gebackenem Brot und karamellisiertem Zucker riecht, entdeckten wir den perfekten baskischen Käsekuchen. Cremig, leicht verbrannt an der Oberfläche, mit einer Textur, die auf der Zunge schmilzt.
                            </p>
                            <p>
                                Wir wussten sofort: Diesen Geschmack müssen wir nach Zürich bringen. Aber nicht einfach kopieren – wir wollten ihn ehren, respektieren, und mit unserer eigenen Handschrift verfeinern.
                            </p>
                            <div className="pl-6 border-l-4 border-[#651A1A]/20 italic text-gray-600">
                                "Nach unzähligen Versuchen, Rezeptanpassungen und schlaflosen Nächten in unserer kleinen Küche entstand EMILIA."
                            </div>
                            <p>
                                Eine Hommage an Tradition und Handwerk, gebacken mit Schweizer Präzision und spanischer Seele.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
