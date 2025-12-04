export default function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-br from-rose-500 to-rose-600">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Ready to Experience Bliss?
        </h2>
        <p className="text-xl text-rose-50 mb-8">
          Order now and get FREE shipping on orders over $75. Your taste buds will thank you!
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button className="bg-white text-rose-500 px-8 py-4 rounded-full hover:bg-cream-50 transition font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
            Shop All Cheesecakes
          </button>
          <button className="bg-rose-700 text-white px-8 py-4 rounded-full hover:bg-rose-800 transition font-semibold text-lg border-2 border-white">
            View Gift Bundles
          </button>
        </div>
        <p className="text-rose-100 text-sm mt-6">
          Use code <span className="font-bold">EMILIA75</span> at checkout
        </p>
      </div>
    </section>
  )
}
