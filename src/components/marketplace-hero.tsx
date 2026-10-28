export function MarketplaceHero({
  title,
  description,
  image = "road",
  children,
}: {
  title: string;
  description: string;
  image?: "road" | "workshop" | "truck" | "bike";
  children?: React.ReactNode;
}) {
  const src = {
    road: "/marketplace-road.jpg",
    workshop: "/marketplace-workshop.jpg",
    truck: "/marketplace-truck.jpg",
    bike: "/marketplace-bike.jpg",
  }[image];
  return (
    <section className="marketplace-hero">
      <img src={src} alt="" fetchPriority="high" />
      <div className="hero-shade" />
      <div className="wrap market-hero-content">
        <p className="product-label">GRANDLINE · MALAWI</p>
        <h1>{title}</h1>
        <p>{description}</p>
        {children}
        <span className="editorial-caption">
          Illustrative photography · not a listing
        </span>
      </div>
    </section>
  );
}
