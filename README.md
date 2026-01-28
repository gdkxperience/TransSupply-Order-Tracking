# TransSupply Order Tracking

A modern logistics and order tracking application for managing shipments, clients, and locations.

## Quick Start

### Demo Login
- **Admin**: `admin@transsupply.com` / `admin123`
- **Client**: `client@example.com` / `client123`

### Running Locally
```bash
npm install
npm run dev
```

---

## User Manual

### Dashboard
The main dashboard provides an overview of your logistics operations:
- **Stats Cards**: Quick view of total orders, in-transit shipments, delivered orders, and revenue
- **Recent Orders**: List of the latest orders with status indicators
- Click any order to view its details

### Orders
Manage all shipments from the Orders page:

**Viewing Orders**
- Orders are displayed in a list with status, reference number, route, and pricing
- Use status filter buttons (All, Pending, In Transit, Delivered) to filter the list
- Click on an order number to view full details
- Use the copy button next to order numbers to copy the reference

**Creating Orders** (Admin only)
1. Click the **+** button (or "New Order" on desktop)
2. Fill in pickup address and destination
3. Select or create a client
4. Add packages with dimensions and weight
5. Set pricing and notes
6. Click "Create Order"

**Exporting Orders**
- Click the download icon to export orders
- Options: CSV Summary, CSV with Packages, or PDF Report

### Order Details
View complete order information:
- **Status Timeline**: Visual progress from pickup to delivery
- **Route Map**: Shows pickup and destination locations
- **Packages**: List of all packages with dimensions and weight
- **Photos**: Upload and view shipment photos

**Actions**
- Add packages to existing orders
- Upload photos
- Export order as PDF
- Edit order details (Admin only)

### Clients (Admin Only)
Manage your client database:
- View all clients with order counts
- Click a client to see their orders
- Edit client name and password
- Create new clients

### Locations (Admin Only)
Manage warehouse and pickup locations:
- **Main Warehouse**: Your primary location shown on the map
- **Pickup Locations**: Additional locations for pickups
- Add new locations with address lookup
- View distances from main warehouse
- Edit or delete locations

### Settings
Manage your account:
- Update profile name
- Change password
- View account information

### Search (⌘K / Ctrl+K)
Use the universal search to quickly find:
- Orders by reference number, client, or location
- Clients by name or email
- Navigate to any page

---

## Mobile App

The app is fully responsive with mobile-specific features:
- **Bottom Navigation**: Quick access to main sections
- **Bottom Sheets**: Tap on items for action menus
- **Swipe Gestures**: Swipe down to dismiss bottom sheets
- **Compact Views**: Optimized layouts for smaller screens

---

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS v4
- Framer Motion
- Supabase (Database)
- Google Maps API (Location services)

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```
