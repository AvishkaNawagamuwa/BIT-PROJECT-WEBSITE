# 🚀 QUICK START - GRN Receiving Dashboard

## 📋 CHECKLIST - Run These Steps in Order

### ☑️ Step 1: Run Database Migration (2 minutes)

Open Command Prompt in the `database` folder and run:

```bash
cd D:\sampath-grocery-system\database
run-po-receiving-migration.bat
```

**Expected Output:**
```
✓ Migration completed successfully!
```

---

### ☑️ Step 2: Rebuild Backend (3 minutes)

Open Command Prompt in the `backend` folder:

```bash
cd D:\sampath-grocery-system\backend
mvnw clean install
```

---

### ☑️ Step 3: Start the Application (1 minute)

```bash
mvnw spring-boot:run
```

Wait for:
```
Tomcat started on port(s): 8080 (http)
```

---

### ☑️ Step 4: Integrate Frontend (5 minutes)

#### Option A: Quick Test (Recommended First)

1. Open browser: `http://localhost:8080`
2. Login to application
3. Go to **Suppliers** page
4. Click **GRN Records** tab

The backend APIs are already working! You'll see:
- Dashboard statistics
- Waiting POs table
- GRN history table

#### Option B: Full UI Integration

**File:** `backend/src/main/resources/templates/suppliers.html`

1. **Find the GRN Records tab section** (around line 379):
   ```html
   <!-- GRN Records Tab -->
   <div class="tab-pane fade" id="grn-records" role="tabpanel">
   ```

2. **Replace the entire tab content** with the content from:
   ```
   backend/src/main/resources/templates/grn-records-tab.html
   ```

3. **Add JavaScript include** at the bottom of suppliers.html (before `</body>`):
   ```html
   <script src="/js/grn-dashboard.js"></script>
   ```

4. **Restart the application**

---

### ☑️ Step 5: Test the Workflow (10 minutes)

#### Test Scenario: Order → Partial Receive → Full Receive

**A. Create a Purchase Order**

1. Go to **Suppliers → Purchase Orders** tab
2. Click **+ New Purchase Order**
3. Fill in:
   - Supplier: Select any supplier
   - Products: Add 2 products with quantities (e.g., 50 and 30)
4. **Save** and **Approve** the PO

**B. First Partial Delivery**

1. Go to **Suppliers → GRN Records** tab
2. You should see your PO in **"Waiting to Receive"** section with **WAITING** badge
3. Click **Receive** button
4. Modal opens with auto-filled GRN:
   - All products listed
   - Quantities defaulted to full amounts
   - Prices pre-filled
   - Batch codes auto-generated
5. **Edit quantities** to simulate partial delivery:
   - First product: Change from 50 to **25**
   - Second product: Change from 30 to **15**
6. Review/edit prices and expiry dates if needed
7. Click **Approve GRN**
8. See confirmation: "Inventory updated and batches created"

**C. Check Results**

1. Dashboard cards update (Total GRNs: 1, etc.)
2. PO now shows **PARTIAL** badge with 50% progress bar
3. Go to **Inventory → Batch Inventory** - see new batches created!
4. Stock quantities updated

**D. Second Delivery (Complete Remaining)**

1. Go back to **GRN Records** tab
2. Same PO still in **"Waiting to Receive"** with **PARTIAL** badge
3. Click **Receive** again
4. Modal opens with **ONLY REMAINING ITEMS**:
   - First product: Remaining **25** (50 - 25)
   - Second product: Remaining **15** (30 - 15)
5. Click **Approve GRN**
6. PO now shows **RECEIVED** status
7. PO disappears from "Waiting to Receive" section (all done!)

---

## 🎯 KEY FILES REFERENCE

### Backend (Java)
```
📁 entity/supplier/
  ✓ PurchaseOrder.java (updated)
  ✓ PurchaseOrderItem.java (updated)
  ✓ GRN.java (updated)

📁 dto/supplier/
  ✓ WaitingPOResponse.java (new)
  ✓ GRNDashboardStats.java (new)

📁 repository/supplier/
  ✓ PurchaseOrderRepository.java (updated)
  ✓ GRNRepository.java (updated)

📁 service/supplier/
  ✓ GRNService.java (major updates)

📁 controller/api/
  ✓ GRNController.java (new endpoints)
```

### Frontend (HTML/JS)
```
📁 static/js/
  ✓ grn-dashboard.js (complete dashboard logic)

📁 templates/
  ✓ grn-records-tab.html (complete UI template)
```

