# Kayven public address

A Cloudflare Worker in Kayven's own account serves the existing public museum
through a workers.dev address. This is a public reverse proxy, not a database
migration. The existing Site remains the source of truth, including live edits.
No content is seeded or copied, and no paid resources are enabled by this code.

Public GET/HEAD routes are allowlisted. Authentication headers and cookies are
never forwarded. Private and editing routes return to the original Site for
its existing trusted login and owner authorization. Writes are never proxied.
The new URL therefore applies to visitor browsing; the editing URL retains the
original host. If the original Site is offline, this public entrance is too.

Deploy explicitly with Wrangler using this directory's wrangler.jsonc; never
use the parent Site's generated deployment configuration for this Worker.
