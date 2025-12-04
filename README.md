# Emilia Cheesecake

A beautiful, modern e-commerce website for artisan cheesecakes, inspired by premium bakery stores like Milk Bar.

## Features

- 🎨 Modern, clean design with Tailwind CSS
- 📱 Fully responsive layout
- 🎠 Hero carousel with multiple promotional slides
- 🍰 Product grid with badges (Best Seller, Limited Time, New, etc.)
- ⭐ Customer reviews and testimonials
- 🚚 Features section highlighting delivery and quality
- 💳 Call-to-action sections
- 🔍 Search, cart, and account functionality (UI ready)

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **React** - UI library

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
emilia-cheesecake/
├── app/
│   ├── layout.tsx       # Root layout with Navbar and Footer
│   ├── page.tsx         # Home page
│   └── globals.css      # Global styles
├── components/
│   ├── Navbar.tsx       # Navigation bar with cart
│   ├── Hero.tsx         # Hero carousel
│   ├── ProductGrid.tsx  # Product showcase with badges
│   ├── Features.tsx     # Features/benefits section
│   ├── Testimonials.tsx # Customer reviews
│   ├── CTASection.tsx   # Call-to-action
│   └── Footer.tsx       # Footer with links
└── public/              # Static assets
```

## Design Inspiration

This project takes design inspiration from Milk Bar Store, featuring:
- Clean, modern aesthetics
- Prominent product photography
- Eye-catching badges and labels
- Customer review integration
- Strategic call-to-actions
- Premium feel with accessible design

## Customization

### Colors
The color scheme uses a rose/cream palette defined in `tailwind.config.js`:
- Rose: Primary brand color
- Cream: Warm background tones
- Gray: Text and subtle elements

### Products
Product data is currently hardcoded in `components/ProductGrid.tsx`. You can easily replace this with API calls or a CMS.

### Images
Currently using Unsplash placeholder images. Replace with actual product photography for production.

## Next Steps

To make this production-ready, consider adding:
- [ ] Backend API integration
- [ ] Shopping cart functionality
- [ ] Payment processing (Stripe)
- [ ] User authentication
- [ ] Admin dashboard
- [ ] Product detail pages
- [ ] Checkout flow
- [ ] Order management
- [ ] Email notifications

## License

This is a demonstration project for Emilia Cheesecake.
