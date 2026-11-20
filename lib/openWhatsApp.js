export function openWhatsApp(event, link, onSameTab) {
  event.preventDefault();
  const tab = window.open(link, "_blank");
  if (tab) {
    tab.opener = null;
    return "tab";
  }
  if (onSameTab) onSameTab();
  setTimeout(() => window.location.assign(link), onSameTab ? 1100 : 0);
  return "same";
}
