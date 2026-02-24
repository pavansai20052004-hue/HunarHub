import { useEffect, useState } from "react";
import api from "./api";

export default function EntrepreneurProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    category: "tailor",
    bio: "",
    experienceYears: 0,
    minPrice: 0,
    maxPrice: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get("/entrepreneurs/me");
      setProfile(res.data);

      setForm({
        category: res.data.category || "tailor",
        bio: res.data.bio || "",
        experienceYears: res.data.experienceYears || 0,
        minPrice: res.data.minPrice || 0,
        maxPrice: res.data.maxPrice || 0,
      });
    } catch (err) {
      // if not found -> show form for create
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/entrepreneurs", {
        ...form,
        experienceYears: Number(form.experienceYears),
        minPrice: Number(form.minPrice),
        maxPrice: Number(form.maxPrice),
      });

      alert(res.data.message || "Saved ✅");
      await loadProfile();
    } catch (err) {
      alert(err?.response?.data?.message || "Save failed");
    }
  };

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h2>Entrepreneur Profile</h2>

      {profile ? (
        <p>
          <b>Approval:</b> {profile.isApproved ? "✅ Approved" : "⏳ Pending Approval"}
        </p>
      ) : (
        <p><b>Status:</b> Profile not created yet. Create now 👇</p>
      )}

      <form onSubmit={saveProfile} style={{ maxWidth: 400 }}>
        <label>Category</label>
        <select name="category" value={form.category} onChange={onChange}>
          <option value="cobbler">cobbler</option>
          <option value="potter">potter</option>
          <option value="tailor">tailor</option>
          <option value="artisan">artisan</option>
          <option value="vendor">vendor</option>
        </select>

        <br /><br />

        <label>Bio</label>
        <textarea name="bio" value={form.bio} onChange={onChange} />

        <br /><br />

        <label>Experience (years)</label>
        <input name="experienceYears" type="number" value={form.experienceYears} onChange={onChange} />

        <br /><br />

        <label>Min Price</label>
        <input name="minPrice" type="number" value={form.minPrice} onChange={onChange} />

        <br /><br />

        <label>Max Price</label>
        <input name="maxPrice" type="number" value={form.maxPrice} onChange={onChange} />

        <br /><br />

        <button type="submit">{profile ? "Update Profile" : "Create Profile"}</button>
      </form>
    </div>
  );
}