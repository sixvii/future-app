import { motion } from "framer-motion";
import { ArrowLeft, User, Phone, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, refreshProfile, updateProfile } = useAuth();
  const [lettersSentCount, setLettersSentCount] = useState(0);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("prefer-not");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        await refreshProfile();
      } catch {
        navigate("/login", { replace: true });
      }

      try {
        const sentLetters = await apiRequest<Array<{ _id: string }>>("/api/letters/sent");
        setLettersSentCount(sentLetters.length);
      } catch {
        setLettersSentCount(0);
      }
    };

    loadProfileData();
  }, [navigate]);

  useEffect(() => {
    setName(user?.name || "");
    setGender(user?.gender || "prefer-not");
  }, [user]);

  const initials = useMemo(
    () => (user?.name?.trim().charAt(0) || user?.phone?.charAt(0) || "U").toUpperCase(),
    [user],
  );

  const memberSince = useMemo(() => {
    return new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  }, []);

  const handleSave = async () => {
    if (!name.trim()) {
      toast({ title: "Name is required" });
      return;
    }

    try {
      setSaving(true);
      await updateProfile(name.trim(), gender);
      toast({ title: "Profile updated" });
    } catch (error) {
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Could not update profile",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-5xl mx-auto px-5 pt-14 w-full flex-1 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-card flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-foreground" />
          </button>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-3">
            <span className="text-primary text-3xl font-bold">{initials}</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground">{user?.name || "User"}</h2>
          <p className="text-sm text-muted-foreground">Member since {memberSince}</p>
        </motion.div>

        <div className="flex flex-col gap-3">
          {[
            { icon: User, label: "Name", value: user?.name || "-" },
            { icon: Phone, label: "Phone", value: user?.phone || "-" },
            { icon: Mail, label: "Letters Sent", value: String(lettersSentCount) },
          ].map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="bg-card rounded-lg p-4 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                <item.icon size={16} className="text-foreground" />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <p className="text-[15px] text-foreground font-medium">{item.value}</p>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-lg p-4"
          >
            <label className="text-xs text-muted-foreground block mb-2">Edit Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-secondary rounded-lg px-3 py-2 text-[15px] text-foreground outline-none"
              placeholder="Your name"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-lg p-4"
          >
            <label className="text-xs text-muted-foreground block mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full bg-secondary rounded-lg px-3 py-2 text-[15px] text-foreground outline-none"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not">Prefer not to say</option>
            </select>
          </motion.div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-semibold text-[15px] disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
