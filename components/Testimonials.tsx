export default function Testimonials() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-rose-500 font-semibold text-sm uppercase tracking-wider mb-2">
            WORD ON THE STREET
          </p>
          <h2 className="text-4xl font-bold text-gray-900">What Our Customers Say</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-cream-50 p-8 rounded-lg">
            <div className="flex items-center mb-4">
              <span className="text-yellow-500 text-lg">★★★★★</span>
            </div>
            <p className="text-gray-700 mb-4 italic">
              "The best cheesecake I've ever had! The texture is perfect - creamy but not too heavy. Ordered it for my mom's birthday and she was over the moon!"
            </p>
            <p className="text-gray-900 font-semibold">— Sarah M.</p>
            <p className="text-gray-600 text-sm">New York, NY</p>
          </div>

          <div className="bg-cream-50 p-8 rounded-lg">
            <div className="flex items-center mb-4">
              <span className="text-yellow-500 text-lg">★★★★★</span>
            </div>
            <p className="text-gray-700 mb-4 italic">
              "When it comes to epic cheesecakes, <strong>no one makes them better than Emilia Cheesecake</strong>. The attention to detail is incredible!"
            </p>
            <p className="text-gray-900 font-semibold">— Michael T.</p>
            <p className="text-gray-600 text-sm">Los Angeles, CA</p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            <strong className="text-rose-500">12,847+ verified reviews</strong> from happy customers nationwide
          </p>
        </div>
      </div>
    </section>
  )
}
