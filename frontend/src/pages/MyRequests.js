import { useEffect, useState } from "react";
import api from "./api";

export default function MyRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/requests/my");
      setRequests(res.data);
    } catch (err) {
      alert("Error fetching requests");
      console.log(err);
    }
  };

  const statusBadgeClass = (s) => {
  if (s === "pending") return "badge bPending";
  if (s === "accepted") return "badge bAccepted";
  if (s === "rejected") return "badge bRejected";
  if (s === "completed") return "badge bCompleted";
  return "badge";
};

  return (
    <div style={{ padding: 20 }}>
      <h2>My Service Requests</h2>

      {requests.length === 0 && <p>No requests yet.</p>}

      {requests.map((r) => (
        <div key={r._id} style={{ border: "1px solid gray", padding: 10, margin: 10 }}>
          <p><b>Entrepreneur:</b> {r.entrepreneur?.user?.name}</p>
          <p><b>Service:</b> {r.serviceType}</p>
          <p><b>Description:</b> {r.description}</p>
          <p>
  <b>Status:</b>{" "}
  <span className={statusBadgeClass(r.status)}>
    {r.status}
  </span>
</p>
        </div>
      ))}
    </div>
  );
}