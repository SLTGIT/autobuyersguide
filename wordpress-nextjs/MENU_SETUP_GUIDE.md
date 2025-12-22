# WordPress Menu Setup - Quick Guide

## ✅ What's Been Done

1. ✅ Menu locations registered in WordPress (`primary_menu`, `footer_menu`)
2. ✅ Custom REST API endpoint added for menus
3. ✅ CORS headers enabled
4. ✅ Header component updated to use `primary_menu`
5. ✅ Footer component updated to use `footer_menu`

## 🚀 Next Steps - Create Menus in WordPress

### Step 1: Create Primary Menu (Header)

1. Go to WordPress Admin: `http://localhost/backend/wp-admin`
2. Navigate to **Appearance → Menus**
3. Click **"Create a new menu"**
4. Name it: **"Primary Menu"** or **"Main Menu"**
5. Click **"Create Menu"**

### Step 2: Add Menu Items

Add pages/links to your menu:
- Click **"View All"** under Pages
- Check the pages you want (Home, About, Blog, Contact, etc.)
- Click **"Add to Menu"**
- Drag to reorder items
- Click **"Save Menu"**

### Step 3: Assign to Location

At the bottom of the menu editor:
- Check the box for **"Primary Menu"** location
- Click **"Save Menu"**

### Step 4: Create Footer Menu (Optional)

Repeat steps 1-3 but:
- Name it: **"Footer Menu"**
- Assign to **"Footer Menu"** location

## 🧪 Test Your Menu

### Test API Endpoint

Visit in your browser:
```
http://localhost/backend/wp-json/menus/v1/locations/primary_menu
```

You should see JSON with your menu items!

### Test in Next.js

1. Refresh your Next.js app: `http://localhost:3000`
2. The header should now show your WordPress menu!
3. Hard refresh if needed: `Ctrl+Shift+R`

## 📊 Verify Everything Works

Visit the diagnostic page:
```
http://localhost:3000/diagnostics
```

The "Menu Test" should now show ✅ SUCCESS!

## 🎯 Menu Structure

Your menu items will have:
- **title** - Display text
- **url** - Link URL
- **target** - `_blank` for new window, empty for same window
- **parent** - For submenus (0 = top level)
- **order** - Display order

## 💡 Tips

### Custom Links
To add custom links (not pages):
1. In menu editor, click **"Custom Links"**
2. Enter URL and Link Text
3. Click **"Add to Menu"**

### External Links
To open in new tab:
1. Click the arrow on the menu item to expand
2. Check **"Open link in a new tab"**
3. Save menu

### Submenus (Dropdowns)
To create dropdown menus:
1. Drag menu items slightly to the right
2. They become sub-items of the item above
3. Note: You'll need to update Next.js components for dropdown styling

## ❓ Troubleshooting

### Menu Not Showing in Next.js

1. **Check API endpoint works:**
   ```
   http://localhost/backend/wp-json/menus/v1/locations/primary_menu
   ```

2. **Verify menu is assigned to location:**
   - Go to Appearance → Menus
   - Check "Primary Menu" location is selected
   - Save menu

3. **Hard refresh browser:**
   - Press `Ctrl+Shift+R`

4. **Check browser console:**
   - Press F12
   - Look for errors

### "No menu found" Error

- Menu exists but not assigned to location
- Go to Appearance → Menus
- Check the location box and save

### Menu Shows But Items Are Wrong

- Clear browser cache
- Hard refresh (`Ctrl+Shift+R`)
- Check menu items in WordPress admin

## 🎉 You're Done!

Once you create the menu in WordPress and assign it to the location, it will automatically appear in your Next.js header!

No code changes needed - just manage menus from WordPress Admin! 🚀
