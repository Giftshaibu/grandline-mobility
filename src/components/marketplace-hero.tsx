export function MarketplaceHero({
  title,
  description,
  image = "road",
  children,
}: {
  title: string;
  description: string;
  image?: "road" | "workshop";
  children?: React.ReactNode;
}) {
  const src =
    image === "workshop"
      ? "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1800&q=80"
      : "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=80";
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
