import { useEffect, useState } from "react";
import { categories, formatCurrency, titleCase } from "../utils/formatters";
import api from "./api";

const defaultForm = {
  category: "tailor",
  bio: "",
  experienceYears: 0,
  minPrice: 0,
  maxPrice: 0,
};

export default function EntrepreneurProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const loadProfile = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await api.get("/entrepreneurs/me");
      setProfile(data);
      setForm({
        category: data.category || "tailor",
        bio: data.bio || "",
        experienceYears: data.experienceYears || 0,
        minPrice: data.minPrice || 0,
        maxPrice: data.maxPrice || 0,
      });
    } catch (err) {
      if (err?.response?.status !== 404) {
        setError(err?.response?.data?.message || "Unable to load profile.");
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setNotice("");
    setError("");
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice("");
    setError("");

    const payload = {
      ...form,
      bio: form.bio.trim(),
      experienceYears: Number(form.experienceYears),
      minPrice: Number(form.minPrice),
      maxPrice: Number(form.maxPrice),
    };

    if (payload.maxPrice < payload.minPrice) {
      setSaving(false);
      setError("Max price must be greater than or equal to min price.");
      return;
    }

    try {
      const { data } = await api.post("/entrepreneurs", payload);
      setNotice(data.message || "Profile saved.");
      await loadProfile();
    } catch (err) {
      setError(err?.response?.data?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="container pageStack">
        <section className="card emptyState">Loading profile...</section>
      </main>
    );
  }

  return (
    <main className="container pageStack">
      <section className="pageHeader">
        <div>
          <p className="eyebrow">Entrepreneur</p>
          <h1>Service profile</h1>
          <p>Keep your category, bio, experience, and price range ready for approval.</p>
        </div>
        <span className={profile?.isApproved ? "badge badgeSuccess" : "badge badgeWarning"}>
          {profile?.isApproved ? "Approved" : "Pending approval"}
        </span>
      </section>

      {(notice || error) && (
        <div className={error ? "notice noticeError" : "notice noticeSuccess"}>{error || notice}</div>
      )}

      <section className="splitGrid">
        <article className="card">
          <div className="sectionHeader">
            <p className="eyebrow">Profile form</p>
            <h2>{profile ? "Update details" : "Create profile"}</h2>
          </div>

          <form onSubmit={saveProfile} className="formStack">
            <label className="field">
              <span className="label">Category</span>
              <select className="input select" name="category" value={form.category} onChange={onChange}>
                {categories.map((item) => (
                  <option key={item} value={item}>
                    {titleCase(item)}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span className="label">Bio</span>
              <textarea
                className="input textarea"
                name="bio"
                value={form.bio}
                onChange={onChange}
                placeholder="Short profile customers will see"
                rows={5}
              />
            </label>

            <div className="formGrid">
              <label className="field">
                <span className="label">Experience years</span>
                <input
                  className="input"
                  name="experienceYears"
                  type="number"
                  min="0"
                  value={form.experienceYears}
                  onChange={onChange}
                />
              </label>

              <label className="field">
                <span className="label">Min price</span>
                <input
                  className="input"
                  name="minPrice"
                  type="number"
                  min="0"
                  value={form.minPrice}
                  onChange={onChange}
                />
              </label>

              <label className="field">
                <span className="label">Max price</span>
                <input
                  className="input"
                  name="maxPrice"
                  type="number"
                  min="0"
                  value={form.maxPrice}
                  onChange={onChange}
                />
              </label>
            </div>

            <button type="submit" className="btn btnPrimary" disabled={saving}>
              {saving ? "Saving..." : profile ? "Update profile" : "Create profile"}
            </button>
          </form>
        </article>

        <aside className="card previewCard">
          <div className="sectionHeader">
            <p className="eyebrow">Customer preview</p>
            <h2>{titleCase(form.category)}</h2>
            <p>{form.bio || "Your profile summary appears here."}</p>
          </div>
          <div className="detailGrid">
            <div>
              <span>Experience</span>
              <strong>{Number(form.experienceYears) || 0} years</strong>
            </div>
            <div>
              <span>Price range</span>
              <strong>
                {formatCurrency(form.minPrice)} - {formatCurrency(form.maxPrice)}
              </strong>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
