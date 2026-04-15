# Playwright MCP Test Plan

## Application Under Test

- **Web**: http://localhost:7801 (Angular)
- **API**: http://localhost:7800 (NestJS)
- **Start**: `npm run dev` from repo root

## Test Accounts

| Role  | Email            | Password   |
|-------|------------------|------------|
| Admin | admin@test.com   | password   |
| User  | user@test.com    | password   |

---

## 1. Authentication

### 1.1 Login — happy path (regular user)
1. Navigate to `http://localhost:7801/login`
2. Verify the "Sign in" heading and "Seeded accounts" hint are visible
3. Fill email: `user@test.com`, password: `password`
4. Click "Sign in"
5. **Expect**: redirected to `/products`, sidebar shows `user@test.com` and a "Logout" button
6. **Expect**: sidebar does NOT show "Inventory" or "Low Stock" admin links

### 1.2 Login — happy path (admin user)
1. Navigate to `http://localhost:7801/login`
2. Fill email: `admin@test.com`, password: `password`
3. Click "Sign in"
4. **Expect**: redirected to `/products`, sidebar shows `admin@test.com`
5. **Expect**: sidebar shows admin links: "Inventory" and "Low Stock"

### 1.3 Login — invalid credentials
1. Navigate to `http://localhost:7801/login`
2. Fill email: `wrong@test.com`, password: `wrong`
3. Click "Sign in"
4. **Expect**: error message "Invalid email or password" appears
5. **Expect**: user remains on `/login`

### 1.4 Login — form validation
1. Navigate to `http://localhost:7801/login`
2. Leave email and password empty, attempt to submit
3. **Expect**: "Sign in" button is disabled (form is invalid)
4. Type an invalid email like `notanemail`, tab to password
5. **Expect**: email field shows invalid state (red border via `aria-invalid`)

### 1.5 Logout
1. Log in as `user@test.com`
2. Click "Logout" in the sidebar
3. **Expect**: redirected to `/login`
4. Navigate to `http://localhost:7801/products`
5. **Expect**: redirected back to `/login` (auth guard)

### 1.6 Auth guard — protected route redirect
1. Without logging in, navigate directly to `http://localhost:7801/products`
2. **Expect**: redirected to `/login?returnUrl=%2Fproducts`
3. Log in as `user@test.com`
4. **Expect**: redirected to `/products` (the original return URL)

---

## 2. Product Catalog

### 2.1 Product grid — initial load
1. Log in as `user@test.com`
2. **Expect**: product grid is displayed with product cards
3. **Expect**: each card shows thumbnail, title, category, rating, price, and stock status
4. **Expect**: a total product count is visible

### 2.2 Category filter
1. On `/products`, open the category filter dropdown
2. Select a category (e.g., the first non-default option)
3. **Expect**: grid updates to show only products in that category
4. **Expect**: product count reflects the filtered total
5. Select "All" / default again
6. **Expect**: full product list returns

### 2.3 Search
1. On `/products`, type a product name or keyword into the search input
2. Wait ~300ms for debounce
3. **Expect**: grid filters to products matching the search term
4. Clear the search
5. **Expect**: full product list returns

### 2.4 Load more / pagination
1. On `/products`, scroll to the bottom of the product list
2. If there are more products than the initial page (20), a "Load More" button should be visible
3. Click "Load More"
4. **Expect**: additional products appear below the existing ones

### 2.5 Product detail page
1. Click on a product card in the grid
2. **Expect**: navigated to `/products/:id` with full product details
3. **Expect**: product image, title, brand, category, price, description, stock status are all visible
4. **Expect**: reviews section shown (if product has reviews) with reviewer names, ratings, comments
5. **Expect**: a "Back" button or link to return to the grid
6. Click back
7. **Expect**: returned to `/products`

### 2.6 Product detail — discount display
1. Navigate to a product that has a discount percentage > 0
2. **Expect**: original price shown with strikethrough
3. **Expect**: discounted price shown prominently
4. **Expect**: discount badge (e.g., "-10%") visible

---

## 3. Shopping Cart

### 3.1 Add to cart from product grid
1. Log in as `user@test.com`
2. On `/products`, click "Add to cart" on an in-stock product
3. **Expect**: cart drawer slides open from the right
4. **Expect**: the item appears in the cart with correct title, price, and quantity 1
5. **Expect**: navbar cart badge shows "1"

