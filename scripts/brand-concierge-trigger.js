import { getMetadata } from './ak.js';

/**
 * UI-agnostic Brand Concierge widget loader. Lazy-imports the shared,
 * multi-tenant widget (bwb1066/brand-concierge, GH Pages) on first call and
 * opens it — reuse this from whatever trigger element the target site's
 * header actually has room for (a sibling of an existing search icon, a
 * floating bubble, an inline block — the caller owns the UI).
 *
 * Config is page-metadata-driven, same convention as `websdk-*`/`commerce-*`:
 *   concierge-url    Supabase project URL (optional — defaults to the shared backend)
 *   concierge-key    Supabase anon key (optional — defaults to the shared backend's)
 *   concierge-site   REQUIRED — this site's site_key. Must have a matching row
 *                    in the shared Supabase's public.brand_configs table, or
 *                    the widget falls back to generic, off-brand responses.
 */

const WIDGET_BASE = 'https://bwb1066.github.io/brand-concierge/widget/';
const WIDGET_URL = `${WIDGET_BASE}brand-concierge.js?v=commerce3`;

// The shared backend's anon key — public by design (Supabase anon keys are
// meant to be client-exposed; access is governed by RLS, not secrecy). Same
// value already embedded in every existing replica's widget wiring.
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5anF1d2hrbXp5ZWRrd3VhZmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjY4MjcsImV4cCI6MjA5MDY0MjgyN30.GkMBLXBZr9u34m4uI6ZR-2ZniLZD3RkjropjQw058k4';

const SUPABASE_URL = getMetadata('concierge-url') || 'https://cyjquwhkmzyedkwuaffc.supabase.co';
const SUPABASE_KEY = getMetadata('concierge-key') || DEFAULT_KEY;
const SITE_KEY = getMetadata('concierge-site');

let chatModule = null;

/** Lazy-loads the widget (once) and opens it. Safe to call on every click. */
export default async function openBrandConcierge() {
  if (!chatModule) {
    chatModule = await import(/* webpackIgnore: true */ WIDGET_URL);
    chatModule.init({
      supabaseUrl: SUPABASE_URL,
      anonKey: SUPABASE_KEY,
      siteKey: SITE_KEY,
      showTrigger: false,
      widgetBase: WIDGET_BASE,
    });
  }
  chatModule.default();
}
