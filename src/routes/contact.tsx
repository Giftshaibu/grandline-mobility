import { createFileRoute } from "@tanstack/react-router";
import { GrandlineContactDetails } from "@grandline/ui/contact";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact Grandline Mobility" }, { name: "description", content: "Call, WhatsApp or email the Grandline team." }] }),
  component: () => (
    <section className="wrap section">
      <h1 className="directory-title">Contact us</h1>
      <p>Talk to the team about transport, rides or your listing.</p>
      <GrandlineContactDetails headingLevel={2} />
    </section>
  ),
});
