"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import * as lucideReact from 'lucide-react';
import { sessionUtils } from '@/lib/api/client';
import { HoverButton } from '@/components/ui/hover-button';

interface UserProfile {
    firstName: string;
    lastName: string;
    userName: string;
    email: string;
    joinDate: string;
    challengesCompleted: number;
    totalScore: number;
    level: number;
    avatar?: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if user is authenticated
        if (!sessionUtils.isAuthenticated()) {
            router.push('/sign-in');
            return;
        }

        // Simulate loading profile data (replace with actual API call later)
        setTimeout(() => {
            setProfile({
                firstName: "John",
                lastName: "Doe",
                userName: "johndoe",
                email: "john.doe@example.com",
                joinDate: "2024-01-15",
                challengesCompleted: 12,
                totalScore: 2340,
                level: 5,
            });
            setIsLoading(false);
        }, 1000);
    }, [router]);

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
            <div className="min-h-screen bg-gradient-to-br from-metallic-dark via-light-100 to-metallic-light flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-metallic-accent mx-auto mb-4"></div>
                    <p className="text-light-200 text-lg">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-metallic-dark via-light-100 to-metallic-light flex items-center justify-center">
                <div className="text-center">
                    <p className="text-light-200 text-lg">Profile not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-metallic-dark via-light-100 to-metallic-light pt-24 pb-8">
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
                                {profile.avatar ? (
                                    <img 
                                        src={profile.avatar} 
                                        alt="Profile" 
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <lucideReact.User className="w-16 h-16 text-white" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{profile.level}</span>
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="text-center md:text-left flex-1">
                            <h1 className="text-4xl font-bold text-light-200 mb-2">
                                {profile.firstName} {profile.lastName}
                            </h1>
                            <p className="text-metallic-light text-lg mb-1">@{profile.userName}</p>
                            <p className="text-metallic-light/80 text-sm mb-4">{profile.email}</p>
                            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                <div className="flex items-center gap-2 text-metallic-light/80">
                                    <lucideReact.Calendar className="w-4 h-4" />
                                    <span className="text-sm">Joined {new Date(profile.joinDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-2 text-metallic-light/80">
                                    <lucideReact.Trophy className="w-4 h-4" />
                                    <span className="text-sm">Level {profile.level}</span>
                                </div>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <div className="flex flex-col gap-2">
                            <HoverButton
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-6 py-2 bg-metallic-accent/20 hover:bg-metallic-accent/30"
                            >
                                <lucideReact.Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </HoverButton>
                        </div>
                    </div>
                </motion.div>

                {/* Stats Cards */}
                <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
                >
                    <div className="bg-metallic-light/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <lucideReact.Target className="w-8 h-8 text-blue-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-light-200 mb-2">{profile.challengesCompleted}</h3>
                        <p className="text-metallic-light/80">Challenges Completed</p>
                    </div>

                    <div className="bg-metallic-light/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <lucideReact.Star className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-light-200 mb-2">{profile.totalScore.toLocaleString()}</h3>
                        <p className="text-metallic-light/80">Total Score</p>
                    </div>

                    <div className="bg-metallic-light/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 text-center">
                        <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <lucideReact.Trophy className="w-8 h-8 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-light-200 mb-2">{profile.level}</h3>
                        <p className="text-metallic-light/80">Current Level</p>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    variants={itemVariants}
                    className="bg-metallic-light/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8"
                >
                    <h2 className="text-2xl font-bold text-light-200 mb-6 flex items-center gap-2">
                        <lucideReact.Activity className="w-6 h-6 text-metallic-accent" />
                        Recent Activity
                    </h2>
                    
                    <div className="space-y-4">
                        {[
                            { action: "Completed Challenge: Object-Oriented Basics", time: "2 hours ago", icon: lucideReact.CheckCircle, color: "text-green-400" },
                            { action: "Unlocked Achievement: Code Master", time: "1 day ago", icon: lucideReact.Award, color: "text-yellow-400" },
                            { action: "Started Challenge: Advanced Inheritance", time: "3 days ago", icon: lucideReact.Play, color: "text-blue-400" },
                            { action: "Completed Challenge: Polymorphism Fundamentals", time: "1 week ago", icon: lucideReact.CheckCircle, color: "text-green-400" },
                        ].map((activity, index) => (
                            <div key={index} className="flex items-center gap-4 p-4 bg-metallic-dark/20 rounded-lg">
                                <activity.icon className={`w-6 h-6 ${activity.color}`} />
                                <div className="flex-1">
                                    <p className="text-light-200 font-medium">{activity.action}</p>
                                    <p className="text-metallic-light/60 text-sm">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Edit Profile Modal (placeholder) */}
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-metallic-light/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4"
                        >
                            <h3 className="text-2xl font-bold text-light-200 mb-6">Edit Profile</h3>
                            <p className="text-metallic-light/80 mb-6">
                                Profile editing functionality will be implemented when the API is ready.
                            </p>
                            <div className="flex justify-end gap-4">
                                <HoverButton
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-2 bg-metallic-accent/20 hover:bg-metallic-accent/30"
                                >
                                    Close
                                </HoverButton>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
} 