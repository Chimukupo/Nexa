"use client";

import { redirect } from "next/navigation";

export default function DashboardEntryPage() {
  // Ensure any access to the root of this group goes to the canonical dashboard route
  redirect("/dashboard");
}

