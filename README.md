# ElekTra Ecommerce Frontend

This is the frontend of a fully functional e-commerce web application built with Vite and React using TypeScript. It provides a responsive and interactive user interface for both customers and admin users.

## Tech Stack

- **Framework**: [Vite](https://vitejs.dev/) with [React](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **CSS**: [TailwindCSS](https://tailwindcss.com/) and [Shadcn](https://ui.shadcn.com/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **API Calls**: [RTK Query](https://redux-toolkit.js.org/rtk-query/overview)
- **Authentication & Authorization**: [Firebase](https://firebase.google.com/)

## Features

### Admin Side

- **Dashboard**:
  - Manage products, users, and orders.
  - View various analytics (bar, line, and pie charts).
  - Track revenue, orders, and inventory statistics.
  - Edit and delete users, products, and orders.
  - Change user roles (admin/user).
  - Create, activate, and remove coupons.
  - Advanced search functionality.
  - Rich text editor for product descriptions, including image uploads.

### Customer Side

- **Product Management**:
  - Browse and filter products by category, price, and name.
  - View individual product details and images.
- **Order Management**:
  - Place orders and make payments with Stripe.
  - View order status and details.
- **Reviews and Ratings**:
  - Review and rate products.
- **Coupons**:
  - Apply coupons on the cart page.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ecommerce-frontend.git
   cd ecommerce-frontend
   
2. Install dependencies:
   ```bash
   npm install
   
3. Create a .env file in the root directory and add your environment variables:
    ```bash
    VITE_API_KEY=your_firebase_api_key
    VITE_AUTH_DOMAIN=your_firebase_auth_domain
    VITE_PROJECT_ID=your_firebase_project_id
    VITE_STORAGE_BUCKET=your_firebase_storage_bucket
    VITE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
    VITE_APP_ID=your_firebase_app_id
    VITE_SERVER_LINK=your_backend_server_link
    VITE_STRIPE_KEY=your_stripe_public_key
    
4. Start the development server:
    ```bash
    npm run dev

### Deployment

5. Build the app for production:
    ```bash
    npm run build

### License
This project is licensed under the MIT License.
