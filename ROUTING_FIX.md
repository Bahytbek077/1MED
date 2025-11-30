# SPA Routing Fix for 404 Errors on Page Refresh

## Problem

When refreshing pages like `/admin/dashboard` in the browser, the app was showing a 404 error instead of loading the page correctly.

## Root Cause

This is a common issue with Single Page Applications (SPAs) that use client-side routing. The problem occurred because:

1. **Server-side routing wasn't configured properly**: The server needs to serve `index.html` for all non-API routes so that the client-side router (wouter) can handle the routing.

2. **Vercel deployment configuration was too broad**: The `vercel.json` rewrite rule was catching ALL routes including API routes, which could interfere with backend endpoints.

## What Was Fixed

### 1. Server Middleware (server/vite.ts)

Updated both development and production middleware to skip API routes:

**Development mode (`setupVite` function):**

```typescript
app.use("*", async (req, res, next) => {
  const url = req.originalUrl;

  // Skip API routes - let them be handled by your API routes
  if (url.startsWith("/api")) {
    return next();
  }

  // ... serve index.html for all other routes
});
```

**Production mode (`serveStatic` function):**

```typescript
app.use("*", (req: Request, res: Response, next: NextFunction) => {
  // Skip API routes - let them be handled by your API routes
  if (req.originalUrl.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.resolve(distPath, "index.html"));
});
```

### 2. Vercel Configuration (vercel.json)

Updated the rewrite rule to exclude API routes:

**Before:**

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**After:**

```json
{
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/index.html"
    }
  ]
}
```

The regex `/((?!api).*)` matches any path that doesn't start with "api", ensuring API routes are not rewritten to index.html.

## How It Works Now

1. **For client routes** (e.g., `/admin/dashboard`, `/patient/chat`):

   - Server serves `index.html`
   - React app loads
   - Wouter client-side router handles navigation to the correct component

2. **For API routes** (e.g., `/api/users`, `/api/auth`):
   - Routes pass through to Express handlers
   - Backend API logic handles the request

## Testing

To test the fix:

1. **Development mode:**

   ```bash
   npm run dev
   ```

   - Navigate to http://localhost:5000/admin/dashboard
   - Refresh the page - should work without 404

2. **Production mode:**

   ```bash
   npm run build
   npm start
   ```

   - Navigate to http://localhost:5000/admin/dashboard
   - Refresh the page - should work without 404

3. **Vercel deployment:**
   - Push changes to deploy
   - Test all routes with page refresh

## Routes That Should Work

All these routes should now work correctly when refreshed:

- `/` (Auth page)
- `/patient/dashboard`
- `/patient/chat`
- `/doctor/dashboard`
- `/doctor/messages`
- `/admin/dashboard`
- `/admin/plans`
- `/admin/services`
- `/admin/users`

## Future Considerations

If you add more API routes, make sure they're prefixed with `/api` so they're properly excluded from the SPA fallback routing.
