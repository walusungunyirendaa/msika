import { shop } from "../data/shop";
import { jerseyTitle } from "../data/jerseys";
import { formatPrice } from "./format";

export function buildOrderMessage({ items, name, fulfilment, location, pin, fee, payment }) {
  const subtotal = items.reduce((sum, i) => sum + i.jersey.price * i.qty, 0);
  const total = subtotal + (fulfilment === "delivery" && fee ? fee : 0);
  const lines = ["Hi, I would like to order:"];
  items.forEach((i) => {
    lines.push(`• ${jerseyTitle(i.jersey)}, size ${i.size} x${i.qty}: ${formatPrice(i.jersey.price * i.qty)}`);
  });
  if (fulfilment === "delivery" && fee) lines.push(`Delivery: ${formatPrice(fee)}`);
  lines.push(`Total: ${formatPrice(total)}`);
  if (name) lines.push(`Name: ${name}`);
  if (fulfilment === "pickup") lines.push("I will pick it up.");
  if (fulfilment === "delivery") lines.push(`Please deliver to: ${location}`);
  if (fulfilment === "delivery" && pin) lines.push(`My location: https://maps.google.com/?q=${pin.lat},${pin.lng}`);
  if (payment) lines.push(`Paying with: ${payment}`);
  if (items.length === 1 && !name) lines.push("Is it available?");
  return lines.join("\n");
}

export function whatsappLink(message) {
  return `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(message)}`;
}
