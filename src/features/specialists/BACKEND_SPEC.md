# Specialists & Categories – Backend API Spec

Admin-only. All routes require admin auth.

## Categories

- **GET** `/api/v1/specialists/categories`  
  Response: `{ status, data: Category[] }`  
  Category: `{ _id, title: { en, ka }, created_at?, updated_at? }`

- **POST** `/api/v1/specialists/categories`  
  Body: `{ title: { en: string, ka: string } }`

- **PATCH** `/api/v1/specialists/categories/:id`  
  Body: `{ title: { en, ka } }`

- **DELETE** `/api/v1/specialists/categories/:id`

## Specialists

- **GET** `/api/v1/specialists`  
  Response: `{ status, data: Specialist[] }`  
  Specialist: `{ _id, avatar?, name, bio, categories, link, booking, order?, tags?, specialty?, isActive?, created_at?, updated_at? }`  
  (Populate `categories` with category objects or return IDs.)

- **POST** `/api/v1/specialists`  
  Body: `{ avatar?, name, bio, categories: string[], link, booking, order?: number, tags?: string[], specialty?: string, isActive?: boolean }`  
  Default: `isActive: true`.

- **PATCH** `/api/v1/specialists/:id`  
  Body: same as POST

- **PATCH** `/api/v1/specialists/:id/avatar`  
  **Multipart/form-data**, field `avatar` = image file (same as user avatar upload).  
  Saves the file (e.g. multer + disk/cloud), sets the specialist’s `avatar` to the resulting URL, returns the updated specialist or success.

- **DELETE** `/api/v1/specialists/:id`

## Data

- **name**: string (full name).
- **order**: number – display/promotion order (lower = higher; e.g. 0 = featured).
- **tags**: string[] (e.g. ["coach", "wellness"]).
- **specialty**: string (e.g. "Life Coach").
- **isActive**: boolean, default true.
- **avatar**: string URL (optional). Set via **upload**: `PATCH .../specialists/:id/avatar` with multipart `avatar` file (same flow as user avatar on backend).
- **link**: string URL (e.g. portfolio).
- **booking**: string URL (e.g. WhatsApp booking link).
- **categories**: array of category IDs; store as refs and populate on GET.
