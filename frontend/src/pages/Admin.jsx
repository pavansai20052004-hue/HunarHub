import { useEffect, useState } from "react";
import { titleCase } from "../utils/formatters";
import api from "./api";

export default function Admin() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/admin/entrepreneurs/pending");
      setPending(data || []);
    } catch (err) {
      setError(err.userMessage || err?.response?.data?.message || "Unable to fetch pending profiles.");
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    setApprovingId(id);
    setError("");
    setNotice("");

    try {
      await api.patch(`/admin/entrepreneurs/${id}/approve`);
      setNotice("Entrepreneur approved.");
      await fetchPending();
    } catch (err) {
      setError(err.userMessage || err?.response?.data?.message || "Approval failed.");
    } finally {
      setApprovingId(null);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <main className="container pageStack">
      <section className="pageHeader">
        <div>
          <p className="eyebrow">Admin</p>
          <h1>Approval queue</h1>
          <p>Review entrepreneur profiles before they become visible to customers.</p>
        </div>
        <button className="btn btnGhost" onClick={fetchPending} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </section>

      <section className="metricGrid">
        <article className="metricCard">
          <span>Pending approvals</span>
          <strong>{pending.length}</strong>
        </article>
        <article className="metricCard">
          <span>Status</span>
          <strong>{loading ? "Syncing" : "Current"}</strong>
        </article>
        <article className="metricCard">
          <span>Access</span>
          <strong>Admin</strong>
        </article>
      </section>

      {(error || notice) && (
        <div className={error ? "notice noticeError" : "notice noticeSuccess"}>{error || notice}</div>
      )}

      <section className="panel">
        <div className="sectionHeader">
          <p className="eyebrow">Entrepreneurs</p>
          <h2>Pending profiles</h2>
        </div>

        {loading ? (
          <div className="emptyState">Loading approvals...</div>
        ) : pending.length === 0 ? (
          <div className="emptyState">No pending entrepreneurs.</div>
        ) : (
          <div className="tableCard">
            <div className="tableHead adminTable">
              <span>Name</span>
              <span>Email</span>
              <span>Location</span>
              <span>Category</span>
              <span>Action</span>
            </div>

            {pending.map((profile) => (
              <div key={profile._id} className="tableRow adminTable">
                <span>{profile.user?.name || "Unavailable"}</span>
                <span>{profile.user?.email || "Unavailable"}</span>
                <span>{profile.user?.location || "Unavailable"}</span>
                <span>{titleCase(profile.category)}</span>
                <span>
                  <button
                    className="btn btnSuccess"
                    onClick={() => approve(profile._id)}
                    disabled={approvingId === profile._id}
                  >
                    {approvingId === profile._id ? "Approving..." : "Approve"}
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