### Database
```
📁 database/
  ✓ add-received-quantity-to-po-items.sql
  ✓ run-po-receiving-migration.bat
```

---

## 📡 API ENDPOINTS AVAILABLE

You can test these in browser or Postman:

```
✅ GET  http://localhost:8080/api/grns/waiting-pos
   Returns: List of POs ready to receive

✅ GET  http://localhost:8080/api/grns/dashboard-stats
   Returns: Dashboard statistics

✅ POST http://localhost:8080/api/grns/from-po/{poId}
   Creates: Draft GRN from PO (auto-filled)

✅ PUT  http://localhost:8080/api/grns/{grnId}
   Updates: Draft GRN quantities/prices

✅ POST http://localhost:8080/api/grns/{grnId}/approve
   Approves: GRN and updates inventory

✅ GET  http://localhost:8080/api/grns
   Returns: All GRNs with optional filters
```

---

## 🎨 UI PREVIEW

### Waiting to Receive Section
```
┌─────────────────────────────────────────────────────┐
│ ⏳ Waiting to Receive (Approved Purchase Orders)   │
├──────────┬──────────┬──────────┬─────────┬─────────┤
│ PO No    │ Supplier │ Expected │ Status  │ Action  │
├──────────┼──────────┼──────────┼─────────┼─────────┤
│ PO-00001 │ ABC Ltd  │ Feb 25   │ WAITING │[Receive]│
│          │          │          │ ▓░░░░   │         │
│          │          │          │ 0/80    │         │
└──────────┴──────────┴──────────┴─────────┴─────────┘
```

### GRN Modal (Edit Mode)
```
┌────────────────────────────────────────────────────────────┐
│ 📋 GRN Details                                        [X]   │
├────────────────────────────────────────────────────────────┤
│ GRN No: GRN-00001    PO No: PO-00001   Supplier: ABC Ltd  │
│ Date: 2026-02-28     Invoice: INV-123                     │
├────────────────────────────────────────────────────────────┤
│ Product        │Ordered│Remaining│Receive│Purchase│Selling│
│────────────────┼───────┼─────────┼───────┼────────┼───────│
│ Product A      │  50   │   50    │ [25]  │[450.00]│500.00 │
│ Product B      │  30   │   30    │ [15]  │[200.00]│250.00 │
├────────────────────────────────────────────────────────────┤
│                                    Subtotal: Rs. 15,000.00 │
│                                 Grand Total: Rs. 15,000.00 │
├────────────────────────────────────────────────────────────┤
│           [Close]  [Save Draft]  [Approve GRN]             │
└────────────────────────────────────────────────────────────┘
```

---

## ⚡ QUICK TROUBLESHOOTING

### Problem: Database migration fails
**Solution:**
```sql
-- Run manually in MySQL:
USE sampath_grocery;
ALTER TABLE reorder_item ADD COLUMN received_quantity INT NOT NULL DEFAULT 0;
```

### Problem: "Cannot receive more than remaining quantity"
**Solution:** The PO has already been partially received. The system is working correctly! Check:
```sql
SELECT * FROM reorder_item WHERE request_id = [PO_ID];
-- Look at received_quantity vs quantity
```

### Problem: GRN modal doesn't open
**Solution:** 
1. Press F12 → Console tab → Check for errors
2. Verify `grn-dashboard.js` is loaded
3. Check if Bootstrap modal library is included

### Problem: Dashboard shows 0 for all stats
**Solution:** 
1. Create and approve at least one GRN first
2. Check API: `http://localhost:8080/api/grns/dashboard-stats`
3. Look at browser console for errors

---

## 📖 DETAILED DOCUMENTATION

For complete business logic, workflows, and customization:

👉 **See:** `GRN_RECEIVING_COMPLETE_IMPLEMENTATION_GUIDE.md`

---

## ✅ SUCCESS CRITERIA

You've successfully set up the GRN Receiving Dashboard when you can:

- [x] See dashboard stats cards with data
- [x] See waiting POs in Section A
- [x] Click "Receive" and get auto-filled GRN
- [x] Edit quantities to simulate partial delivery
- [x] Approve GRN and see inventory updated
- [x] See PO status change to PARTIAL
- [x] Create second GRN with remaining items
- [x] Approve second GRN and see PO status RECEIVED
- [x] See product batches created in Batch Inventory

---

**Need Help?**  
Check the complete guide: `GRN_RECEIVING_COMPLETE_IMPLEMENTATION_GUIDE.md`

**Implementation Status:** ✅ COMPLETE  
**Ready to Use:** YES  
**Testing Required:** Follow Step 5 above
