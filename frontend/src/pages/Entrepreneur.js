import { useEffect, useState } from "react";
import api from "./api";
import { useNavigate } from "react-router-dom";

export default function Entrepreneur() {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await api.get("/requests/entrepreneur");
      setRequests(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/requests/${id}/status`, { status });
      alert(`Request ${status} ✅`);
      fetchRequests();
    } catch (err) {
      alert("Error updating status");
      console.log(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Incoming Service Requests 👇</h2>

      {requests.length === 0 && <p>No requests yet.</p>}

      {requests.map((r) => (
        <div key={r._id} style={{ border: "1px solid gray", padding: 10, margin: 10 }}>
          <p><b>Customer:</b> {r.customer?.name}</p>
          <p><b>Service:</b> {r.serviceType}</p>
          <p><b>Description:</b> {r.description}</p>
          <p><b>Status:</b> {r.status}</p>

          {r.status === "pending" && (
            <>
              <button onClick={() => updateStatus(r._id, "accepted")} style={{ marginRight: 10 }}>
                Accept
              </button>

              <button onClick={() => updateStatus(r._id, "rejected")}>
                Reject
              </button>
              <button onClick={() => navigate("/entrepreneur/requests")}>
  View Requests
</button>
            </>
          )}
        </div>
      ))}
    </div>
  );
}