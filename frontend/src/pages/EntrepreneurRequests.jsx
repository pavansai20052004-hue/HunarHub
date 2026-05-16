import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatDate, statusBadgeClass, titleCase } from "../utils/formatters";
import api from "./api";

export default function EntrepreneurRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/requests/entrepreneur");
      setRequests(data || []);
    } catch (err) {
      setError(err.userMessage || err?.response?.data?.message || "Unable to fetch requests.");
      if (err?.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    setError("");

    try {
      await api.patch(`/requests/${id}/status`, { status });
      await fetchRequests();
    } catch (err) {
      setError(err.userMessage || err?.response?.data?.message || "Unable to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === "pending").length,
    [requests]
  );

  return (
    <main className="container pageStack">
      <section className="pageHeader">
        <div>
          <p className="eyebrow">Entrepreneur</p>
          <h1>Requests received</h1>
          <p>Accept, reject, and complete customer requests from your studio.</p>
        </div>
        <Link className="btn btnGhost" to="/entrepreneur/profile">
          Profile
        </Link>
      </section>

      <section className="metricGrid">
        <article className="metricCard">
          <span>Total requests</span>
          <strong>{requests.length}</strong>
        </article>
        <article className="metricCard">
          <span>Pending</span>
          <strong>{pendingCount}</strong>
        </article>
        <article className="metricCard">
          <span>Completed</span>
          <strong>{requests.filter((request) => request.status === "completed").length}</strong>
        </article>
      </section>

      <section className="panel">
        <div className="sectionHeader rowBetween">
          <div>
            <p className="eyebrow">Inbox</p>
            <h2>Customer work</h2>
          </div>
          <button className="btn btnGhost" onClick={fetchRequests} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && <div className="notice noticeError">{error}</div>}

        {loading ? (
          <div className="emptyState">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="emptyState">No requests yet.</div>
        ) : (
          <div className="requestList">
            {requests.map((request) => (
              <article key={request._id} className="requestCard">
                <div className="requestTitle">
                  <div>
                    <h3>{request.serviceType}</h3>
                    <p>{request.description || "No description added."}</p>
                  </div>
                  <span className={statusBadgeClass(request.status)}>{titleCase(request.status)}</span>
                </div>

                <div className="requestMeta">
                  <span>Customer: {request.customer?.name || "Customer"}</span>
                  <span>Email: {request.customer?.email || "Unavailable"}</span>
                  <span>Preferred: {formatDate(request.preferredDate)}</span>
                </div>

                {request.status === "pending" && (
                  <div className="buttonRow">
                    <button
                      className="btn btnSuccess"
                      onClick={() => updateStatus(request._id, "accepted")}
                      disabled={updatingId === request._id}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btnDanger"
                      onClick={() => updateStatus(request._id, "rejected")}
                      disabled={updatingId === request._id}
                    >
                      Reject
                    </button>
                  </div>
                )}

                {request.status === "accepted" && (
                  <button
                    className="btn btnPrimary"
                    onClick={() => updateStatus(request._id, "completed")}
                    disabled={updatingId === request._id}
                  >
                    Mark completed
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
