# Spring Boot Static UI Setup Guide
## Sampath Grocery System

---

## ✅ CURRENT FOLDER STRUCTURE

Your static UI structure is **already configured correctly**:

```
src/main/resources/static/
  ├── pages/          ← All HTML pages
  │   ├── login.html
  │   ├── dashboard.html
  │   ├── customers.html
  │   ├── inventory.html
  │   ├── orders.html
  │   ├── payments.html
  │   ├── suppliers.html
  │   ├── deliveries.html
  │   ├── analytics.html
  │   ├── pos.html
  │   ├── register.html
  │   ├── settings.html
  │   ├── role-management.html
  │   └── connection-test.html
  │
  ├── js/             ← All JavaScript files
  │   ├── api-service.js ✅ (Updated to use relative URLs)
  │   ├── simple-api-service.js
  │   ├── api-integration-examples.js
  │   ├── auth.js
  │   ├── common.js
  │   ├── login.js
  │   ├── register.js
  │   ├── dashboard.js
  │   ├── customers.js
  │   ├── inventory.js
  │   ├── orders.js
  │   ├── payments.js
  │   ├── suppliers.js
  │   ├── deliveries.js
  │   ├── analytics.js
  │   └── settings.js
  │
  ├── css/            ← All CSS files
  │   └── common.css
  │
  └── assets/         ← Libraries and resources
      ├── bootstrap-5.3.7/
      │   ├── css/
      │   │   └── bootstrap.min.css
      │   └── js/
      │       └── bootstrap.bundle.min.js
      └── sweetalert2/
          ├── sweetalert2.min.css
          └── sweetalert2.min.js
```

---

## 📋 FILE MOVE PLAN

**STATUS: ✅ NO MOVES NEEDED**

All files are already in the correct locations:
- ✅ HTML files are in `pages/`
- ✅ JavaScript files are in `js/`
- ✅ CSS files are in `css/`
- ✅ Assets (Bootstrap, SweetAlert2) are in `assets/`

---

## 🔧 PATH FIXES - EXAMPLE: login.html

Your HTML files are **already using correct relative paths**. Here's how login.html references resources:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Sampath Grocery Store</title>
    
    <!-- CSS Resources (relative paths from pages/) -->
    <link rel="stylesheet" href="../css/common.css">
    
    <!-- Local Assets -->
    <link href="../assets/bootstrap-5.3.7/css/bootstrap.min.css" rel="stylesheet">
    <link href="../assets/sweetalert2/sweetalert2.min.css" rel="stylesheet">
</head>
<body>
    <!-- Your HTML content -->
    
    <!-- JavaScript Resources (relative paths from pages/) -->
    <script src="../assets/bootstrap-5.3.7/js/bootstrap.bundle.min.js"></script>
    <script src="../assets/sweetalert2/sweetalert2.min.js"></script>
    <script src="../js/api-service.js"></script>
    <script src="../js/auth.js"></script>
    <script src="../js/login.js"></script>
</body>
</html>
```

**Path Pattern Explanation:**
- Files in `pages/` use `../` to go up one directory to `static/`
- Then navigate to the target folder: `css/`, `js/`, or `assets/`
- Example: `../css/common.css` → goes from `pages/` to `static/` to `css/common.css`

---

## 🔌 API SERVICE - UPDATED TO USE RELATIVE URLS

**File:** `src/main/resources/static/js/api-service.js`

**✅ ALREADY UPDATED** - Now uses relative URLs:

```javascript
// API Configuration
const API_CONFIG = {
    BASE_URL: '/api', // ✅ Relative URL - works with Spring Boot
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3
};

// Example usage in your JavaScript:
async function testHealthEndpoint() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/health`);
        const data = await response.json();
        console.log('Health check:', data);
        // Output: {success: true, message: "OK", timestamp: "...", service: "..."}
    } catch (error) {
        console.error('API call failed:', error);
    }
}

// Example: Login API call
async function login(username, password) {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });
    return await response.json();
}
```

**Why Relative URLs?**
- ✅ Works in all environments (localhost, production)
- ✅ No CORS issues when UI and API are served from same domain
- ✅ Automatically uses the correct protocol (http/https)
- ✅ No hardcoded server addresses

---

## 🏥 HEALTH ENDPOINT - CREATED

