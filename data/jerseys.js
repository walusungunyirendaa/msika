export const SIZES = ["S", "M", "L", "XL", "XXL"];

export function totalStock(jersey) {
  return SIZES.reduce((sum, s) => sum + (jersey.stock[s] || 0), 0);
}

export function sizesInStock(jersey) {
  return SIZES.filter((s) => jersey.stock[s] > 0);
}

export function clubsOf(products) {
  return [...new Set(products.map((p) => p.club))];
}

export function jerseyTitle(jersey) {
  return `${jersey.club} ${jersey.kitName}`;
}
