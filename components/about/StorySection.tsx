'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function StorySection() {
    const { t } = useLanguage()
    const [titleLine1, titleLine2] = t.story.title.split('\n')

    return (
        <section className="py-24 px-4 bg-white">
            <div className="container mx-auto max-w-4xl">
                <div>
                    <div className="space-y-8 text-center">
                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#651A1A] tracking-tight leading-[0.95]">
                            {titleLine1} <br />{titleLine2}
                        </h2>
                        <div className="space-y-6 text-lg leading-relaxed text-gray-700 font-light">
                            <p dangerouslySetInnerHTML={{ __html: t.story.p1 }} />
                            <p dangerouslySetInnerHTML={{ __html: t.story.p2 }} />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
