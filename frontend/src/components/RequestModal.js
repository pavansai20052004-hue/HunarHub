import { useState } from "react";

export default function RequestModal({ open, onClose, onSubmit, entrepreneur }) {
  const [form, setForm] = useState({
    serviceType: "",
    description: "",
    preferredDate: "",
  });

  if (!open) return null;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.55)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 18,
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: "100%", maxWidth: 520 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cardHeader">
          <h3 className="cardTitle">Send Request</h3>
          <p className="cardSub">
            To: <b>{entrepreneur?.user?.name}</b> • {entrepreneur?.category}
          </p>
        </div>

        <div className="cardBody">
          <form onSubmit={submit}>
            <div className="field">
              <div className="label">Service Type</div>
              <input
                className="input"
                name="serviceType"
                placeholder="Eg: Stitching, Repair, Pot making..."
                value={form.serviceType}
                onChange={handleChange}
                required
              />
            </div>

            <div className="field">
              <div className="label">Description</div>
              <textarea
                className="input"
                name="description"
                placeholder="Describe what you need..."
                value={form.description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="field">
              <div className="label">Preferred Date</div>
              <input
                className="input"
                name="preferredDate"
                type="date"
                value={form.preferredDate}
                onChange={handleChange}
              />
            </div>

            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button type="button" className="btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn btnPrimary">
                Send
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}