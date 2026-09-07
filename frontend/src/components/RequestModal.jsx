import { useEffect, useState } from "react";
import { formatCurrency, titleCase } from "../utils/formatters";

const emptyForm = {
  serviceType: "",
  description: "",
  preferredDate: "",
};

export default function RequestModal({ open, onClose, onSubmit, entrepreneur, submitting, error }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) setForm(emptyForm);
  }, [open, entrepreneur?._id]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape" && !submitting) onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, submitting]);

  if (!open) return null;

  const today = new Date().toISOString().slice(0, 10);

  const handleChange = (event) =>
    setForm({ ...form, [event.target.name]: event.target.value });

  const submit = (event) => {
    event.preventDefault();
    onSubmit({
      ...form,
      serviceType: form.serviceType.trim(),
      description: form.description.trim(),
    });
  };

  return (
    <div className="modalBackdrop" onClick={() => !submitting && onClose()}>
      <section
        className="modalPanel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sectionHeader">
          <p className="eyebrow">New request</p>
          <h2 id="request-modal-title">Send request to {entrepreneur?.user?.name}</h2>
          <p>
            {titleCase(entrepreneur?.category)} from {entrepreneur?.user?.location || "your area"}
            {" - "}
            {formatCurrency(entrepreneur?.minPrice)} to {formatCurrency(entrepreneur?.maxPrice)}
          </p>
        </div>

        {error && <div role="alert" className="notice noticeError">{error}</div>}
        <form onSubmit={submit} className="formStack">
          <label className="field">
            <span className="label">Service type</span>
            <input
              className="input"
              name="serviceType"
              maxLength={100}
              placeholder="Stitching, repair, pottery..."
              value={form.serviceType}
              onChange={handleChange}
              required
            />
          </label>

          <label className="field">
            <span className="label">Description</span>
            <textarea
              className="input textarea"
              name="description"
              maxLength={1000}
              placeholder="Describe the work, quantity, size, or delivery needs"
              value={form.description}
              onChange={handleChange}
              rows={4}
            />
          </label>

          <label className="field">
            <span className="label">Preferred date</span>
            <input
              className="input"
              name="preferredDate"
              type="date"
              min={today}
              value={form.preferredDate}
              onChange={handleChange}
            />
          </label>

          <div className="buttonRow">
            <button type="button" className="btn btnGhost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btnPrimary" disabled={submitting}>
              {submitting ? "Sending..." : "Send request"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