### 3.2 Add to cart from product detail
1. Navigate to a product detail page (`/products/:id`)
2. Set quantity to 2 using the quantity selector
3. Click "Add to cart"
4. **Expect**: cart drawer opens showing the item with quantity 2
5. **Expect**: cart badge updates accordingly

### 3.3 Update quantity in cart
1. With an item in the cart, open the cart drawer
2. Click the "+" button to increment quantity
3. **Expect**: quantity increases by 1, subtotal updates
4. Click the "-" button to decrement
5. **Expect**: quantity decreases by 1, subtotal updates
6. **Expect**: "-" button is disabled when quantity is 1

### 3.4 Remove item from cart
1. With an item in the cart, open the cart drawer
2. Click the "x" remove button on the item
3. **Expect**: item is removed from the cart
4. **Expect**: cart badge count decreases

### 3.5 Clear cart
1. Add multiple items to the cart
2. Open the cart drawer
3. Click "Clear Cart"
4. **Expect**: all items removed, cart shows empty state
5. **Expect**: cart badge shows 0 or disappears

### 3.6 Cart total calculation
1. Add 2 different products to the cart
2. Open the cart drawer
3. **Expect**: each line shows quantity x price = line subtotal
4. **Expect**: total at bottom equals sum of all line subtotals

### 3.7 Cart reservation timer
1. Add an item to the cart
2. Open the cart drawer
3. **Expect**: an "Expires in mm:ss" countdown timer is visible
4. **Expect**: timer counts down in real time

### 3.8 Add to cart — out of stock
1. Find a product that is "Out of Stock" (stock = 0)
2. **Expect**: "Add to cart" button is disabled on the product card
3. Navigate to its detail page
4. **Expect**: "Add to cart" button is disabled

### 3.9 Add to cart — exceeds available stock
1. Navigate to a product detail page with limited stock (e.g., 3 available)
2. Set quantity higher than available stock
3. Click "Add to cart"
4. **Expect**: error message appears indicating insufficient stock
5. **Expect**: message auto-dismisses after ~3 seconds

### 3.10 Cart persists across page navigation
1. Add items to the cart
2. Navigate to a different product detail page
3. Open the cart drawer
4. **Expect**: previously added items are still present with correct quantities

---

## 4. Cart Expiration

### 4.1 Cart expiry modal
1. Add an item to the cart
2. Wait for the 2-minute reservation to expire (or use browser devtools to fast-forward time if possible)
3. **Expect**: a modal appears warning that the reservation has ended
4. **Expect**: modal explains items are released back to inventory
5. Click "OK" to dismiss the modal
6. **Expect**: cart is now empty

> **Note**: This test requires waiting 2 minutes. Consider whether the demo environment can be configured with a shorter TTL for testing, or test by observing the countdown timer behavior and verifying the timer display is correct.

---

## 5. Inventory Management (Admin)

### 5.1 Admin guard — non-admin blocked
1. Log in as `user@test.com` (non-admin)
2. Navigate directly to `http://localhost:7801/admin/inventory`
3. **Expect**: redirected to `/products` (admin guard blocks access)

### 5.2 Inventory list — initial load
1. Log in as `admin@test.com`
2. Click "Inventory" in the sidebar
3. **Expect**: navigated to `/admin/inventory`
4. **Expect**: table with columns: Title, Category, Stock, Reserved, Available, Threshold, Status
5. **Expect**: products listed with correct stock data
6. **Expect**: status badges colored appropriately (green=In Stock, orange=Low Stock, red=Out of Stock)

### 5.3 Inventory — category filter and search
1. On `/admin/inventory`, select a category from the dropdown
2. **Expect**: table filters to that category
3. Clear category, type a product name in the search box
4. **Expect**: table filters to matching products

### 5.4 Inventory — column sorting
1. On `/admin/inventory`, click the "Stock" column header
2. **Expect**: products sort by stock ascending, sort indicator (arrow) visible
3. Click again
4. **Expect**: products sort by stock descending
5. Click a different column header (e.g., "Title")
6. **Expect**: sorting switches to that column

