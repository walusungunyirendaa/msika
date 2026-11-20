export default function manifest() {
  return {
    id: "/",
    name: "Msika",
    short_name: "Msika",
    description: "Football jerseys. Check your size and order on WhatsApp.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      { src: "/icons/shop-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/shop-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/shop-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
