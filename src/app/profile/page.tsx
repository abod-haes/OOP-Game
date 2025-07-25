"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import * as lucideReact from "lucide-react";
import {
  sessionUtils,
  getUserById,
  updateUser,
  UserProfile,
  UpdateUserRequest,
  getUserLastLevels,
  UserLevel,
} from "@/lib/api/client";
import { HoverButton } from "@/components/ui/hover-button";
import FormInput from "@/components/ui/form-input";
import { BASE_URL } from "@/app/api-services";

interface Section {
  id: string;
  updatedAt: string | null;
  deletedAt: string | null;
  sectionNumber: number;
  description: string;
}

interface ProfileFormData {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  birthDate: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userLastLevel, setUserLastLevel] = useState<UserLevel | null>(null);
  const [userLevels, setUserLevels] = useState<UserLevel[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [formData, setFormData] = useState<ProfileFormData>({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    birthDate: "",
  });
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    if (!sessionUtils.isAuthenticated()) {
      router.push("/sign-in");
      return;
    }

    loadUserProfile();
    loadUserLastLevel();
    loadSections();
  }, [router]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userId = sessionUtils.getUserId();
      if (!userId) {
        setError("User ID not found");
        return;
      }

      const response = await getUserById(userId);
      if (response.success && response.data) {
        setProfile(response.data);
        // Handle birth date properly - if null or empty, set to empty string
        let birthDateForForm = "";
        if (response.data.birthDate && response.data.birthDate.trim() !== "") {
          try {
            birthDateForForm = response.data.birthDate.split("T")[0]; // Convert to YYYY-MM-DD format
          } catch {
            birthDateForForm = "";
          }
        }

        setFormData({
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          userName: response.data.userName,
          email: response.data.email,
          birthDate: birthDateForForm,
        });
      } else {
        const errorMessage = Array.isArray(response.error)
          ? response.error.join(", ")
          : response.error || "Failed to load profile";
        setError(errorMessage);
      }
    } catch (error) {
      setError("An error occurred while loading the profile");
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserLastLevel = async () => {
    try {
      const userId = sessionUtils.getUserId();
      if (!userId) return;

      const response = await getUserLastLevels(userId);
      if (response.success && response.data && response.data.length > 0) {
        setUserLevels(response.data);

        // Find the highest level the user has completed
        const highestLevel = response.data.reduce((highest, current) => {
          return current.levelNumber > highest.levelNumber ? current : highest;
        });
        setUserLastLevel(highestLevel);
      }
    } catch (error) {
      console.error("Error loading user's last level:", error);
    }
  };

  const loadSections = async () => {
    try {
      const response = await fetch(BASE_URL + "/section/getAll");
      if (response.ok) {
        const data = await response.json();
        setSections(data.data || []);
      }
    } catch (error) {
      console.error("Error loading sections:", error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const userId = sessionUtils.getUserId();
      if (!userId) {
        setError("User ID not found");
        return;
      }

      // Handle birth date properly - if empty or invalid, set to null
      let birthDateToSend: string | null = null;
      if (formData.birthDate && formData.birthDate.trim() !== "") {
        const date = new Date(formData.birthDate);
        if (!isNaN(date.getTime())) {
          birthDateToSend = date.toISOString();
        }
      }

      const updateData: UpdateUserRequest = {
        userId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        userName: formData.userName,
        email: formData.email,
        birthDate: birthDateToSend || "",
        fcmToken: "",
      };

      const response = await updateUser(updateData);
      if (response.success) {
        setIsEditing(false);
        await loadUserProfile(); // Reload the profile data
      } else {
        const errorMessage = Array.isArray(response.error)
          ? response.error.join(", ")
          : response.error || "Failed to update profile";
        setError(errorMessage);
      }
    } catch (error) {
      setError("An error occurred while updating the profile");
      console.error("Error updating profile:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      // Handle birth date properly - if null or empty, set to empty string
      let birthDateForForm = "";
      if (profile.birthDate && profile.birthDate.trim() !== "") {
        try {
          birthDateForForm = profile.birthDate.split("T")[0];
        } catch {
          birthDateForForm = "";
        }
      }

      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        userName: profile.userName,
        email: profile.email,
        birthDate: birthDateForForm,
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-metallic-accent mx-auto mb-4"></div>
          <p className="text-light-200 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-light-200 text-lg">Profile not found</p>
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <HoverButton
            onClick={loadUserProfile}
            className="mt-4 px-6 py-2 flex gap-2 items-center bg-metallic-accent/20 hover:bg-metallic-accent/30"
          >
            <lucideReact.RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </HoverButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  pt-24 pb-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="container mx-auto px-4"
      >
        {/* Profile Header */}
        <motion.div
          variants={itemVariants}
          className="bg-metallic-light/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-metallic-accent to-metallic-light rounded-full flex items-center justify-center shadow-2xl">
                <lucideReact.User className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                <span className="text-white text-xs font-bold">5</span>
              </div>
            </div>

            {/* Profile Info */}
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl font-bold text-light-200 mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-metallic-light text-lg mb-1">
                @{profile.userName}
              </p>
              <p className="text-metallic-light/80 text-sm mb-4">
                {profile.email}
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center gap-2 text-metallic-light/80">
                  <lucideReact.Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Joined {new Date(profile.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-metallic-light/80">
                  <lucideReact.Trophy className="w-4 h-4" />
                  <span className="text-sm">
                    {userLastLevel
                      ? `Level ${userLastLevel.levelNumber}`
                      : "No levels completed"}
                  </span>
                </div>
                {userLastLevel && (
                  <div className="flex items-center gap-2 text-metallic-light/80">
                    <lucideReact.Map className="w-4 h-4" />
                    <span className="text-sm">
                      {(() => {
                        const section = sections.find(
                          (s) => s.id === userLastLevel.sectionId
                        );
                        return section
                          ? `Section ${
                              section.sectionNumber
                            }: ${section.description
                              .split(" ")
                              .slice(0, 3)
                              .join(" ")}...`
                          : `Section ${userLastLevel.sectionId.slice(0, 8)}...`;
                      })()}
                    </span>
                  </div>
                )}
                {userLevels.length > 0 && (
                  <div className="flex items-center gap-2 text-metallic-light/80">
                    <lucideReact.CheckCircle className="w-4 h-4" />
                    <span className="text-sm">
                      {userLevels.length} level
                      {userLevels.length !== 1 ? "s" : ""} completed
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="flex flex-col gap-2">
              <HoverButton
                onClick={() => setIsEditing(!isEditing)}
                className="px-6 py-2 bg-metallic-accent/20 flex gap-1 items-center hover:bg-metallic-accent/30"
                disabled={isSaving}
              >
                {isEditing ? (
                  <>
                    <lucideReact.X className="w-4 h-4 mr-2" />
                    Cancel
                  </>
                ) : (
                  <>
                    <lucideReact.Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </>
                )}
              </HoverButton>
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            variants={itemVariants}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center gap-2">
              <lucideReact.AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          </motion.div>
        )}

        {/* User Progress Section */}
        {userLevels.length > 0 && (
          <motion.div
            variants={itemVariants}
            className="bg-metallic-light/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-light-200 mb-6 flex items-center gap-2">
              <lucideReact.Trophy className="w-6 h-6 text-metallic-accent" />
              Learning Progress
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Total Levels Completed */}
              <div className="bg-metallic-accent/10 border border-metallic-accent/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-metallic-accent/20 rounded-full flex items-center justify-center">
                    <lucideReact.CheckCircle className="w-5 h-5 text-metallic-accent" />
                  </div>
                  <div>
                    <p className="text-metallic-light/60 text-sm">
                      Total Completed
                    </p>
                    <p className="text-light-200 text-xl font-bold">
                      {userLevels.length}
                    </p>
                  </div>
                </div>
              </div>

              {/* Highest Level */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <lucideReact.TrendingUp className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-metallic-light/60 text-sm">
                      Highest Level
                    </p>
                    <p className="text-light-200 text-xl font-bold">
                      {userLastLevel
                        ? `Level ${userLastLevel.levelNumber}`
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Section */}
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <lucideReact.Map className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-metallic-light/60 text-sm">
                      Current Section
                    </p>
                    <p className="text-light-200 text-xl font-bold">
                      {userLastLevel
                        ? (() => {
                            const section = sections.find(
                              (s) => s.id === userLastLevel.sectionId
                            );
                            return section
                              ? `Section ${section.sectionNumber}`
                              : "N/A";
                          })()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Levels */}
            {userLevels.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-light-200 mb-4">
                  Recent Levels
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {userLevels
                    .sort((a, b) => b.levelNumber - a.levelNumber)
                    .slice(0, 6)
                    .map((level) => (
                      <div
                        key={level.id}
                        className="bg-metallic-light/5 border border-white/10 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-light-200 font-medium">
                              Level {level.levelNumber}
                            </p>
                            <p className="text-metallic-light/60 text-sm">
                              {level.name}
                            </p>
                          </div>
                          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                            <lucideReact.Check className="w-4 h-4 text-green-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Edit Profile Form */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-metallic-light/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-light-200 mb-6 flex items-center gap-2">
              <lucideReact.Edit className="w-6 h-6 text-metallic-accent" />
              Edit Profile
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-metallic-light/80 text-sm font-medium mb-2">
                  First Name
                </label>
                <FormInput
                  icon={
                    <lucideReact.User className="text-white/60" size={18} />
                  }
                  type="text"
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-metallic-light/80 text-sm font-medium mb-2">
                  Last Name
                </label>
                <FormInput
                  icon={
                    <lucideReact.User className="text-white/60" size={18} />
                  }
                  type="text"
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-metallic-light/80 text-sm font-medium mb-2">
                  Username
                </label>
                <FormInput
                  icon={
                    <lucideReact.AtSign className="text-white/60" size={18} />
                  }
                  type="text"
                  placeholder="Enter username"
                  value={formData.userName}
                  onChange={(e) =>
                    handleInputChange("userName", e.target.value)
                  }
                />
              </div>

              <div>
                <label className="block text-metallic-light/80 text-sm font-medium mb-2">
                  Email
                </label>
                <FormInput
                  icon={
                    <lucideReact.Mail className="text-white/60" size={18} />
                  }
                  type="email"
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-metallic-light/80 text-sm font-medium mb-2">
                  Birth Date
                </label>
                <FormInput
                  icon={
                    <lucideReact.Calendar className="text-white/60" size={18} />
                  }
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) =>
                    handleInputChange("birthDate", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <HoverButton
                onClick={handleCancelEdit}
                className="px-6 py-2 bg-metallic-accent/20 hover:bg-metallic-accent/30"
                disabled={isSaving}
              >
                Cancel
              </HoverButton>
              <HoverButton
                onClick={handleSaveProfile}
                className="px-6 py-2 flex gap-1 items-center bg-metallic-accent hover:bg-metallic-accent/80"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <lucideReact.Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </HoverButton>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
