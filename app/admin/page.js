import { getSession, passwordProblem } from "../../lib/auth";
import { getAreas, getProducts } from "../../lib/store";
import LoginForm from "../../components/admin/LoginForm";
import StockManager from "../../components/admin/StockManager";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }) {
  const session = await getSession();
  if (!session) {
    const { reason, status } = await searchParams;
    return <LoginForm problem={passwordProblem()} reason={status === "out" ? "out" : reason} />;
  }
  const { status } = await searchParams;
  const [products, areas] = await Promise.all([getProducts(), getAreas()]);
  return (
    <StockManager
      initialProducts={products}
      initialAreas={areas}
      expiresAt={session.expiresAt}
      welcome={status === "in"}
    />
  );
}
