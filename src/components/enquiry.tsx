import { useId } from "react";
export function Enquiry() {
  const note = useId();
  return (
    <section className="enquiry-panel" aria-labelledby={`${note}-title`}>
      <h2 id={`${note}-title`}>Send an enquiry</h2>
      <p id={note}>
        Enquiries will open when the directory is connected. Nothing entered
        here is sent or saved.
      </p>
      <form onSubmit={(event) => event.preventDefault()}>
        <fieldset disabled aria-describedby={note}>
          <label>
            Your name
            <input autoComplete="name" name="name" />
          </label>
          <label>
            Email address
            <input type="email" autoComplete="email" name="email" />
          </label>
          <label>
            How can the provider help?
            <textarea name="message" rows={4} />
          </label>
          <button className="button" type="submit">
            Enquiries unavailable
          </button>
        </fieldset>
      </form>
    </section>
  );
}
