Product Requirements Document (PRD)
Problem: Warehouse logistics company consolidates client orders from European pickups into full truckloads for delivery to Schwanendael warehouse. Current Excel-based tracking causes visibility issues, errors, and manual consolidation delays.

Target Users:

Admin: Full access to all orders/clients (master login).

Clients: View-only for their orders (individual logins, isolated data).

User Stories:

As an admin, I can create clients and assign them logins so they access only their data.

As an admin, I can create orders with auto-generated internal reference (2026Q1-053) and add multiple client references/boxes.

As a client, I can log in and see my orders list filtered by status, location, and dates.

As a user, I can view order details including pickup/collection info, receiver, weight/dims, price, photos, and map.

As a user, I can export my orders list to PDF.

Must-Have Features:

Multi-tenant auth (Supabase RLS).

Order CRUD with 1:many boxes.

Status workflow: pickup → warehouse → delivered.

Location autocomplete (frequent EU pickups).

Map integration (pickup → fixed warehouse).

Photo upload (1-2 per order).

PDF export.

Success Metrics:

Demo-ready by Feb 12-13: Admin creates order, client logs in, views/tracks/export.

Post-demo: Client imports sample spreadsheet, no data loss.

Constraints: Web-only (desktop/mobile responsive). EU data residency. English UI. MVP scope excludes payments/billing.