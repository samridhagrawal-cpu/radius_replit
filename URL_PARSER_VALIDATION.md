# URL Parser Validation Test Cases

This document provides comprehensive test cases to validate the URL parser implementation.

## ✅ Valid URL Test Cases

Test these inputs - all should successfully extract clean domains:

| User Input | Expected Output | Notes |
|------------|----------------|-------|
| `example.com` | `example.com` | Basic domain |
| `www.example.com` | `example.com` | Remove www prefix |
| `https://example.com` | `example.com` | With HTTPS |
| `http://www.example.com` | `example.com` | HTTP with www |
| `https://www.example.com/about` | `example.com` | With path |
| `example.com/products/item?id=123` | `example.com` | Path + params |
| `https://blog.example.com` | `blog.example.com` | Preserve subdomain |
| `EXAMPLE.COM` | `example.com` | Case normalization |
| `  example.com  ` | `example.com` | Whitespace trimming |
| `example.co.uk` | `example.co.uk` | Multi-part TLD |
| `example.com#section` | `example.com` | Remove fragment |
| `example.com:3000` | `example.com` | Remove port |
| `https://example.com:443/page` | `example.com` | Port + path |
| `shop.example.com/products` | `shop.example.com` | Subdomain + path |
| `example.in` | `example.in` | Country TLD |
| `stripe.com` | `stripe.com` | Real-world example |
| `www.stripe.com/pricing` | `stripe.com` | Real-world with path |
| `https://docs.stripe.com/api` | `docs.stripe.com` | Real-world subdomain |

## ❌ Invalid URL Test Cases

These inputs should show appropriate error messages:

| User Input | Expected Error | Reason |
|------------|----------------|--------|
| `localhost` | "Cannot analyze localhost..." | Local development |
| `http://localhost:3000` | "Cannot analyze localhost..." | Local with port |
| `127.0.0.1` | "Please use a domain name..." | IP address |
| `192.168.1.1` | "Please use a domain name..." | Private IP |
| `example` | "Please include a domain extension..." | No TLD |
| `ex` | "Please enter a complete domain name" | Too short |
| `example.local` | "This appears to be a private/internal domain" | Private TLD |

## 🎯 Real-World Scenarios

### Scenario 1: Browser Address Bar Copy
```
Input: https://www.github.com/facebook/react/blob/main/README.md
Expected: github.com
✓ Removes protocol, www, and entire path
```

### Scenario 2: Marketing Material
```
Input: Visit us at www.example.com!
Expected: example.com
✓ Extracts domain from text
```

### Scenario 3: Quick Type
```
Input: stripe.com
Expected: stripe.com
✓ Works without protocol
```

### Scenario 4: With Tracking Parameters
```
Input: example.com?utm_source=email&utm_campaign=launch
Expected: example.com
✓ Removes all query parameters
```

## 🔄 User Experience Features

### Real-time Validation
- ✓ Green checkmark appears when domain is valid
- ✓ Shows processed domain: "Analyzing: example.com"
- ✓ Red error icon with message for invalid inputs
- ✓ Search button disabled until valid domain entered

### Error Messages
- Clear, actionable error messages
- No technical jargon
- Helpful suggestions (e.g., "Try format: example.com")

### Visual Feedback
- Instant feedback as user types
- No errors shown while actively typing (only on immediate issues like localhost)
- Full validation on submit attempt

## 🧪 Manual Testing Checklist

- [ ] Test all valid URL formats above
- [ ] Test all error cases above
- [ ] Verify www is always removed
- [ ] Verify subdomains are preserved
- [ ] Verify case normalization works
- [ ] Check visual feedback appears correctly
- [ ] Verify error messages are clear
- [ ] Test with whitespace before/after
- [ ] Test real-world company URLs (Stripe, GitHub, etc.)
- [ ] Verify analysis works end-to-end

## 🚀 Performance Requirements

- URL parsing should feel instant (< 50ms)
- No lag when typing
- Smooth transitions for feedback UI
- Cache prevents re-parsing same inputs

## 📝 Implementation Notes

**Files Modified:**
- `client/src/lib/urlNormalizer.ts` - Core parsing logic
- `client/src/components/HeroSection.tsx` - Integration with UI

**Key Features:**
- Supports 50+ TLDs
- Handles international domains
- Common typo corrections
- Graceful error handling
- Performance-optimized caching
