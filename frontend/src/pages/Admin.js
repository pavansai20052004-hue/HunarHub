import { useEffect, useState } from "react";
import api from "./api";

export default function Admin() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/entrepreneurs/pending");
      setPending(res.data || []);
    } catch (err) {
      alert(err?.response?.data?.message || "Error fetching pending list");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const approve = async (id) => {
    try {
      await api.patch(`/admin/entrepreneurs/${id}/approve`);
      alert("Approved ✅");
      fetchPending();
    } catch (err) {
      alert(err?.response?.data?.message || "Approve failed");
      console.log(err);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="container">
      <div className="card">
        <div className="cardHeader">
          <h2 className="cardTitle">Admin Dashboard</h2>
          <p className="cardSub">Approve entrepreneur profiles.</p>
        </div>

        <div className="cardBody">

          {/* KPI */}
          <div className="row">
            <div className="kpi">
              <div className="kpiLabel">Pending Approvals</div>
              <div className="kpiValue">{pending.length}</div>
            </div>

            <button className="btn" onClick={fetchPending}>
              Refresh
            </button>
          </div>

          <hr className="hr" />

          {loading ? (
            <p>Loading...</p>
          ) : pending.length === 0 ? (
            <p className="small">No pending entrepreneurs.</p>
          ) : (
            <div className="tableCard">
              <div className="tableHead">
                <div>Name</div>
                <div>Email</div>
                <div>Location</div>
                <div>Category</div>
                <div>Action</div>
              </div>

              {pending.map((p) => (
                <div key={p._id} className="tableRow">
                  <div>{p.user?.name}</div>
                  <div>{p.user?.email}</div>
                  <div>{p.user?.location}</div>
                  <div>{p.category}</div>
                  <div>
                    <button
                      className="btn btnSuccess"
                      onClick={() => approve(p._id)}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}