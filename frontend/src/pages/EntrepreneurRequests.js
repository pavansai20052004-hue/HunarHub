import { useEffect, useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

export default function EntrepreneurRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/requests/entrepreneur");
      setRequests(res.data || []);
    } catch (err) {
      alert(err?.response?.data?.message || "Error fetching entrepreneur requests");
      console.log(err);
      // if token missing/invalid
      if (err?.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/requests/${id}/status`, { status });
      alert(`Request ${status} ✅`);
      fetchRequests(); // refresh
    } catch (err) {
      alert(err?.response?.data?.message || "Error updating status");
      console.log(err);
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  const statusBadgeClass = (s) => {
  if (s === "pending") return "badge bPending";
  if (s === "accepted") return "badge bAccepted";
  if (s === "rejected") return "badge bRejected";
  if (s === "completed") return "badge bCompleted";
  return "badge";
};

  return (
    <div style={{ padding: 20 }}>
      <h2>Requests Received</h2>

      {requests.length === 0 && <p>No requests yet.</p>}

      {requests.map((r) => (
        <div
          key={r._id}
          style={{ border: "1px solid gray", padding: 12, margin: "12px 0" }}
        >
          <p><b>Customer:</b> {r.customer?.name} ({r.customer?.email})</p>
          <p><b>Service:</b> {r.serviceType}</p>
          <p><b>Description:</b> {r.description}</p>
          <p><b>Preferred Date:</b> {r.preferredDate}</p>
         <p>
  <b>Status:</b>{" "}
  <span className={statusBadgeClass(r.status)}>
    {r.status}
  </span>
</p>

          {/* Buttons based on status */}
          {r.status === "pending" && (
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => updateStatus(r._id, "accepted")}>
                Accept
              </button>
              <button onClick={() => updateStatus(r._id, "rejected")}>
                Reject
              </button>
            </div>
          )}

          {r.status === "accepted" && (
            <button onClick={() => updateStatus(r._id, "completed")}>
              Complete
            </button>
          )}
        </div>
      ))}
    </div>
  );
}