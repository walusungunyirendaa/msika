export function formatPrice(amount) {
  return `K${String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}

export function listWithOr(words) {
  if (words.length < 2) return words.join("");
  return `${words.slice(0, -1).join(", ")} or ${words[words.length - 1]}`;
}

export function stockLabel(qty) {
  if (qty === 0) return "Sold out";
  if (qty === 1) return "Last one";
  return `${qty} left`;
}
