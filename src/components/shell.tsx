import { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import Search01Icon from "@hugeicons/core-free-icons/Search01Icon";
import Menu01Icon from "@hugeicons/core-free-icons/Menu01Icon";
import ArrowDown01Icon from "@hugeicons/core-free-icons/ArrowDown01Icon";
import Cancel01Icon from "@hugeicons/core-free-icons/Cancel01Icon";
import { ecosystem } from "../lib/config";
import {
  listingAction,
  categoryLinks,
  marketplaceLinks,
  productName,
  searchDestination,
} from "../lib/marketplace";
import { AccountControl } from "./auth";
export function Shell({ children }: { children: React.ReactNode }) {
  const search = useRef<HTMLDialogElement>(null);
  const menu = useRef<HTMLDialogElement>(null);
  const links = ecosystem.filter((item) => item.url);
  return (
    <>
      <a className="skip" href="#main-content">
        Skip to content
      </a>
      <div className="topline">
        <div className="wrap topline-inner">
          <span>Vehicles, parts and services across Malawi</span>
          <span>Grandline {productName}</span>
        </div>
      </div>
      <header className="market-header">
        <div className="wrap site-header">
          <a
            href="/"
            aria-label={`grandlineauto ${productName.toLowerCase()} home`}
          >
            <img className="brand" src="/logo-full.svg" alt="grandlineauto" />
            <span className="product-name">{productName}</span>
          </a>
          <div className="header-actions">
            <button
              className="icon-action"
              aria-label="Open search"
              onClick={() => search.current?.showModal()}
            >
              <HugeiconsIcon icon={Search01Icon} size={23} />
              <span>Search</span>
            </button>
            <a
              className="button header-listing-action"
              href={listingAction.href}
            >
              {listingAction.label}
            </a>
            <AccountControl />
            <button
              className="icon-action mobile-menu"
              aria-label="Open menu"
              onClick={() => menu.current?.showModal()}
            >
              <HugeiconsIcon icon={Menu01Icon} size={24} />
            </button>
          </div>
        </div>
        <nav
          className="product-nav wrap desktop-nav"
          aria-label="Main navigation"
        >
          <a href="/">Home</a>
          {marketplaceLinks.map((item) => (
            <details
              key={item.href}
              onMouseEnter={(event) => {
                if (window.matchMedia("(hover: hover)").matches)
                  event.currentTarget.open = true;
              }}
              onMouseLeave={(event) => {
                if (
                  window.matchMedia("(hover: hover)").matches &&
                  !event.currentTarget.contains(document.activeElement)
                )
                  event.currentTarget.open = false;
              }}
              onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget))
                  event.currentTarget.open = false;
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector("summary")?.focus();
                }
              }}
            >
              <summary
                onClick={(event) => {
                  if (
                    event.detail > 0 &&
                    window.matchMedia("(hover: hover)").matches
                  ) {
                    event.preventDefault();
                    (
                      event.currentTarget.parentElement as HTMLDetailsElement
                    ).open = true;
                  }
                }}
              >
                <span>{item.label}</span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={14}
                  aria-hidden="true"
                />
              </summary>
              <div className="nav-dropdown">
                <a href={item.href}>
                  <strong>{item.label} →</strong>
                  <span>{item.description}</span>
                </a>
                <div className="nav-categories">
                  {categoryLinks(item.href).map((category) => (
                    <a key={category.href} href={category.href}>
                      {category.label}
                    </a>
                  ))}
                </div>
              </div>
            </details>
          ))}
          <div className="ecosystem-nav">
            {links
              .filter((item) => item.label !== productName)
              .map((item) => (
                <a key={item.label} href={item.url}>
                  {item.label} ↗
                </a>
              ))}
          </div>
        </nav>
      </header>
      <dialog
        ref={search}
        className="market-dialog"
        aria-labelledby="site-search-title"
      >
        <div className="dialog-top">
          <h2 id="site-search-title">Search Grandline {productName}</h2>
          <button
            className="icon-action"
            aria-label="Close search"
            onClick={() => search.current?.close()}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={24} />
          </button>
        </div>
        <form action={searchDestination} method="get">
          <label>
            What are you looking for?
            <input
              name="q"
              maxLength={120}
              placeholder={
                productName === "Services"
                  ? "Shop, service or expertise"
                  : "Vehicle or transport provider"
              }
            />
          </label>
          <button className="button" type="submit">
            Search
          </button>
        </form>
        <p className="muted">Explore a category</p>
        <div className="dialog-links">
          {marketplaceLinks.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label} →
            </a>
          ))}
        </div>
      </dialog>
      <dialog
        ref={menu}
        className="market-dialog menu-dialog"
        aria-labelledby="menu-title"
      >
        <div className="dialog-top">
          <h2 id="menu-title">Grandline {productName}</h2>
          <button
            className="icon-action"
            aria-label="Close menu"
            onClick={() => menu.current?.close()}
          >
            <HugeiconsIcon icon={Cancel01Icon} size={24} />
          </button>
        </div>
        <nav aria-label="Mobile navigation">
          <a href={listingAction.href}>
            <strong>{listingAction.label}</strong>
            <span>Prepare an application for future staff review</span>
          </a>
          <a href="/">Home</a>
          {marketplaceLinks.map((item) => (
            <a key={item.href} href={item.href}>
              <strong>{item.label}</strong>
              <span>{item.description}</span>
            </a>
          ))}
          {links
            .filter((item) => item.label !== productName)
            .map((item) => (
              <a key={item.label} href={item.url}>
                {item.label} ↗
              </a>
            ))}
        </nav>
      </dialog>
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <footer>
        <div className="wrap market-footer">
          <div>
            <img
              className="brand"
              src="/logo-light-full.svg"
              alt="grandlineauto"
            />
            <p>
              {productName === "Services"
                ? "Find shops, explore expertise and connect your search for services and spare parts."
                : "Find transport for everyday journeys, heavy-duty work and moving goods."}
            </p>
            <span className="footer-label">
              Grandline {productName} · Malawi
            </span>
          </div>
          <nav aria-label={`${productName} footer`}>
            <h3>Explore {productName}</h3>
            <a href={listingAction.href}>{listingAction.label} →</a>
            {marketplaceLinks.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          {links.length > 0 && (
            <nav aria-label="Grandline ecosystem">
              <h3>Across Grandline</h3>
              {links.map((item) => (
                <a key={item.label} href={item.url}>
                  {item.label} ↗
                </a>
              ))}
            </nav>
          )}
          <div>
            <h3>Before you enquire</h3>
            <p>
              Directories and online requests are being prepared. No booking or
              payment is taken on this site.
            </p>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© {new Date().getFullYear()} grandlineauto</span>
          <span>Browse. Compare. Connect.</span>
        </div>
      </footer>
    </>
  );
}
