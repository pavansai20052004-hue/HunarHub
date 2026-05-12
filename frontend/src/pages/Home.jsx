import { Link } from "react-router-dom";
import { getStoredUser } from "../utils/session";
import { titleCase } from "../utils/formatters";

const roleActions = {
  customer: [
    { label: "Explore entrepreneurs", to: "/customer", tone: "accent" },
    { label: "Track requests", to: "/my-requests", tone: "light" },
  ],
  entrepreneur: [
    { label: "Open studio", to: "/entrepreneur", tone: "accent" },
    { label: "Edit profile", to: "/entrepreneur/profile", tone: "light" },
    { label: "Review requests", to: "/entrepreneur/requests", tone: "light" },
  ],
  admin: [{ label: "Review approvals", to: "/admin", tone: "accent" }],
};

export default function Home() {
  const user = getStoredUser();
  const actions = roleActions[user?.role] || [];

  return (
    <main className="container pageStack">
      <section className="heroBand">
        <div>
          <p className="eyebrow">HunarHub Workspace</p>
          <h1>{user?.name ? `Good to see you, ${user.name}` : "Welcome to HunarHub"}</h1>
          <p>
            A focused marketplace for local services, request handling, approvals, and entrepreneur profiles.
          </p>
        </div>
        <div className="heroStat">
          <span>Role</span>
          <strong>{titleCase(user?.role)}</strong>
        </div>
      </section>

      <section className="metricGrid">
        <article className="metricCard">
          <span>Account</span>
          <strong>{user?.name || "User"}</strong>
        </article>
        <article className="metricCard">
          <span>Location</span>
          <strong>{user?.location || "Not set"}</strong>
        </article>
        <article className="metricCard">
          <span>Session</span>
          <strong>Active</strong>
        </article>
      </section>

      <section className="panel">
        <div className="sectionHeader rowBetween">
          <div>
            <p className="eyebrow">Next actions</p>
            <h2>Your workspace</h2>
          </div>
        </div>

        <div className="actionGrid">
          {actions.map((action) => (
            <Link
              key={action.to}
              className={action.tone === "accent" ? "actionTile actionTileAccent" : "actionTile"}
              to={action.to}
            >
              <span>{action.label}</span>
              <strong>Open</strong>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
