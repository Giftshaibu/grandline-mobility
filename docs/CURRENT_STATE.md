# Current state - 2026-11-06

Mobility consumes the versioned @grandline/ui archive for catalogue cards, grids, listing progress, and a product-specific welcome dialog. Headers use Clerk avatar controls. The listing form removes manual application-ID entry and shows maintenance before the long form while the live action is disabled. The source default uses mobility.grandlineautomw.com.

Source was pushed to main at 86211c2. Typecheck and production build passed; the earlier suite passed 66 tests. The public Mobility domain returns HTTPS 200, but deployed version and authenticated journeys remain unverified. The live backend capability endpoint returned all Services, Mobility, and rides flags false on November 6. Real submissions and rides require hosting activation and end-to-end verification.
