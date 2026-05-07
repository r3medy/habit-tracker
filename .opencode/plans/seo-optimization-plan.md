# SEO Optimization Plan — Next.js SaaS Project

## Project State

- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Fonts**: Geist + Geist_Mono (Google Fonts)
- **Current pages**: `app/layout.tsx`, `app/page.tsx` (scaffold only)
- **Domain**: Not yet purchased (use placeholders)
- **Product**: SaaS (details TBD)

---

## Phase 1: Critical SEO Foundations

### 1.1 Metadata API — `app/layout.tsx`

Add `Metadata` export with all core fields:

```ts
import type { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Your SaaS Product",
    template: "%s | Your SaaS Product",
  },
  description: "A brief description of your SaaS product and its value proposition.",
  keywords: ["saas", "productivity", "automation"],
  authors: [{ name: "Your Company" }],
  creator: "Your Company",
  publisher: "Your Company",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Your SaaS Product",
    description: "A brief description of your SaaS product and its value proposition.",
    siteName: "Your SaaS Product",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Your SaaS Product",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Your SaaS Product",
    description: "A brief description of your SaaS product and its value proposition.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}
```

**Why**: Without metadata, Google generates titles/descriptions from page content (often poorly). `metadataBase` ensures all relative URLs resolve correctly. `verification` enables Google Search Console ownership.

### 1.2 Robots.txt — `app/robots.ts`

Create new file:

```ts
import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/admin/"],
      },
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
      },
      {
        userAgent: "Google-Extended",
        allow: "/",
      },
      {
        userAgent: "CCBot",
        disallow: "/",
      },
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/sitemap.xml`,
  }
}
```

**Why**: Next.js App Router generates `/robots.txt` automatically from this route handler. Allowing AI bots (GPTBot, PerplexityBot, ClaudeBot) is critical for AI visibility. Blocking CCBot prevents training-only scraping while allowing search citation.

### 1.3 Sitemap — `app/sitemap.ts`

Create new file:

```ts
import { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ]
}
```

**Why**: Next.js generates `/sitemap.xml` automatically. The `changeFrequency` and `priority` fields guide crawl behavior. This will grow as pages are added.

### 1.4 Per-Page Metadata — `app/page.tsx`

Add `generateMetadata` to each page for unique titles/descriptions:

```ts
import type { Metadata } from "next"

export function generateMetadata(): Metadata {
  return {
    title: "Your SaaS Product — Tagline Here",
    description: "Specific description for the homepage focused on primary value proposition.",
    alternates: {
      canonical: "/",
    },
  }
}
```

### 1.5 Favicon & App Icons

Place in `public/` or `app/`:
- `favicon.ico` — 32x32 (legacy browsers)
- `favicon-16x16.png` — 16x16
- `favicon-32x32.png` — 32x32
- `apple-icon.png` — 180x180 (iOS home screen)
- `android-chrome-192x192.png` — 192x192
- `android-chrome-512x512.png` — 512x512
- `site.webmanifest` — PWA manifest

**Why**: Professional favicon improves CTR in SERPs and browser tabs. Apple/Android icons enable PWA installation.

---

## Phase 2: On-Page Optimization

### 2.1 Open Graph Image

Create `public/og-image.png` (1200x630px, < 1MB):
- Clean design with product name + tagline
- Brand colors and logo
- No text near edges (cropped on some platforms)

**Alternative**: Use `@vercel/og` for dynamic OG images per page:

```tsx
// app/og/route.tsx
import { ImageResponse } from "next/og"

export const runtime = "edge"

