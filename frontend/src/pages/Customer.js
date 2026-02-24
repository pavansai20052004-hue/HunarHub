import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import RequestModal from "../components/RequestModal";

export default function Customer() {
  const navigate = useNavigate();

  const [entrepreneurs, setEntrepreneurs] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("all");

  // modal state
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchEntrepreneurs();
  }, []);

  const fetchEntrepreneurs = async () => {
    try {
      const res = await api.get("/entrepreneurs");
      setEntrepreneurs(res.data || []);
    } catch (err) {
      alert(err?.response?.data?.message || "Error loading entrepreneurs");
      console.log(err);
    }
  };

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    return entrepreneurs.filter((e) => {
      const matchesText =
        !text ||
        (e.user?.name || "").toLowerCase().includes(text) ||
        (e.category || "").toLowerCase().includes(text) ||
        (e.user?.location || "").toLowerCase().includes(text);

      const matchesCategory = category === "all" || e.category === category;

      return matchesText && matchesCategory;
    });
  }, [entrepreneurs, q, category]);

  const openModal = (entrepreneur) => {
    setSelected(entrepreneur);
    setOpen(true);
  };

  const submitRequest = async (form) => {
    if (!selected?._id) return;

    try {
      setLoadingId(selected._id);

      await api.post("/requests", {
        entrepreneurId: selected._id,
        serviceType: form.serviceType,
        description: form.description,
        preferredDate: form.preferredDate,
      });

      alert("Request sent ✅");
      setOpen(false);
      setSelected(null);
      navigate("/my-requests");
    } catch (err) {
      alert(err?.response?.data?.message || "Error sending request");
      console.log(err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="container">
      <div className="grid grid2">
        <div className="card">
          <div className="cardHeader">
            <h2 className="cardTitle">Explore Entrepreneurs</h2>
            <p className="cardSub">Search, filter, and send service requests.</p>
          </div>

          <div className="cardBody">
            <div className="row" style={{ alignItems: "end" }}>
              <div style={{ flex: 1, minWidth: 220 }}>
                <div className="label">Search</div>
                <input
                  className="input"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search by name, category, location..."
                />
              </div>

              <div style={{ width: 220 }}>
                <div className="label">Category</div>
                <select
                  className="input select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="tailor">tailor</option>
                  <option value="cobbler">cobbler</option>
                  <option value="potter">potter</option>
                  <option value="artisan">artisan</option>
                  <option value="vendor">vendor</option>
                </select>
              </div>

              <button className="btn" onClick={fetchEntrepreneurs}>
                Refresh
              </button>

              <button
                className="btn btnPrimary"
                onClick={() => navigate("/my-requests")}
              >
                My Requests
              </button>
            </div>

            <hr className="hr" />

            {filtered.length === 0 ? (
              <p className="small">No entrepreneurs found.</p>
            ) : (
              <div
                className="grid"
                style={{
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                }}
              >
                {filtered.map((e) => (
                  <div key={e._id} className="card" style={{ boxShadow: "none" }}>
                    <div className="cardBody">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: 10,
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 18, fontWeight: 900 }}>
                            {e.user?.name}
                          </div>
                          <div className="small">{e.user?.location}</div>
                        </div>
                        <span className="badge">{e.category}</span>
                      </div>

                      <hr className="hr" />

                      <div className="small">
                        <div>
                          <b>Experience:</b> {e.experienceYears} years
                        </div>
                        <div>
                          <b>Price:</b> ₹{e.minPrice} - ₹{e.maxPrice}
                        </div>
                      </div>

                      <div style={{ marginTop: 14 }}>
                        <button
                          className="btn btnPrimary"
                          style={{ width: "100%" }}
                          onClick={() => openModal(e)}
                          disabled={loadingId === e._id}
                        >
                          {loadingId === e._id ? "Sending..." : "Send Request"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="cardHeader">
            <h3 className="cardTitle">Tips</h3>
            <p className="cardSub">Use search + filters to find best match.</p>
          </div>
          <div className="cardBody">
            <div className="kpi">
              <div className="kpiLabel">Total Approved Entrepreneurs</div>
              <div className="kpiValue">{entrepreneurs.length}</div>
            </div>

            <hr className="hr" />

            <div className="small">
              Send a request → entrepreneur accepts/rejects → status updates in
              “My Requests”.
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <RequestModal
        open={open}
        onClose={() => setOpen(false)}
        onSubmit={submitRequest}
        entrepreneur={selected}
      />
    </div>
  );
}