**File:** `backend/src/main/java/com/sampathgrocery/controller/HealthController.java`

```java
@RestController
@RequestMapping("/api")
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "OK");
        response.put("timestamp", LocalDateTime.now().toString());
        response.put("service", "Sampath Grocery System API");
        return ResponseEntity.ok(response);
    }
}
```

**Endpoint Details:**
- **URL:** `GET /api/health`
- **Response:** `{success: true, message: "OK", timestamp: "...", service: "..."}`
- **Purpose:** Quick health check for frontend-backend connectivity

---

## ✅ VERIFICATION CHECKLIST

### Step 1: Start the Backend Server

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Expected Output:**
```
Started SampathGrocerySystemApplication in X.XXX seconds
Tomcat started on port(s): 8080 (http)
```

### Step 2: Test Static File Serving

Open your browser and navigate to:

✅ **Login Page:**
```
http://localhost:8080/pages/login.html
```

✅ **Dashboard:**
```
http://localhost:8080/pages/dashboard.html
```

✅ **Customers:**
```
http://localhost:8080/pages/customers.html
```

### Step 3: Verify Resources Load

Open browser DevTools (F12) → Network tab:

✅ Check CSS loads:
- `http://localhost:8080/css/common.css` → Status 200
- `http://localhost:8080/assets/bootstrap-5.3.7/css/bootstrap.min.css` → Status 200

✅ Check JavaScript loads:
- `http://localhost:8080/js/api-service.js` → Status 200
- `http://localhost:8080/js/common.js` → Status 200

### Step 4: Test API Connectivity

**Option A: Browser DevTools Console**
```javascript
fetch('/api/health')
    .then(r => r.json())
    .then(data => console.log(data));

// Expected: {success: true, message: "OK", ...}
```

**Option B: Direct Browser Access**
```
http://localhost:8080/api/health
```

**Expected JSON Response:**
```json
{
  "success": true,
  "message": "OK",
  "timestamp": "2026-02-14T...",
  "service": "Sampath Grocery System API"
}
```

**Option C: Test Other Endpoints**
```
http://localhost:8080/api/test/ping
```

### Step 5: Test Page Functionality

1. ✅ Open `http://localhost:8080/pages/login.html`
2. ✅ Check that page styles are applied (Bootstrap, custom CSS)
3. ✅ Open browser console (F12) - should have no errors
4. ✅ Try interacting with the page (buttons, forms)

---

## 🐛 DEBUGGING GUIDE - If Static Files Don't Load

### Problem 1: 404 Not Found for HTML Pages

**Symptom:** `http://localhost:8080/pages/login.html` returns 404

**Solutions:**
1. ✅ Verify file exists: `src/main/resources/static/pages/login.html`
2. ✅ Rebuild project: `mvn clean install`
3. ✅ Check file was copied to `target/classes/static/pages/login.html`
4. ✅ Restart Spring Boot application

**Check:**
```bash
# Verify file in target
ls target/classes/static/pages/login.html
```

### Problem 2: 404 Not Found for CSS/JS Files

**Symptom:** HTML loads but CSS/JS return 404

**Common Issues:**
```html
<!-- ❌ WRONG - Absolute path won't work from pages/ -->
<link rel="stylesheet" href="/pages/css/common.css">

<!-- ❌ WRONG - Missing ../ to go up from pages/ -->
<link rel="stylesheet" href="css/common.css">

<!-- ✅ CORRECT - Relative path from pages/ directory -->
<link rel="stylesheet" href="../css/common.css">
```

**Solutions:**
1. ✅ Check paths use `../` prefix when referencing from `pages/` directory
2. ✅ Open DevTools → Network tab to see exact failed URL
3. ✅ Verify file structure matches expected paths

### Problem 3: Blank Page / No Styles

**Symptom:** Page loads but appears unstyled

**Check DevTools Console for errors like:**
```
Refused to apply style from '...' because MIME type ('text/html') is not a supported stylesheet MIME type
```

**Solutions:**
1. ✅ Clear browser cache (Ctrl+F5)
2. ✅ Rebuild: `mvn clean install`
3. ✅ Check file extensions are correct (.css not .css.txt)

### Problem 4: API Calls Fail (CORS Errors)

**Symptom:** 
```
Access to fetch at 'http://localhost:8080/api/health' from origin 'null' has been blocked by CORS
```

