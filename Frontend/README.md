# 🚀 ShopSwift — React E-Commerce App

A fully functional, production-quality e-commerce frontend built with **React 18**, **Vite**, and **Tailwind CSS**. Inspired by Amazon & Flipkart, ShopSwift covers every stage of the shopping journey — from browsing to checkout — with a polished, mobile-first UI.

---

## 📸 Feature Highlights

| Feature | Details |
|---|---|
| Product listing | Image, name, category, price (₹ INR), rating, stock badge |
| Cart system | Add, remove, increase/decrease qty, total, localStorage persistence |
| User accounts | Register, login, logout, Google OAuth (demo + real) |
| Checkout | Address collection modal → order placed confirmation |
| Order tracking | Flipkart-style 5-step progress tracker |
| Order history | Per-user order list with expandable detail cards |
| Order cancellation | Cancel before shipping with confirmation step |
| Search | Real-time filter by title & category |
| Pagination | 8 products/page with windowed page controls |
| Loading states | Animated skeleton cards |
| Error states | Error screen with Retry button |
| Responsive | Mobile-first; bottom sheet on mobile, centered modal on desktop |

---

## ✅ Assignment Requirements Checklist

| # | Requirement | Status |
|---|---|---|
| 1 | Display products (image, name, price, stock status) | ✅ |
| 2 | Add product to cart | ✅ |
| 3 | Increase / decrease quantity | ✅ |
| 4 | Remove product from cart | ✅ |
| 5 | Show total cart value | ✅ |
| 6 | Persist cart across refresh (localStorage) | ✅ |
| 7 | Loading and error states | ✅ |
| 8 | Product search | ✅ |
| 9 | Pagination | ✅ |
| 10 | Checkout simulation | ✅ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 with JSX |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 3 |
| Auth | Custom auth + `@react-oauth/google` |
| Data source | [FakeStoreAPI](https://fakestoreapi.com) |
| State | React Context API |
| Persistence | `localStorage` (cart, users, sessions, orders) |
| Currency | `Intl.NumberFormat` — Indian Rupees (₹) |

---

## 📁 Project Structure

```
sw_ecomm/
├── public/
├── src/
│   ├── components/
│   │   ├── AccountPage.jsx       # Profile + order history tabs
│   │   ├── AddressModal.jsx      # Delivery address collection (checkout step 2)
│   │   ├── AuthModal.jsx         # Login / Register modal
│   │   ├── Cart.jsx              # Slide-in cart drawer
│   │   ├── CartItem.jsx          # Single cart row with qty controls
│   │   ├── GoogleAuthButton.jsx  # Smart Google sign-in (demo or real OAuth)
│   │   ├── Navbar.jsx            # Sticky header with cart badge & user menu
│   │   ├── OrderCard.jsx         # Expandable order card with status tracker
│   │   ├── OrderSuccess.jsx      # Post-order confirmation overlay
│   │   ├── Pagination.jsx        # Windowed page controls
│   │   ├── ProductCard.jsx       # Product card (image, rating, CTA)
│   │   ├── ProductList.jsx       # Grid + search + pagination + states
│   │   ├── SearchBar.jsx         # Controlled search input with clear button
│   │   ├── SkeletonCard.jsx      # Animated loading placeholder
│   │   └── UserMenu.jsx          # Avatar dropdown (initials or Google photo)
│   ├── config/
│   │   └── google.js             # Google Client ID + isGoogleConfigured()
│   ├── context/
│   │   ├── AuthContext.jsx       # Auth state (register/login/logout/Google)
│   │   ├── CartContext.jsx       # Cart CRUD + totals
│   │   └── OrderContext.jsx      # Per-user orders, status computation, cancel
│   ├── hooks/
│   │   ├── useFetchProducts.js   # Fetch + enrich products from FakeStoreAPI
│   │   └── useLocalStorage.js    # Generic localStorage persistence hook
│   ├── utils/
│   │   └── currency.js           # formatINR() — USD→INR at ₹84
│   ├── App.jsx                   # Root shell + provider tree
│   ├── index.css                 # Tailwind imports + custom keyframes
│   └── main.jsx                  # React entry point
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **npm** v9 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/sw-ecomm.git
cd sw-ecomm

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build       # Outputs to /dist
npm run preview     # Preview the production build locally
```

---

## 🔑 Google OAuth Setup (Optional)

The app works fully in **demo mode** without any configuration — a fake Google account picker (with demo Indian accounts) is shown instead.

To enable **real Google sign-in**:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project → Enable **Google Identity API**
3. Create OAuth 2.0 credentials (Web application)
4. Add `http://localhost:5173` to **Authorized JavaScript origins**
5. Create a `.env` file in the project root:

```env
VITE_GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
```

6. Restart the dev server — real Google OAuth will activate automatically.

---

## 🛒 Core Features — Deep Dive

### Product Listing
- Fetches 20 real products from [FakeStoreAPI](https://fakestoreapi.com/products)
- Each product enriched with a simulated **stock level** (5–50 units)
- Cards show: product image, category badge, title, star rating with count, price in ₹ INR, and a dynamic stock badge

### Cart System
- Add to cart with one click — button becomes "Added ✓" when already in cart
- Quantity `+` / `−` controls in the cart drawer; max quantity capped at stock level
- Per-item subtotal displayed alongside unit price × quantity
- Running total always visible in the cart footer
- Cart persisted to `localStorage` under key `sw_cart` — survives page refresh

### Search & Pagination
- Real-time search filters by **product title** and **category** as you type
- Paginated at **8 products per page** — jumps back to page 1 when search query changes
- Windowed pagination controls (First / Prev / pages / Next / Last)

### Loading & Error States
- **Skeleton cards**: 8 animated grey placeholder cards shown while products are loading
- **Error screen**: Friendly message + Retry button if the API call fails

### User Accounts
- Register with name, email, and password
- Login / logout with session stored in `localStorage`
- Profile page with order count and total spend summary

### Google OAuth
- **Demo mode** (no Client ID needed): realistic fake account picker popup with 3 demo accounts including *Swati Singh*
- **Production mode**: real `@react-oauth/google` JWT flow with avatar photo pulled from Google profile

### Checkout Simulation
Full 4-step flow:
1. **Cart review** — confirm items and total
2. **Auth gate** — prompts login if not signed in; reopens cart after login
3. **Address modal** — collect name, mobile (10-digit validated), address lines, city, PIN (6-digit), state (dropdown of all Indian states/UTs); address type chips (🏠 Home / 🏢 Work / 📍 Other)
4. **Order success** — animated confirmation with order ID, total, delivery address, and estimated delivery date

### Order Tracking (Flipkart-style)
Orders progress through 5 stages based on order age:

```
Order Placed → Confirmed → Shipped → Out for Delivery → Delivered
```

- Visual horizontal step tracker with SVG icons per step
- Completed steps filled blue, current step pulsing orange, future steps grey
- Delivery address shown inside expanded order card

### Order Cancellation
- "Cancel Order" button appears only on orders in **Order Placed** or **Confirmed** stage
- Two-step confirmation: "Yes, Cancel" / "No, Keep It" with refund notice
- Cancelled state shows a red banner with cancellation date; total struck through

---

## 💾 localStorage Keys

| Key | Contents |
|---|---|
| `sw_cart` | Array of cart items |
| `sw_users` | Array of registered user accounts |
| `sw_session` | Currently logged-in user ID |
| `sw_orders` | Record mapping user ID → array of orders |

---

## 💱 Currency

All prices are displayed in **Indian Rupees (₹)** using a fixed conversion rate of **1 USD = ₹84**, formatted with `Intl.NumberFormat('en-IN')`.

---

## 🎨 Design Decisions

- **No external UI library** — all components hand-built with Tailwind CSS utility classes
- **Floating label inputs** in the address form for a modern, clean look
- **Bottom sheet on mobile** — address modal slides up from the bottom on small screens; center modal on desktop
- **Drag pill handle** on the mobile sheet for native-like feel
- **Spinner on CTA** — "Place Order" button shows a loading spinner during the 300ms submission delay
- **Error count banner** — shows how many fields need fixing after a failed form submit
- **Integer order IDs** — unique 16-digit integer (`timestamp × 1000 + random`)

---

## 📦 Dependencies

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "@react-oauth/google": "^0.x",
  "vite": "^6.x",
  "@vitejs/plugin-react": "^4.x",
  "tailwindcss": "^3.x",
  "autoprefixer": "^10.x",
  "postcss": "^8.x"
}
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 👩‍💻 Author

Built with ❤️ using React + Tailwind CSS.  
Data provided by [FakeStoreAPI](https://fakestoreapi.com) — a free REST API for e-commerce prototypes.
