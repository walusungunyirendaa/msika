export const metadata = {
  title: "Stock",
  robots: { index: false, follow: false },
  manifest: "/seller.webmanifest",
  icons: { apple: "/icons/seller-apple-180.png" },
  appleWebApp: {
    capable: true,
    title: "Msika Seller",
    statusBarStyle: "default",
  },
};

export default function AdminLayout({ children }) {
  return children;
}
