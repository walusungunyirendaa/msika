import BagView from "../../../components/BagView";
import { getAreas, getShopProducts } from "../../../lib/store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Your bag",
};

export default async function BagPage() {
  const [products, areas] = await Promise.all([getShopProducts(), getAreas()]);
  return <BagView products={products} areas={areas} />;
}
