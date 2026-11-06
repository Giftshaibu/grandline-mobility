import { liveMobility } from "../lib/config";
import { listingAction } from "../lib/marketplace";
export function ListingCallout() {
  return (
    <aside className="listing-callout">
      <div>
        <h2>Bring your business to Grandline</h2>
        <p>
          {liveMobility ? "List your business or offering now. It can go live while staff review it, with seven days for payment verification." : "New listing registration is temporarily unavailable. Please check back soon."}
        </p>
      </div>
      {liveMobility && <a className="button" href={listingAction.href}>{listingAction.label} →</a>}
    </aside>
  );
}
