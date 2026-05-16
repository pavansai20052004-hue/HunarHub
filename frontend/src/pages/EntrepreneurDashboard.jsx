import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { formatCurrency, statusBadgeClass, titleCase } from "../utils/formatters";
import api from "./api";

export default function EntrepreneurDashboard() {
  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const [profileResult, requestsResult] = await Promise.allSettled([
        api.get("/entrepreneurs/me"),
        api.get("/requests/entrepreneur"),
      ]);

      if (profileResult.status === "fulfilled") {
        setProfile(profileResult.value.data);
      } else if (profileResult.reason?.response?.status !== 404) {
        setError(
          profileResult.reason?.userMessage ||
            profileResult.reason?.response?.data?.message ||
            "Unable to load profile."
        );
      }

      if (requestsResult.status === "fulfilled") {
        setRequests(requestsResult.value.data || []);
      } else if (requestsResult.reason?.response?.status !== 404) {
        setError(
          requestsResult.reason?.userMessage ||
            requestsResult.reason?.response?.data?.message ||
            "Unable to load requests."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const pendingCount = useMemo(
    () => requests.filter((request) => request.status === "pending").length,
    [requests]
  );

  return (
    <main className="container pageStack">
      <section className="pageHeader">
        <div>
          <p className="eyebrow">Entrepreneur studio</p>
          <h1>Work dashboard</h1>
          <p>Profile readiness, incoming requests, and service range in one place.</p>
        </div>
        <div className="buttonRow">
          <Link className="btn btnGhost" to="/entrepreneur/profile">
            Edit profile
          </Link>
          <Link className="btn btnPrimary" to="/entrepreneur/requests">
            View requests
          </Link>
        </div>
      </section>

      {error && <div className="notice noticeError">{error}</div>}

      <section className="metricGrid">
        <article className="metricCard">
          <span>Approval</span>
          <strong>{profile?.isApproved ? "Approved" : "Pending"}</strong>
        </article>
        <article className="metricCard">
          <span>Incoming requests</span>
          <strong>{requests.length}</strong>
        </article>
        <article className="metricCard">
          <span>Pending decisions</span>
          <strong>{pendingCount}</strong>
        </article>
      </section>

      {loading ? (
        <section className="card emptyState">Loading studio...</section>
      ) : (
        <section className="splitGrid">
          <article className="card">
            <div className="sectionHeader">
              <p className="eyebrow">Profile</p>
              <h2>{profile ? titleCase(profile.category) : "Create your profile"}</h2>
              <p>{profile?.bio || "Add a profile so customers can discover your services."}</p>
            </div>

            {profile && (
              <div className="detailGrid">
                <div>
                  <span>Experience</span>
                  <strong>{profile.experienceYears || 0} years</strong>
                </div>
                <div>
                  <span>Price range</span>
                  <strong>
                    {formatCurrency(profile.minPrice)} - {formatCurrency(profile.maxPrice)}
                  </strong>
                </div>
              </div>
            )}
          </article>

          <article className="card">
            <div className="sectionHeader">
              <p className="eyebrow">Latest requests</p>
              <h2>Recent activity</h2>
            </div>

            {requests.slice(0, 3).length === 0 ? (
              <div className="emptyState compact">No incoming requests yet.</div>
            ) : (
              <div className="requestList compact">
                {requests.slice(0, 3).map((request) => (
                  <div key={request._id} className="miniRequest">
                    <div>
                      <strong>{request.serviceType}</strong>
                      <span>{request.customer?.name || "Customer"}</span>
                    </div>
                    <span className={statusBadgeClass(request.status)}>{titleCase(request.status)}</span>
                  </div>
                ))}
              </div>
            )}
          </article>
        </section>
      )}
    </main>
  );
}
