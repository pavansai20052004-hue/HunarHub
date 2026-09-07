import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import RequestModal from "../components/RequestModal";
import { categories, formatCurrency, titleCase } from "../utils/formatters";
import api from "./api";

export default function Customer() {
  const navigate = useNavigate();
  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingId, setSubmittingId] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [category, setCategory] = useState("all");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchEntrepreneurs = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/entrepreneurs");
      setEntrepreneurs(data || []);
    } catch (err) {
      setError(err.userMessage || err?.response?.data?.message || "Unable to load entrepreneurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntrepreneurs();
  }, []);

  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase();
    const locationText = location.trim().toLowerCase();
    const budget = Number(maxBudget);

    return entrepreneurs.filter((entrepreneur) => {
      const haystack = [
        entrepreneur.user?.name,
        entrepreneur.category,
        entrepreneur.user?.location,
        entrepreneur.bio,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesText = !text || haystack.includes(text);
      const matchesCategory = category === "all" || entrepreneur.category === category;
      const matchesLocation =
        !locationText || (entrepreneur.user?.location || "").toLowerCase().includes(locationText);
      const matchesBudget =
        !maxBudget || (Number.isFinite(budget) && Number(entrepreneur.minPrice) <= budget);

      return matchesText && matchesCategory && matchesLocation && matchesBudget;
    });
  }, [entrepreneurs, query, category, location, maxBudget]);

  const openModal = (entrepreneur) => {
    setError("");
    setSelected(entrepreneur);
    setOpen(true);
  };

  const submitRequest = async (form) => {
    if (!selected?._id) return;

    setSubmittingId(selected._id);
    setError("");

    try {
      await api.post("/requests", {
        entrepreneurId: selected._id,
        serviceType: form.serviceType,
        description: form.description,
        preferredDate: form.preferredDate,
      });

      setOpen(false);
      setSelected(null);
      navigate("/my-requests");
    } catch (err) {
      setError(err.userMessage || err?.response?.data?.message || "Unable to send request.");
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <main className="container pageStack">
      <section className="pageHeader">
        <div>
          <p className="eyebrow">Customer</p>
          <h1>Explore entrepreneurs</h1>
          <p>Find approved local experts by category, location, price, or profile details.</p>
        </div>
        <button className="btn btnPrimary" onClick={() => navigate("/my-requests")}>
          My requests
        </button>
      </section>

      <section className="metricGrid">
        <article className="metricCard">
          <span>Approved profiles</span>
          <strong>{entrepreneurs.length}</strong>
        </article>
        <article className="metricCard">
          <span>Visible matches</span>
          <strong>{filtered.length}</strong>
        </article>
        <article className="metricCard">
          <span>Category</span>
          <strong>{category === "all" ? "All" : titleCase(category)}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="toolbar">
          <label className="field toolbarSearch">
            <span className="label">Search</span>
            <input
              className="input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, category, location..."
            />
          </label>

          <label className="field toolbarSelect">
            <span className="label">Category</span>
            <select className="input select" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {titleCase(item)}
                </option>
              ))}
            </select>
          </label>

          <label className="field toolbarSelect">
            <span className="label">Location</span>
            <input
              className="input"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Area or city"
            />
          </label>

          <label className="field toolbarSelect">
            <span className="label">Max budget</span>
            <input
              className="input"
              value={maxBudget}
              min="0"
              onChange={(event) => setMaxBudget(event.target.value)}
              placeholder="INR"
              type="number"
            />
          </label>

          <button className="btn btnGhost" onClick={fetchEntrepreneurs} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && <div className="notice noticeError">{error}</div>}

        {loading ? (
          <div className="emptyState">Loading entrepreneurs...</div>
        ) : filtered.length === 0 ? (
          <div className="emptyState">No entrepreneurs match the current filters.</div>
        ) : (
          <div className="profileGrid">
            {filtered.map((entrepreneur) => (
              <article key={entrepreneur._id} className="profileCard">
                <div className="profileTop">
                  <div className="avatar avatarLarge">
                    {entrepreneur.user?.name?.charAt(0)?.toUpperCase() || "E"}
                  </div>
                  <div>
                    <h3>{entrepreneur.user?.name || "Entrepreneur"}</h3>
                    <p>{entrepreneur.user?.location || "Location unavailable"}</p>
                  </div>
                </div>

                <div className="profileMeta">
                  <span className="badge badgeInfo">{titleCase(entrepreneur.category)}</span>
                  <span>{entrepreneur.experienceYears || 0} yrs experience</span>
                </div>

                <p className="profileBio">{entrepreneur.bio || "Profile details will appear here once updated."}</p>

                <div className="priceBand">
                  <span>Starting range</span>
                  <strong>
                    {formatCurrency(entrepreneur.minPrice)} - {formatCurrency(entrepreneur.maxPrice)}
                  </strong>
                </div>

                <button
                  className="btn btnPrimary btnWide"
                  onClick={() => openModal(entrepreneur)}
                  disabled={submittingId === entrepreneur._id}
                >
                  {submittingId === entrepreneur._id ? "Sending..." : "Send request"}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>

      <RequestModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={submitRequest}
        entrepreneur={selected}
        submitting={Boolean(submittingId)}
        error={error}
      />
    </main>
  );
}
