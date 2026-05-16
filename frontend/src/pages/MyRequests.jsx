import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatDate, statusBadgeClass, titleCase } from "../utils/formatters";
import api from "./api";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchRequests = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/requests/my");
      setRequests(data || []);
    } catch (err) {
      setError(err.userMessage || err?.response?.data?.message || "Unable to fetch requests.");
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = async (id) => {
    setUpdatingId(id);
    setError("");
    setNotice("");

    try {
      await api.patch(`/requests/${id}/cancel`);
      setNotice("Request cancelled.");
      await fetchRequests();
    } catch (err) {
      setError(err.userMessage || err?.response?.data?.message || "Unable to cancel request.");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <main className="container pageStack">
      <section className="pageHeader">
        <div>
          <p className="eyebrow">Customer</p>
          <h1>My service requests</h1>
          <p>Track request status, preferred dates, and entrepreneur details.</p>
        </div>
        <Link className="btn btnPrimary" to="/customer">
          Explore more
        </Link>
      </section>

      <section className="panel">
        <div className="sectionHeader rowBetween">
          <div>
            <p className="eyebrow">Requests</p>
            <h2>{requests.length} total</h2>
          </div>
          <button className="btn btnGhost" onClick={fetchRequests} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {(error || notice) && (
          <div className={error ? "notice noticeError" : "notice noticeSuccess"}>{error || notice}</div>
        )}

        {loading ? (
          <div className="emptyState">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="emptyState">No requests yet.</div>
        ) : (
          <div className="requestList">
            {requests.map((request) => (
              <article key={request._id} className="requestCard">
                <div>
                  <div className="requestTitle">
                    <h3>{request.serviceType}</h3>
                    <span className={statusBadgeClass(request.status)}>{titleCase(request.status)}</span>
                  </div>
                  <p>{request.description || "No description added."}</p>
                </div>

                <div className="requestMeta">
                  <span>Entrepreneur: {request.entrepreneur?.user?.name || "Unavailable"}</span>
                  <span>Location: {request.entrepreneur?.user?.location || "Unavailable"}</span>
                  <span>Preferred: {formatDate(request.preferredDate)}</span>
                </div>

                {request.status === "pending" && (
                  <div className="buttonRow">
                    <button
                      className="btn btnGhost"
                      onClick={() => cancelRequest(request._id)}
                      disabled={updatingId === request._id}
                    >
                      {updatingId === request._id ? "Cancelling..." : "Cancel request"}
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
