# Msika

Msika is a simple online shop for football jerseys in Zambia. Shoppers browse kits, pick a size and send their order straight to the seller on WhatsApp. There are no accounts or card payments. The seller confirms each order in the chat.

It also has a private stock page for the seller. It works on a phone and a laptop.

## What it does

**For shoppers**

- Browse every kit with photos, prices and the sizes in stock
- Add shirts to a bag that is saved on their device
- Order only the items they tick in the bag
- Choose pick up or delivery
- Search for their delivery area. Each area can have its own delivery fee.
- Share their exact location as a map pin if they want to
- Send the whole order as a ready-made WhatsApp message
- See a friendly page when their internet is slow or offline
- Install the shop on their phone like an app

**For the seller**

- Log in with a password at /admin
- Add, edit and delete shirts with a photo upload
- Change stock per size. Mark a shirt sold out in one tap.
- Hide a shirt without deleting it
- Edit the list of delivery areas and their fees
- Install the stock page on a phone as its own app

**Security**

- Signed login cookie that ends after 30 minutes idle or 8 hours in total
- Login locks for 15 minutes after 5 wrong tries
- Security headers on every page
- The database key stays on the server and never reaches the browser

## Built with

- Next.js 16 (App Router) with React 19
- Plain JavaScript with CSS Modules
- Supabase for the database and photo storage
- Vercel for hosting

## Run it on your computer

You need Node.js 20 or newer.

```
git clone https://github.com/walusungunyirendaa/msika.git
cd msika
npm install
```

Create a file named `.env.local` in the project folder:

```
ADMIN_PASSWORD=choose-a-strong-password
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

- `ADMIN_PASSWORD` is the seller's login. It needs at least 12 characters. Do not reuse your Supabase password.
- `ADMIN_SESSION_SECRET` is optional. Add it if you want login cookies signed with a separate secret.
- Leave out the two Supabase lines to test without a database. Stock is then saved in `data/store.json` and photos in `public/uploads`.

Start the shop:

```
npm run dev
```

Open http://localhost:3000 for the shop and http://localhost:3000/admin for the stock page.

## Set up Supabase

Open the SQL Editor in Supabase and run this query. Name it **Create Msika store table**.

```sql
create table if not exists public.store (
  id integer primary key,
  products jsonb not null
);

alter table public.store enable row level security;
```

Row 1 holds the shirts. Row 2 holds the delivery areas. Both are created the first time the seller saves.

Then go to **Storage** and create a public bucket named `jerseys` for shirt photos.

## Put it online

1. Push the project to GitHub.
2. Import the repo on vercel.com.
3. Add `ADMIN_PASSWORD`, `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` under Environment Variables.
4. Deploy.

Every push to the main branch updates the live site.

## Change the shop details

The shop name, WhatsApp number and payment options live in `data/shop.js`. The starting delivery areas live in `data/areas.json`.

## Project layout

```
app/(shop)    shop pages: home, jersey, bag
app/admin     seller login, stock page, server actions
components    shared UI pieces
lib           storage, login, WhatsApp message helpers
data          shop details, starting shirts, delivery areas
public        photos, icons, app manifests
```
