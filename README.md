# ElekTra e-commerce Backend

This is the backend of a fully functional e-commerce web application built with Node.js and Express.js using TypeScript. It provides a RESTful API for the frontend and handles business logic, database interactions, and other server-side functionalities.

## Tech Stack

- **Server**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **File Uploads**: [Multer](https://github.com/expressjs/multer) and [Cloudinary](https://cloudinary.com/)
- **Caching**: [Node-cache](https://www.npmjs.com/package/node-cache)
- **Security**: UUID, Validator, Sanitize-HTML

## Controllers

- **Order Controllers**: Manage and process orders.
- **Payment Controllers**: Handle payment processing with Stripe.
- **Product Controllers**: Manage product creation, updates, and deletions.
- **Stats Controllers**: Provide data analytics and statistics for the admin dashboard.
- **User Controllers**: Manage user data, roles, and authentication.

## Features

- **Admin Functionality**:
  - Add, edit, and delete products, users, and orders.
  - Manage inventory and view analytics with various charts.
  - View and modify user roles (admin/user).
  - Track and manage revenue, orders, and inventory statistics.
  - Create, activate, and remove discount coupons.

- **Customer Functionality**:
  - Purchase products, place orders, and make payments with Stripe.
  - Review and rate products.
  - Apply discount coupons and view order details.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- MongoDB instance (local or cloud).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ecommerce-backend.git
   cd ecommerce-backend
   
2. Install dependencies:
   ```bash
   npm install
   
3. Create a .env file in the root directory and add your environment variables:
    ```bash
    PORT=your_port_number
    DATABASE_URI=your_mongodb_uri
    STRIPE_KEY=your_stripe_secret_key
    CLOUDINARY_URL=your_cloudinary_url
    
4. Run the Watch Command
    ```bash
    npm run watch
    
5. Start the development server:
    ```bash
    npm run dev

## Deployment

6. Build the app for production:
    ```bash
    npm run build

### License
This project is licensed under the MIT License.
# ElekTra e-commerce Backend

This is the backend of a fully functional e-commerce web application built with Node.js and Express.js using TypeScript. It provides a RESTful API for the frontend and handles business logic, database interactions, and other server-side functionalities.

## Tech Stack

- **Server**: [Node.js](https://nodejs.org/) with [Express.js](https://expressjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **File Uploads**: [Multer](https://github.com/expressjs/multer) and [Cloudinary](https://cloudinary.com/)
- **Caching**: [Node-cache](https://www.npmjs.com/package/node-cache)
- **Security**: UUID, Validator, Sanitize-HTML

## Controllers

- **Order Controllers**: Manage and process orders.
- **Payment Controllers**: Handle payment processing with Stripe.
- **Product Controllers**: Manage product creation, updates, and deletions.
- **Stats Controllers**: Provide data analytics and statistics for the admin dashboard.
- **User Controllers**: Manage user data, roles, and authentication.

## Features

- **Admin Functionality**:
  - Add, edit, and delete products, users, and orders.
  - Manage inventory and view analytics with various charts.
  - View and modify user roles (admin/user).
  - Track and manage revenue, orders, and inventory statistics.
  - Create, activate, and remove discount coupons.

- **Customer Functionality**:
  - Purchase products, place orders, and make payments with Stripe.
  - Review and rate products.
  - Apply discount coupons and view order details.

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine.
- MongoDB instance (local or cloud).

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/ecommerce-backend.git
   cd ecommerce-backend
   
2. Install dependencies:
   ```bash
   npm install
   
3. Create a .env file in the root directory and add your environment variables:
    ```bash
    PORT=your_port_number
    DATABASE_URI=your_mongodb_uri
    STRIPE_KEY=your_stripe_secret_key
    CLOUDINARY_URL=your_cloudinary_url
    
4. Run the Watch Command
    ```bash
    npm run watch
    
5. Start the development server:
    ```bash
    npm run dev

## Deployment

6. Build the app for production:
    ```bash
    npm run build

### License
This project is licensed under the MIT License.
