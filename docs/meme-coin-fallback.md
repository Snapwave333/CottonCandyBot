# Meme Coin Fallback Icon System

## Overview
This project implements a scalable, vector-based fallback icon system for meme coins and cryptocurrency tokens. It ensures that the application maintains a polished "Cotton Candy" aesthetic even when external token assets fail to load or are missing.

## Design Philosophy
- **Aesthetic:** Minimalist, "Cotton Candy" theme (Pastel Pink/Blue).
- **Motif:** A generic "Sparkle Coin" representing the volatile and "magical" nature of meme coins.
- **Flexibility:** Vector-based (SVG) for perfect scaling from 16px to 256px.

## Implementation Details

### Source Code
The fallback icon is implemented as a React Component wrapping an SVG.
- **Location:** `src/components/ui/meme-coin-fallback.tsx`
- **Wrapper:** `src/components/ui/token-image.tsx`

### Usage
To display a token image with automatic fallback:

```tsx
import { TokenImage } from "@/components/ui/token-image";

<TokenImage 
  src={token.imageUrl} 
  alt={token.symbol} 
  size={40} 
  className="rounded-full" 
/>
```

### Color Variants
The component supports 3 variants via the `variant` prop:
1. **`cotton`** (Default): Pink/Blue Gradient - Best for main UI.
2. **`dark`**: Dark Grey/Slate - For dark mode backgrounds or subdued contexts.
3. **`light`**: Light Grey - For light mode or placeholders.

```tsx
<TokenImage src="..." fallbackVariant="dark" />
```

## Accessibility
- **Role:** `img`
- **ARIA Label:** "Meme Coin Fallback Icon"
- **Contrast:** The "Cotton" variant uses high-contrast accents (#FFFFFF) against the pastel gradient to ensure visibility.

## Technical Specifications
- **Format:** SVG (Inline React Component)
- **ViewBox:** 0 0 64 64
- **Dependencies:** `lucide-react` (optional, for icons), `tailwind-merge` (for class handling).

## Future Improvements
- Add animation support (e.g., a spinning sparkle on hover).
- Allow passing custom colors via props.
