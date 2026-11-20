import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SellerBar from "../../components/SellerBar";
import ScrollEffects from "../../components/ScrollEffects";
import Toaster from "../../components/Toast";
import OfflineBanner from "../../components/OfflineBanner";
import { isAdmin } from "../../lib/auth";

export default async function ShopLayout({ children }) {
  const seller = await isAdmin();
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <OfflineBanner />
      {seller && <SellerBar />}
      <Header />
      <main id="main">{children}</main>
      <Footer />
      <ScrollEffects />
      <Toaster />
    </>
  );
}
