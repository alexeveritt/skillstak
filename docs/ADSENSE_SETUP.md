# Google AdSense Setup Guide for Skillstak

## Overview
This guide covers everything you need to integrate Google AdSense into your Skillstak application.

## Current Status ✅
Your application already has the AdSense infrastructure built in! Here's what's already configured:

- ✅ AdSense script loader in `root.tsx`
- ✅ `AdFooter` component for displaying ads
- ✅ Environment variable support
- ✅ Google site verification meta tag support (just added)

## Step-by-Step Setup

### 1. Site Ownership Verification (IN PROGRESS)

Google AdSense requires you to verify that you own the site. You have three options:

#### Option A: Meta Tag Method (Recommended - Now Supported!)
1. Go to your Google AdSense dashboard
2. Copy the verification code (looks like: `abcdefghijklmnopqrstuvwxyz123456`)
3. Add it to your environment variables:

**For local development (.env):**
```bash
GOOGLE_SITE_VERIFICATION=your-verification-code-here
```

**For production (Cloudflare Pages):**
```bash
# Update wrangler.toml production vars
[env.production.vars]
GOOGLE_SITE_VERIFICATION = "your-verification-code-here"

# Or set via Cloudflare dashboard:
# Pages → Your Project → Settings → Environment Variables
```

4. Deploy your changes
5. Go back to Google AdSense and click "Verify"

#### Option B: HTML File Method
1. Download the verification HTML file from Google
2. Place it in the `public/` folder
3. Deploy your changes
4. Verify in Google AdSense

#### Option C: Google Analytics/Tag Manager
If you're already using these, you can verify through them.

### 2. Get Your AdSense Publisher ID

Once your site is verified and approved by Google AdSense:

1. Go to your AdSense dashboard
2. Navigate to "Account" → "Account Information"
3. Copy your Publisher ID (format: `ca-pub-1234567890123456`)

### 3. Configure Your Application

#### For Local Development:

Edit `.env`:
```bash
ADSENSE_CLIENT=ca-pub-1234567890123456
GOOGLE_SITE_VERIFICATION=your-verification-code
```

#### For Production (Cloudflare Pages):

You have two options:

**Option A: Edit wrangler.toml**
```toml
[env.production.vars]
ADSENSE_CLIENT = "ca-pub-1234567890123456"
GOOGLE_SITE_VERIFICATION = "your-verification-code"
```

**Option B: Via Cloudflare Dashboard**
1. Go to Cloudflare Pages dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add/update these variables for Production:
   - `ADSENSE_CLIENT`: `ca-pub-1234567890123456`
   - `GOOGLE_SITE_VERIFICATION`: `your-verification-code`

### 4. Create Ad Units (After Approval)

Once Google approves your site:

1. Go to AdSense → Ads → By ad unit
2. Create a new ad unit (Display ad recommended)
3. Copy the ad slot ID (looks like: `1234567890`)
4. Update `app/components/AdFooter.tsx`:

```typescript
<ins
  className="adsbygoogle"
  style={{ display: "block" }}
  data-ad-client={adsense}
  data-ad-slot="1234567890"  // ← Replace with your ad slot ID
  data-ad-format="auto"
  data-full-width-responsive="true"
></ins>
```

### 5. Add Ads to Your Pages

The `AdFooter` component is ready to use. Import and add it to any route:

```typescript
import { AdFooter } from "~/components/AdFooter";

export default function YourPage() {
  return (
    <div>
      {/* Your page content */}
      <AdFooter />
    </div>
  );
}
```

## Testing

### Test Locally:
```bash
npm run dev
```

Visit your site and inspect the page source. You should see:
- The AdSense script in the `<head>` (if ADSENSE_CLIENT is set)
- The Google site verification meta tag (if GOOGLE_SITE_VERIFICATION is set)

### Test on Cloudflare:
```bash
npm run build
npm run dev:wrangler
```

## Deployment

```bash
npm run build
wrangler pages deploy ./build/client
```

Or push to your git repository if you have automatic deployments set up.

## Important Notes

⚠️ **AdSense Policies:**
- Don't click your own ads
- Don't ask others to click your ads
- Ensure your content complies with [AdSense Program Policies](https://support.google.com/adsense/answer/48182)

⏳ **Approval Timeline:**
- Site verification: Usually instant to 24 hours
- AdSense approval: Can take 1-2 weeks or longer
- Ads won't show until your site is fully approved

🧪 **Testing Ads:**
- Use Google's Ad Preview tool to see how ads will look
- Ads may not show immediately even after approval (can take hours)
- Low traffic sites may not show ads on every page load

## Troubleshooting

### Ads Not Showing?
1. Check browser console for errors
2. Verify ADSENSE_CLIENT is set correctly
3. Ensure your site is approved by Google AdSense
4. Check that you're not using an ad blocker
5. Wait 24-48 hours after approval

### Verification Meta Tag Not Working?
1. Check the page source of your deployed site
2. Ensure GOOGLE_SITE_VERIFICATION is set in production environment
3. Clear browser cache and check again
4. Make sure you deployed after setting the environment variable

### Environment Variables Not Working?
- For local dev: Restart your dev server after changing `.env`
- For Cloudflare: Redeploy after changing environment variables

## Additional Ad Placements

You can create more ad components for different placements:

### In-Content Ad (example):
```typescript
// app/components/InContentAd.tsx
import { useLoaderData } from "react-router";

export function InContentAd() {
  const { adsense } = useLoaderData() as { adsense?: string };
  if (!adsense) return null;
  
  return (
    <div className="my-8 flex justify-center">
      <ins
        className="adsbygoogle"
        style={{ display: "block", textAlign: "center" }}
        data-ad-client={adsense}
        data-ad-slot="YOUR_SLOT_ID"
        data-ad-format="fluid"
        data-ad-layout="in-article"
      />
      <script dangerouslySetInnerHTML={{ __html: "(adsbygoogle = window.adsbygoogle || []).push({});" }} />
    </div>
  );
}
```

## Resources

- [Google AdSense Help Center](https://support.google.com/adsense)
- [AdSense Program Policies](https://support.google.com/adsense/answer/48182)
- [AdSense Code Implementation](https://support.google.com/adsense/answer/9274019)

## Next Steps

1. ✅ Complete site ownership verification (in progress)
2. ⏳ Wait for Google AdSense approval (1-2 weeks)
3. 📝 Create ad units in AdSense dashboard
4. 🎨 Add AdFooter component to your pages
5. 🚀 Deploy and monitor performance

---

**Need Help?** Check the troubleshooting section or visit the Google AdSense support forums.

