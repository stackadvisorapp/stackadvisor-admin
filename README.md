# 🚀 StackAdvisor Admin Panel

Admin dashboard for managing StackAdvisor delivery app users, orders, subscriptions, and settings.

## Features

- 📊 **Dashboard** - Overview of users, orders, and revenue
- 👥 **Users** - View and manage all riders, search, filter, ban users
- 📦 **Orders** - View active and completed orders
- 💰 **Subscriptions** - Track trials, active subscribers, revenue
- 🌍 **Regions** - View supported regions, countries, and platforms
- 📢 **Announcements** - Send messages to app users
- ⚙️ **App Settings** - Remote configuration without app updates

## Tech Stack

- **Frontend:** Next.js 14 + React
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **Hosting:** Vercel (free)
- **Icons:** Lucide React

---

## 🛠️ Setup Instructions

### Step 1: Create New Tables in Supabase

1. Go to your Supabase project: https://supabase.com/dashboard
2. Click on **SQL Editor** in the left sidebar
3. Copy all the SQL from `supabase_tables.sql` file
4. Paste and click **Run**
5. You should see 3 new tables: `announcements`, `app_settings`, `banned_users`

### Step 2: Deploy to Vercel (FREE)

#### Option A: Quick Deploy (Easiest)

1. Create a GitHub account if you don't have one: https://github.com
2. Create a new repository called `stackadvisor-admin`
3. Upload all these files to GitHub
4. Go to https://vercel.com and sign in with GitHub
5. Click "Import Project" and select your repository
6. Add environment variables (see Step 3)
7. Click Deploy!

#### Option B: Using Command Line

```bash
# Install Vercel CLI
npm install -g vercel

# Navigate to project folder
cd stackadvisor-admin

# Deploy
vercel

# Follow the prompts
```

### Step 3: Set Environment Variables in Vercel

When deploying to Vercel, add these environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://nyjuxlhcdpjaaikzszaa.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Your admin email |
| `NEXT_PUBLIC_ADMIN_PASSWORD` | Your admin password |

### Step 4: Access Your Admin Panel

After deployment, Vercel will give you a URL like:
`https://stackadvisor-admin.vercel.app`

Login with the admin credentials you set.

---

## 📁 Project Structure

```
stackadvisor-admin/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Dashboard
│   │   ├── layout.tsx            # Main layout
│   │   ├── globals.css           # Global styles
│   │   ├── users/page.tsx        # Users management
│   │   ├── orders/page.tsx       # Orders management
│   │   ├── subscriptions/page.tsx # Subscriptions
│   │   ├── regions/page.tsx      # Regions overview
│   │   ├── announcements/page.tsx # Announcements
│   │   └── settings/page.tsx     # App settings
│   ├── components/
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── AuthWrapper.tsx       # Login protection
│   └── lib/
│       └── supabase.ts           # Database client & types
├── supabase_tables.sql           # SQL for new tables
├── .env.local                    # Environment variables (don't commit!)
├── package.json
├── tailwind.config.js
└── README.md
```

---

## 🔐 Security Notes

1. **Change admin credentials** before deploying to production
2. **Never commit `.env.local`** to Git (it's in .gitignore)
3. The admin panel uses simple password auth - suitable for single admin
4. For multiple admins, consider adding Supabase Auth

---

## 🔄 Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

---

## 📱 Connecting to Your Android App

To read announcements and settings in your Android app:

### Read Announcements

```kotlin
suspend fun getActiveAnnouncements(): List<Announcement> {
    val response = supabase.from("announcements")
        .select()
        .filter {
            eq("is_active", true)
            lte("starts_at", Clock.System.now().toString())
        }
        .decodeList<Announcement>()
    return response
}
```

### Read App Settings

```kotlin
suspend fun getAppSetting(key: String): String? {
    val response = supabase.from("app_settings")
        .select()
        .filter { eq("key", key) }
        .decodeSingleOrNull<AppSetting>()
    return response?.value
}
```

### Check if User is Banned

```kotlin
suspend fun isUserBanned(userId: String): Boolean {
    val response = supabase.from("banned_users")
        .select()
        .filter { eq("user_id", userId) }
        .decodeList<BannedUser>()
    return response.isNotEmpty()
}
```

---

## 📞 Support

- Developer: Fahim Mirza
- Email: fahimmirza786a@gmail.com
- Company: Nixflex Enterprises LLC

---

Made with ❤️ for StackAdvisor
