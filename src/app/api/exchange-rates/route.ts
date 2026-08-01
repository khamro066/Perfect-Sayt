import { NextResponse } from "next/server";

// Free, no-API-key tier — coverage confirmed for all 6 currencies we need
// (UZS/USD/RUB/KGS/TJS/KZT). `next.revalidate` uses Next.js's own fetch data
// cache, so this only actually hits the external API once per 24h across
// all requests/serverless invocations — not on every page load.
const EXCHANGE_RATE_API_URL = "https://open.er-api.com/v6/latest/UZS";

export async function GET() {
  const res = await fetch(EXCHANGE_RATE_API_URL, { next: { revalidate: 86400 } });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch exchange rates" }, { status: 502 });
  }
  const data = await res.json();
  return NextResponse.json({ base: "UZS", rates: data.rates, fetchedAt: data.time_last_update_utc });
}