### 5.5 Edit product inventory
1. On `/admin/inventory`, click the "Edit" link for a product
2. **Expect**: navigated to `/admin/inventory/:id`
3. **Expect**: product thumbnail, title, and category shown in header
4. **Expect**: form fields for Stock and Low-stock Threshold pre-filled with current values
5. Change the stock value to a new number
6. **Expect**: real-time availability status preview updates as you type
7. Click "Save"
8. **Expect**: navigated back to inventory list
9. **Expect**: the product's stock is updated in the table

### 5.6 Edit inventory — cancel
1. On an edit page, change a value
2. Click "Cancel"
3. **Expect**: navigated back to inventory list without saving changes

### 5.7 Bulk inventory adjustment — set stock
1. On `/admin/inventory`, select 2-3 products using checkboxes
2. **Expect**: bulk action bar appears showing selected count
3. Select "Set stock to" from the operation dropdown
4. Enter a value (e.g., 50)
5. Click "Apply"
6. **Expect**: success message: "Updated stock for X product(s)"
7. **Expect**: selected products now show stock = 50

### 5.8 Bulk inventory adjustment — add to stock
1. Select 2-3 products
2. Choose "Add to stock", enter 10
3. Click "Apply"
4. **Expect**: each selected product's stock increased by 10

### 5.9 Bulk inventory adjustment — subtract from stock
1. Select a product with stock > 5
2. Choose "Subtract from stock", enter 5
3. Click "Apply"
4. **Expect**: product's stock decreased by 5

### 5.10 Bulk adjustment — select all
1. Click the "Select All" checkbox in the table header
2. **Expect**: all visible products are selected
3. Click it again
4. **Expect**: all products deselected

### 5.11 Low stock dashboard
1. Log in as `admin@test.com`
2. Click "Low Stock" in the sidebar
3. **Expect**: navigated to `/admin/inventory/low-stock`
4. **Expect**: only products at or below their low-stock threshold are shown
5. If all products are well-stocked, **expect** a celebratory "All stocked up!" message

### 5.12 Low stock — row highlighting
1. On either inventory page, check products with low or zero stock
2. **Expect**: "Low Stock" rows have yellow/orange background highlight
3. **Expect**: "Out of Stock" rows have red background highlight

---

## 6. Cross-Feature Integration

### 6.1 Cart affects available stock in product grid
1. Log in as `user@test.com`
2. Note the "available stock" count for a product on the grid
3. Add that product to the cart (quantity 1)
4. **Expect**: the available stock count on the product grid decreases by 1

### 6.2 Admin inventory reflects cart reservations
1. In one session: log in as `user@test.com`, add 3 of a product to cart
2. In another context: log in as `admin@test.com`, go to `/admin/inventory`
3. Find that product in the table
4. **Expect**: "Reserved" column shows 3, "Available" = Stock - 3

### 6.3 Inventory edit updates product detail
1. Log in as `admin@test.com`
2. Go to inventory, edit a product, set stock to 0, save
3. Navigate to `/products`, find that product
4. **Expect**: product card shows "Out of Stock" badge
5. **Expect**: "Add to cart" button is disabled for that product

---

## 7. Navigation & Layout

### 7.1 Sidebar navigation links
1. Log in as `admin@test.com`
2. **Expect**: sidebar shows "Products", "Inventory", and "Low Stock" links
3. Click each link in turn
4. **Expect**: each navigates to the correct page
5. **Expect**: active link is visually highlighted

### 7.2 Cart drawer toggle
1. Log in and add an item to cart
2. Click the "Cart" button in the sidebar
3. **Expect**: cart drawer opens
4. Click backdrop or close mechanism
5. **Expect**: drawer closes

### 7.3 Responsive layout
1. Resize the browser to a narrow width (< 768px)
2. **Expect**: layout adapts (sidebar collapses or stacks, grid adjusts card sizes)

---

## Execution Notes

- **Prerequisites**: Run `npm run dev` from the repo root before executing tests. API runs on port 7800, web on 7801.
- **Database resets**: The SQLite database is seeded on first run. To get a clean state, delete `apps/api/db/workshop.sqlite` and restart the API.
- **Cart TTL**: Reservations expire in 2 minutes. Test 4.1 requires either waiting or creative workarounds.
- **Parallelism**: Tests that modify inventory or cart state should not run in parallel to avoid interference. Auth and read-only product catalog tests can run independently.
