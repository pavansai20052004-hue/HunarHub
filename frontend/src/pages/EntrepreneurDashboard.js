import { Link } from "react-router-dom";

export default function EntrepreneurDashboard() {
  return (
    <div style={{ padding: 20 }}>
      <h2>Entrepreneur Dashboard</h2>

      <Link to="/entrepreneur/requests">View Requests</Link>
    </div>
  );
}