**Solution:**
- ✅ Always access UI through `http://localhost:8080/pages/...` (NOT by opening files directly)
- ✅ Never open HTML files using `file:///` protocol
- ✅ Use Spring Boot's static serving: `http://localhost:8080/...`

### Problem 5: JavaScript Errors in Console

**Check:**
```javascript
// In browser console, test API configuration:
console.log(API_CONFIG.BASE_URL);
// Should output: "/api" (not "http://localhost:8080/api")
```

**Verify api-service.js is loaded:**
```javascript
// In browser console:
console.log(typeof API_CONFIG);
// Should output: "object" (not "undefined")
```

---

## 🔍 USEFUL DEBUGGING COMMANDS

### Check What's Running
```bash
# Check if Spring Boot is running on port 8080
netstat -ano | findstr :8080

# Or use PowerShell
Get-NetTCPConnection -LocalPort 8080
```

### View Spring Boot Logs
```bash
# Run with verbose logging
mvn spring-boot:run -Dspring-boot.run.arguments="--logging.level.org.springframework.web=DEBUG"
```

### Verify Static Resource Mapping
Add to `application.properties` for debugging:
```properties
# Add these for debugging
logging.level.org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping=TRACE
logging.level.org.springframework.web.servlet.resource.ResourceHttpRequestHandler=TRACE
```

Then check logs for:
```
Mapped URL path [/**] onto handler 'ResourceHttpRequestHandler'
```

### Test Static Resources Direct URLs
```bash
# Test in browser or curl:
http://localhost:8080/css/common.css
http://localhost:8080/js/api-service.js
http://localhost:8080/pages/login.html
http://localhost:8080/api/health
```

---

## 📝 SPRING BOOT STATIC RESOURCE RULES

**How Spring Boot Serves Static Files:**

1. **Default Static Locations:** `src/main/resources/static/` is automatically served
2. **URL Mapping:** Files under `static/` are served from root `/`
   - `static/pages/login.html` → `http://localhost:8080/pages/login.html`
   - `static/css/common.css` → `http://localhost:8080/css/common.css`
   - `static/js/api-service.js` → `http://localhost:8080/js/api-service.js`

3. **No Controller Needed:** Spring Boot automatically serves static files
4. **API Routes Take Priority:** `/api/*` routes are handled by controllers first
5. **No Template Engine:** Plain HTML files served as-is (no Thymeleaf processing)

---

## 🎯 QUICK REFERENCE

### Access URLs
```
UI Pages:    http://localhost:8080/pages/{page}.html
CSS Files:   http://localhost:8080/css/{file}.css
JS Files:    http://localhost:8080/js/{file}.js
Assets:      http://localhost:8080/assets/{folder}/{file}
API:         http://localhost:8080/api/{endpoint}
Health:      http://localhost:8080/api/health
Test:        http://localhost:8080/api/test/ping
```

### Path References from HTML (in pages/ folder)
```html
<!-- CSS -->
<link href="../css/common.css" rel="stylesheet">

<!-- JavaScript -->
<script src="../js/api-service.js"></script>

<!-- Assets -->
<link href="../assets/bootstrap-5.3.7/css/bootstrap.min.css" rel="stylesheet">

<!-- Images (if you add them) -->
<img src="../assets/images/logo.png" alt="Logo">
```

### API Calls from JavaScript
```javascript
// Always use relative URLs
fetch('/api/health')
fetch('/api/auth/login')
fetch('/api/products')

// Or use the API_CONFIG from api-service.js
fetch(`${API_CONFIG.BASE_URL}/health`)
```

---

## ✅ FINAL CHECKLIST

- [x] **Folder structure is correct** (pages/, js/, css/, assets/)
- [x] **HTML files use relative paths** (../ prefix)
- [x] **api-service.js uses relative URLs** (BASE_URL: '/api')
- [x] **Health endpoint created** (GET /api/health)
- [x] **Spring Boot serves static files** (from src/main/resources/static/)
- [x] **No Thymeleaf/templates used** (pure static files)

---

## 🚀 YOU'RE READY!

Your static UI is correctly configured and ready to use. Just run:

```bash
mvn spring-boot:run
```

Then open: **http://localhost:8080/pages/login.html**

**Everything should work perfectly!** ✨
