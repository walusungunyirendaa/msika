"use client";

import ErrorScreen from "../../components/ErrorScreen";

export default function AdminError({ reset }) {
  return <ErrorScreen reset={reset} homeHref="/admin" homeText="Back to stock" />;
}
