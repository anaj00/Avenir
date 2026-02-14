## Packages
three | 3D rendering engine
@react-three/fiber | React renderer for Three.js
@react-three/drei | Helpers for @react-three/fiber
framer-motion | Complex animations for loading states and page transitions
lucide-react | Elegant icons (already in base, but listing for explicit usage)
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility for merging Tailwind CSS classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  serif: ["var(--font-serif)"],
  sans: ["var(--font-sans)"],
}
The app will use a dark theme by default.
3D viewer will mock a model if none is provided by backend.
