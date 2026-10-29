import { listingAction } from "../lib/marketplace";
export function ListingCallout() {
  return (
    <aside className="listing-callout">
      <div>
        <h2>Bring your business to Grandline</h2>
        <p>
          Prepare your business or offering details, add optional photos and
          review your application. Final submission is not available yet.
        </p>
      </div>
      <a className="button" href={listingAction.href}>
        {listingAction.label} →
      </a>
    </aside>
  );
}
