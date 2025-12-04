const products = [
  {
    id: 1,
    name: 'Classic New York Cheesecake',
    description: 'Rich, creamy, and utterly divine. The timeless classic that started it all.',
    price: '$52',
    image: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?w=500&h=500&fit=crop',
    badge: 'BEST SELLER',
    badgeColor: 'bg-rose-500',
  },
  {
    id: 2,
    name: 'Strawberry Swirl Cheesecake',
    description: 'Fresh strawberry puree swirled into our signature creamy cheesecake.',
    price: '$58',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=500&fit=crop',
    badge: 'CLASSIC',
    badgeColor: 'bg-amber-500',
  },
  {
    id: 3,
    name: 'Triple Chocolate Decadence',
    description: 'White, milk, and dark chocolate in perfect harmony. Pure indulgence.',
    price: '$62',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&h=500&fit=crop',
    badge: null,
    badgeColor: '',
  },
  {
    id: 4,
    name: 'Salted Caramel Dream',
    description: 'Velvety caramel with a hint of sea salt on graham cracker crust.',
    price: '$60',
    image: 'https://images.unsplash.com/photo-1524351199678-941a58a3df50?w=500&h=500&fit=crop',
    badge: null,
    badgeColor: '',
  },
  {
    id: 5,
    name: 'Pumpkin Spice Cheesecake',
    description: 'The seasonal favorite with warm spices and a gingersnap crust.',
    price: '$58',
    image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=500&h=500&fit=crop',
    badge: 'BACK IN STOCK!',
    badgeColor: 'bg-orange-500',
  },
  {
    id: 6,
    name: 'Lemon Blueberry Bliss',
    description: 'Tangy lemon cheesecake topped with fresh blueberry compote.',
    price: '$56',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500&h=500&fit=crop',
    badge: 'LIMITED TIME',
    badgeColor: 'bg-purple-500',
  },
  {
    id: 7,
    name: 'Oreo Cookies & Cream',
    description: 'Loaded with Oreo cookies throughout. A chocolate lover\'s dream.',
    price: '$60',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&h=500&fit=crop',
    badge: null,
    badgeColor: '',
  },
  {
    id: 8,
    name: 'Raspberry White Chocolate',
    description: 'Sweet white chocolate with tart raspberry swirls throughout.',
    price: '$62',
    image: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=500&h=500&fit=crop',
    badge: 'NEW!',
    badgeColor: 'bg-pink-500',
  },
]

export default function ProductGrid() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-rose-500 font-semibold text-sm uppercase tracking-wider mb-2">
            FROM OUR BAKERY TO YOUR DOORSTEP
          </p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Handcrafted Artisan Cheesecakes
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Treat yourself and loved ones to our award-winning cheesecakes. For a limited time, enjoy free shipping on orders $75+!
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer bg-white rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                {product.badge && (
                  <div className={`absolute top-3 right-3 ${product.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                    {product.badge}
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-rose-500 transition">
                  {product.name}
                </h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">{product.price}</span>
                  <button className="text-rose-500 font-medium text-sm hover:text-rose-600 transition">
                    Add to Cart →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button className="bg-rose-500 text-white px-8 py-3 rounded-full hover:bg-rose-600 transition font-semibold shadow-lg hover:shadow-xl">
            View All Cheesecakes
          </button>
        </div>
      </div>
    </section>
  )
}
