# visiomatix-website-backend

This repository contains Contact section backend code

## Extended Blog/Admin Features

This server now powers the admin login/dashboard and blog CMS described in the frontend.

- `POST /admin/login` – accepts `{email,password}`, returns JWT token.
- `GET /api/blogs` – public list of blogs.
- `GET /api/blogs/:id` – single blog.
- `POST /api/blogs` – **protected**, use Bearer token, `multipart/form-data` with fields `title`, `description`, `date`, `comments`, and optionally `image`.

Images are uploaded automatically to Cloudinary (configured via environment variables below) and the returned secure URL is saved in the database. The old local `uploads/` folder is no longer used.

Support has also been added for career postings – the admin API mirrors blogs (`/api/careers` with GET/POST/PUT/DELETE, same authentication requirements).

The code uses a simple MVC layout under `models/`, `controllers/`, and `routes`.

Environment variables (see `.env.example`):

```
MONGODB_URI=
ADMIN_EMAIL=
ADMIN_PASSWORD=
JWT_SECRET=
RESEND_API_KEY=
CONTACT_EMAIL=
PORT=5000
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```