export async function GET() {
  return new ImageResponse(
    (
      <div style={{ /* styles */ }}>
        <h1>Your SaaS Product</h1>
        <p>Tagline here</p>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
```

### 2.2 Heading Structure

Current `page.tsx` has `<h1 className="font-medium">Project ready!</h1>` — this is a scaffold placeholder.

**Fix**:
- H1 should contain primary keyword and describe page purpose
- One H1 per page only
- Logical hierarchy: H1 → H2 → H3
- Use semantic heading elements, not styled divs

### 2.3 Content Optimization

Current page is a scaffold with no real content. When building:
- Primary keyword in first 100 words
- Related keywords used naturally
- Sufficient depth for the topic
- Answer search intent directly
- Use `<article>`, `<section>`, `<main>` semantic elements

### 2.4 Image Optimization

When adding images:
- Use `next/image` component (automatic WebP, lazy loading, responsive sizing)
- Descriptive `alt` text on every image
- Compress images before upload
- Use modern formats (WebP/AVIF)

```tsx
import Image from "next/image"

<Image
  src="/hero.png"
  alt="Description of what the image shows"
  width={800}
  height={600}
  priority // for LCP image only
/>
```

---

## Phase 3: Technical SEO

### 3.1 Structured Data (JSON-LD)

Add to `layout.tsx` body (already included in Phase 1 plan):

**WebSite Schema** — Enables sitelinks search box in Google:
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Your SaaS Product",
  "url": "https://yourdomain.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://yourdomain.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

**Organization Schema** — Enables Knowledge Panel:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company",
  "url": "https://yourdomain.com",
  "logo": "https://yourdomain.com/logo.png",
  "sameAs": [
    "https://twitter.com/yourcompany",
    "https://linkedin.com/company/yourcompany"
  ]
}
```

**Future schemas to add as pages grow**:
- `SoftwareApplication` — for product pages
- `FAQPage` — for FAQ sections
- `HowTo` — for tutorial content
- `Article` / `BlogPosting` — for blog posts
- `Product` — for pricing/feature pages
- `BreadcrumbList` — for navigation

### 3.2 Core Web Vitals

**Current optimizations already in place**:
- Tailwind CSS v4 purges unused styles automatically
- Geist fonts from `next/font/google` (no layout shift)

**Additional optimizations**:
- Add `display: "swap"` and `preload: true` to font config (included in Phase 1 layout plan)
- Use `priority` on LCP image only
- Minimize client components (`"use client"`) — current `page.tsx` is fully client-side, should be server component where possible
- Add `loading="lazy"` to below-fold images (automatic with `next/image`)
- Consider `next/dynamic` for heavy component imports

### 3.3 Security Headers — `next.config.mjs`

```ts
import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },
  redirects() {
    return [
      {
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: "www.yourdomain.com" }],
        destination: "https://yourdomain.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        missing: [{ type: "header", key: "x-forwarded-proto", value: "https" }],
        destination: "https://yourdomain.com/:path*",
        permanent: true,
      },
    ]
  },
}

export default nextConfig
```

**Why**: HSTS enforces HTTPS. Security headers prevent common attacks. Redirects enforce canonical domain (www vs non-www) and HTTPS.

### 3.4 Custom Error Pages

**`app/not-found.tsx`**:
```tsx
import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist.",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <div className="flex min-h-svw flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-4 text-lg text-muted-foreground">Page not found</p>
      <Link href="/" className="mt-6 text-primary hover:underline">
        Return to homepage
      </Link>
    </div>
  )
}
```

**`app/error.tsx`**:
```tsx
"use client"

import { useEffect } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-svw flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Something went wrong</h1>
      <button onClick={() => reset()} className="mt-6 text-primary hover:underline">
        Try again
      </button>
    </div>
  )
}
```

**`app/loading.tsx`**:
```tsx
export default function Loading() {
  return (
    <div className="flex min-h-svw items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}
```

### 3.5 URL Structure

When adding routes, follow:
- Lowercase, hyphen-separated: `/features/analytics` not `/Features/Analytics`
- No file extensions in URLs
- Consistent trailing slash behavior (Next.js default: no trailing slash)
- Descriptive slugs: `/pricing` not `/p`
- Avoid dynamic params in URL when possible: `/blog/how-to-use-saas` not `/blog/[id]`

---

## Phase 4: Content & Architecture

### 4.1 Recommended Site Structure

```
/
├── / (Homepage)
├── /features
│   ├── /features/feature-1
│   └── /features/feature-2
├── /pricing
├── /blog
│   └── /blog/[slug]
├── /docs
│   └── /docs/[slug]
├── /about
├── /contact
├── /legal
│   ├── /privacy
│   └── /terms
└── /404
```

### 4.2 Internal Linking Strategy

- Homepage links to all top-level sections
- Feature pages link to each other where relevant
- Blog posts link to product/feature pages
- All pages link back to homepage via navbar
- Breadcrumb navigation for deep pages
- Related posts section on blog articles

### 4.3 AI SEO — Content Extractability

For each page, include:
- **Definition block**: Clear "what is" in first paragraph
- **FAQ section**: Natural-language questions with direct answers
- **Comparison tables**: Structured data for "[X] vs [Y]" queries
- **Statistics with sources**: Specific numbers boost AI citation by 37%
- **Expert attribution**: Author names, credentials, quotes
- **"Last updated" date**: Freshness signals matter for AI

### 4.4 AI SEO — Machine-Readable Files

**`/llms.txt`** — Context file for AI systems:
```
# Your SaaS Product

Your SaaS product is a [category] that helps [target audience] [solve problem].

## Key Pages
- Homepage: https://yourdomain.com/
- Features: https://yourdomain.com/features
- Pricing: https://yourdomain.com/pricing
- Documentation: https://yourdomain.com/docs
- Blog: https://yourdomain.com/blog
```

**`/pricing.md`** — Structured pricing for AI agents:
```markdown
# Pricing — Your SaaS Product

## Free
- Price: $0/month
- Limits: 100 requests/month, 1 user
- Features: Basic templates, API access

## Pro
- Price: $29/month (billed annually) | $39/month (billed monthly)
- Limits: 10,000 requests/month, 5 users
- Features: Custom domains, analytics, priority support

## Enterprise
- Price: Custom — contact sales@yourdomain.com
- Limits: Unlimited requests, unlimited users
- Features: SSO, SLA, dedicated account manager
```

### 4.5 AI SEO — Robots.txt for AI Bots

Already covered in Phase 1.3. Key points:
- Allow: GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, Google-Extended
- Disallow: CCBot (Common Crawl training-only)
- This enables AI citation while preventing training data scraping

---

## Phase 5: Monitoring & Analytics

### 5.1 Google Search Console

1. Verify domain ownership (DNS or HTML file)
2. Submit sitemap: `/sitemap.xml`
3. Monitor:
   - Index coverage
   - Core Web Vitals
   - Search queries and CTR
   - Mobile usability

### 5.2 Analytics

Add to `app/layout.tsx`:
- Google Analytics 4 (via `next/script`)
- Or privacy-friendly alternative: Plausible, Umami, Fathom

```tsx
import Script from "next/script"

<Script
  src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

### 5.3 AI Visibility Monitoring

Monthly check for top 20 queries across:
- Google AI Overviews
- ChatGPT (with web search)
- Perplexity

Track: Are you cited? Who else is cited? What pages?

---

## Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=your-verification-code
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## Files to Create/Modify Summary

| File | Action | Phase |
|------|--------|-------|
| `app/layout.tsx` | Modify — Add metadata, viewport, JSON-LD, font preload | 1, 3 |
| `app/page.tsx` | Modify — Add generateMetadata, semantic HTML | 1, 2 |
| `app/robots.ts` | Create — Robots.txt route handler | 1 |
| `app/sitemap.ts` | Create — Sitemap route handler | 1 |
| `app/not-found.tsx` | Create — Custom 404 page | 3 |
| `app/error.tsx` | Create — Error boundary | 3 |
| `app/loading.tsx` | Create — Loading state | 3 |
| `next.config.mjs` | Modify — Security headers, redirects | 3 |
| `public/og-image.png` | Create — Open Graph image (1200x630) | 2 |
| `public/favicon.ico` | Create — Favicon | 1 |
| `public/apple-icon.png` | Create — Apple touch icon (180x180) | 1 |
| `public/android-chrome-192x192.png` | Create — Android icon | 1 |
| `public/android-chrome-512x512.png` | Create — Android icon | 1 |
| `public/site.webmanifest` | Create — PWA manifest | 1 |
| `public/llms.txt` | Create — AI context file | 4 |
| `public/pricing.md` | Create — AI-readable pricing | 4 |
| `.env.local` | Create — Environment variables | 5 |

---

## Quick Wins (Do First)

1. Add `metadata` to `layout.tsx` — immediate SERP improvement
2. Create `robots.ts` — controls crawl behavior
3. Create `sitemap.ts` — helps Google discover pages
4. Add `og-image.png` — better social sharing
5. Add security headers to `next.config.mjs` — security + SEO signal

## When Domain is Purchased

1. Update `NEXT_PUBLIC_SITE_URL` in `.env.local`
2. Update all placeholder text in metadata
3. Update JSON-LD structured data with real URLs
4. Create and upload real favicon/OG images
5. Verify domain in Google Search Console
6. Submit sitemap to Search Console
7. Set up HTTPS redirects in `next.config.mjs`
8. Add real social media URLs to Organization schema
