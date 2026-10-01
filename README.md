# FreshCart – Online Grocery Store

A web application for an online grocery store built with plain **HTML, CSS and JavaScript** (no frameworks, no installation, no server needed).

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure – open this file to run the app |
| `style.css`  | All styling (responsive, light/dark theme) |
| `script.js`  | All logic: login, cart, orders, admin and delivery panels |
| `README.md`  | This guide |

## How to run

1. Keep all three files (`index.html`, `style.css`, `script.js`) in the same folder.
2. Double-click `index.html` to open it in any modern browser (Chrome, Edge, Firefox, Safari).

## Demo logins

Choose the role tab on the login screen first.

| Role | Username | Password |
|------|----------|----------|
| Customer | `customer` | `cust123` |
| Admin | `admin` | `admin123` |
| Delivery person | `delivery` | `deliver123` |

New customers can create an account with **Sign up**.
Coupon codes to try: `FRESH10` (10% off above ₹200), `WELCOME20` (20% off above ₹500).

## Features

### Customer
- Sign up and login
- Browse, search and filter products by category
- Personalised recommendations based on past orders
- Shopping cart with quantity control
- Coupon / discount codes
- Choose a delivery time slot and enter an address
- Free delivery above ₹500, ₹40 fee otherwise
- Order history with step-by-step tracking (Placed → Packed → Out for delivery → Delivered)
- Cancel an order while it is still "Placed" (stock is restored)

### Admin
- Dashboard: total sales, number of orders, total discounts given, pending orders, low-stock items, sales by category
- Orders: view all orders, update status, assign a delivery person, cancel
- Inventory: add, edit price/stock, delete products
- Discounts: create, enable/disable, delete coupons and see how often each was used
- Customers: view customers with order count and total spent, remove users
- Delivery staff: add and remove delivery persons

### Delivery person
- Sees only the orders assigned to them
- Marks orders as picked up (Out for delivery) and Delivered
- Completed and active delivery counters

## Notifications, live tracking and AI assistants

- **Notification bar + bell (all roles):** customers are alerted when an order is placed, packed, out for delivery, delivered or assigned a delivery partner; admins when a new order arrives, stock runs low, an order is cancelled or delivered; delivery persons when an order is assigned or ready for pickup.
- **Delivery tracking (customer):** My Orders shows a moving 🛵 progress line with the time of every stage, the delivery person's name, phone and vehicle number, plus the delivery slot.
- **Three separate AI assistants (button at bottom-right):**
  - *Shopping Assistant* (customer): order tracking, coupons, recommendations, product prices/stock, cart summary, delivery fee and slot info.
  - *Store Analyst* (admin): sales summary, low stock, pending/unassigned orders, top sellers, coupon usage, delivery staff workload.
  - *Delivery Helper* (delivery): next delivery with address and phone, active/completed counts, how to update status.
  The assistants are rule-based and answer from the store's own data, so they work offline. To connect a real LLM, call an AI API from a backend and replace the `ai()` function in `script.js`.
- **Profiles:** every role has a Profile tab (name, phone, password; customers also save a delivery address that pre-fills checkout; delivery persons add a vehicle number).
- **Inventory:** admin adds products with brand, unit, description and optional photo, and can edit any product.
- **Backup (admin → Profile):** export / import all data as a JSON file.

## How data is stored

All data (users, products, orders, coupons) is saved in the browser's **localStorage**, so it persists between visits on the same browser and device. There is no real backend, so data is not shared between different browsers or devices. To reset the app to its starting data, clear the site data / localStorage for the page.

## Notes

- Passwords are stored as plain text because this is a demo project. A production system would need a server, a database and hashed passwords.
- Changes made in one browser tab appear in other tabs of the same browser automatically; a real multi-device system needs a backend server.

## Possible future improvements

- Node.js / Express backend with a database (MongoDB or MySQL)
- Password hashing and secure sessions
- Online payment integration
- Live tracking with a map
- Invoice printing and sales reports export
