export default function Home() {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  return (
    <div className="container">
      <div className="grid grid2">
        <div className="card">
          <div className="cardHeader">
            <h2 className="cardTitle">Welcome to HunarHub</h2>
            <p className="cardSub">A clean marketplace workflow: Customer → Request → Entrepreneur → Status updates.</p>
          </div>
          <div className="cardBody">
            <div className="row">
              <div className="kpi">
                <div className="kpiLabel">Current user</div>
                <div className="kpiValue">{user?.name || "—"}</div>
              </div>
              <div className="kpi">
                <div className="kpiLabel">Role</div>
                <div className="kpiValue">{user?.role || "—"}</div>
              </div>
              <div className="kpi">
                <div className="kpiLabel">Status</div>
                <div className="kpiValue">{user ? "Logged in" : "Guest"}</div>
              </div>
            </div>

            <hr className="hr" />

            <p className="small">
              Tip: Use the navbar links to navigate. UI is now structured with cards, badges, and role-based actions.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="cardHeader">
            <h3 className="cardTitle">Project Flow</h3>
            <p className="cardSub">What you built ✅</p>
          </div>
          <div className="cardBody">
            <div className="badge bAccepted">✅ Auth & Roles</div>{" "}
            <div className="badge bAccepted">✅ Admin Approvals</div>{" "}
            <div className="badge bAccepted">✅ Requests Workflow</div>
            <hr className="hr" />
            <p className="small">
              Next polish: add search/filter for entrepreneurs and better form fields for service request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}