import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { WelcomeDialog } from "@grandline/ui";

const props = { product: "welcome-test", title: "Find a service", description: "Browse local providers", options: [{ label: "Browse", description: "See providers", href: "#providers" }] };
beforeEach(() => {
  sessionStorage.clear();
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute("open", ""); } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute("open"); this.dispatchEvent(new Event("close")); } });
});
afterEach(() => { cleanup(); sessionStorage.clear(); vi.restoreAllMocks(); });

it("remembers browsing across navigation and refresh, then opens in a new session", () => {
  const first = render(<WelcomeDialog {...props} />);
  expect(screen.getByRole("dialog")).toHaveAttribute("open");
  fireEvent.click(screen.getByRole("button", { name: "Just browsing" }));
  first.unmount();
  const next = render(<WelcomeDialog {...props} />);
  expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
  next.unmount(); sessionStorage.clear();
  render(<WelcomeDialog {...props} />);
  expect(screen.getByRole("dialog")).toHaveAttribute("open");
});

it("records an option before navigation without treating it as browsing", () => {
  const onChoose = vi.fn(() => expect(sessionStorage.getItem("grandline:welcome:welcome-test:dismissed")).toBe("1"));
  const onBrowse = vi.fn();
  render(<WelcomeDialog {...props} onChoose={onChoose} onBrowse={onBrowse} />);
  fireEvent.click(screen.getByRole("link", { name: /Browse See providers/ }));
  expect(onChoose).toHaveBeenCalledWith("#providers");
  expect(onBrowse).not.toHaveBeenCalled();
  expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
});

it("remembers closing with the close button or Escape", () => {
  const first = render(<WelcomeDialog {...props} />);
  fireEvent.click(screen.getByRole("button", { name: "Close welcome" }));
  first.unmount();
  const next = render(<WelcomeDialog {...props} />);
  expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
  next.unmount(); sessionStorage.clear();
  render(<WelcomeDialog {...props} />);
  fireEvent(screen.getByRole("dialog"), new Event("close"));
  expect(sessionStorage.getItem("grandline:welcome:welcome-test:dismissed")).toBe("1");
});

it("waits for auth and never opens for a signed-in visitor", () => {
  const view = render(<WelcomeDialog {...props} ready={false} />);
  expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
  view.rerender(<WelcomeDialog {...props} ready signedIn />);
  expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
});

it("only reopens on an explicit new request, not a stable forceOpen value", () => {
  const view = render(<WelcomeDialog {...props} forceOpen />);
  fireEvent.click(screen.getByRole("button", { name: "Just browsing" }));
  view.rerender(<WelcomeDialog {...props} forceOpen />);
  expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
  view.rerender(<WelcomeDialog {...props} forceOpen={false} />);
  view.rerender(<WelcomeDialog {...props} forceOpen />);
  expect(screen.getByRole("dialog")).toHaveAttribute("open");
});

it("does not break navigation when storage is blocked", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  const first = render(<WelcomeDialog {...props} product="blocked-storage-test" />);
  fireEvent.click(screen.getByRole("button", { name: "Just browsing" }));
  first.unmount();
  render(<WelcomeDialog {...props} product="blocked-storage-test" />);
  expect(screen.getByRole("dialog", { hidden: true })).not.toHaveAttribute("open");
});
