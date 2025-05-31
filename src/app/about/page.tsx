"use client";
import React from "react";
import { motion } from "framer-motion";
import * as lucideReact from "lucide-react";

function Page() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3,
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

    const features = [
        {
            icon: <lucideReact.Gamepad2 className="w-8 h-8" />,
            title: "Gaming Excellence",
            description:
                "Experience gaming at its finest with our cutting-edge platform designed for true gamers.",
        },
        {
            icon: <lucideReact.Users className="w-8 h-8" />,
            title: "Community Driven",
            description:
                "Join a vibrant community of gamers who share your passion and enthusiasm.",
        },
        {
            icon: <lucideReact.Shield className="w-8 h-8" />,
            title: "Secure Platform",
            description:
                "Your security is our priority. Enjoy gaming with peace of mind.",
        },
        {
            icon: <lucideReact.Trophy className="w-8 h-8" />,
            title: "Achievement System",
            description:
                "Track your progress and earn rewards as you master your favorite games.",
        },
    ];

    const stats = [
        { number: "1M+", label: "Active Players" },
        { number: "50+", label: "Game Titles" },
        { number: "24/7", label: "Support" },
        { number: "99.9%", label: "Uptime" },
    ];

    const values = [
        {
            icon: <lucideReact.Heart className="w-8 h-8" />,
            title: "Passion",
            description:
                "We live and breathe gaming, bringing that passion to everything we do.",
        },
        {
            icon: <lucideReact.Lightbulb className="w-8 h-8" />,
            title: "Innovation",
            description:
                "Constantly pushing boundaries to create better gaming experiences.",
        },
        {
            icon: <lucideReact.Handshake className="w-8 h-8" />,
            title: "Integrity",
            description:
                "Building trust through transparency and honest communication.",
        },
    ];

    //     {
    //         year: "2023",
    //         title: "Platform Launch",
    //         description:
    //             "Successfully launched our gaming platform with cutting-edge features.",
    //     },
    //     {
    //         year: "2024",
    //         title: "Community Milestone",
    //         description: "Reached 1 million active players and growing.",
    //     },
    //     {
    //         year: "2024",
    //         title: "Global Expansion",
    //         description: "Expanded our services to multiple regions worldwide.",
    //     },
    // ];

    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
        <h2 className="text-3xl font-bold mb-8 relative text-center">
            <span className="relative inline-block text-white">{children}</span>
        </h2>
    );

    return (
        <div className="min-h-[100dvh] w-full pt-36 px-4">
            <div className="max-w-6xl mx-auto">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-24"
                >
                    {/* Hero Section */}
                    <div className="space-y-10">
                        <motion.div
                            variants={itemVariants}
                            className="text-center"
                        >
                            <h1 className="text-4xl md:text-5xl font-bold mb-6 relative group">
                                <span className="relative inline-block text-white">
                                    About Our Platform
                                </span>
                            </h1>
                            <p className="text-white/80 max-w-2xl mx-auto text-lg relative">
                                Welcome to the future of gaming. We&apos;re
                                building a platform where gamers can connect,
                                compete, and create unforgettable experiences.
                            </p>
                        </motion.div>

                        {/* Stats Section */}
                        <motion.div variants={itemVariants}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        variants={itemVariants}
                                        className="text-center p-6 rounded-2xl bg-metallic-light/5 backdrop-blur-lg border border-white/10"
                                    >
                                        <div className="text-3xl font-bold text-metallic-accent mb-2">
                                            {stat.number}
                                        </div>
                                        <div className="text-white/60 text-sm">
                                            {stat.label}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Features Grid */}
                    <motion.div variants={itemVariants}>
                        <SectionTitle>Key Features</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="p-6 rounded-2xl bg-metallic-light/5 backdrop-blur-lg border border-white/10 hover:border-metallic-accent/30 transition-all duration-300"
                                >
                                    <div className="text-metallic-accent mb-4">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-white/60">
                                        {feature.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Values Section */}
                    <motion.div variants={itemVariants}>
                        <SectionTitle>Our Core Values</SectionTitle>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {values.map((value, index) => (
                                <motion.div
                                    key={index}
                                    variants={itemVariants}
                                    className="p-6 rounded-2xl bg-metallic-light/5 backdrop-blur-lg border border-white/10"
                                >
                                    <div className="text-metallic-accent mb-4">
                                        {value.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {value.title}
                                    </h3>
                                    <p className="text-white/60">
                                        {value.description}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Mission Statement */}
                    <motion.div variants={itemVariants}>
                        <SectionTitle>Our Mission</SectionTitle>
                        <div className="px-8 py-12 rounded-2xl bg-metallic-light/5 backdrop-blur-lg border border-white/10">
                            <div className="max-w-3xl mx-auto space-y-8">
                                <p className="text-white/80 leading-relaxed text-center text-lg">
                                    We&apos;re on a mission to revolutionize the
                                    gaming experience by creating a platform
                                    that brings together gamers from all walks
                                    of life. Our goal is to foster a community
                                    where everyone can find their place, whether
                                    you&apos;re a casual player or a competitive
                                    gamer.
                                </p>

                                <div className="grid md:grid-cols-2 gap-8 mt-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                            <lucideReact.Target className="w-5 h-5 text-metallic-accent" />
                                            Our Vision
                                        </h3>
                                        <p className="text-white/60">
                                            To create the most inclusive and
                                            engaging gaming platform where
                                            players can connect, compete, and
                                            create lasting memories. We envision
                                            a future where gaming transcends
                                            boundaries and brings people
                                            together.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                            <lucideReact.Star className="w-5 h-5 text-metallic-accent" />
                                            Our Promise
                                        </h3>
                                        <p className="text-white/60">
                                            We commit to providing a secure,
                                            fair, and enjoyable gaming
                                            environment. Our platform will
                                            continuously evolve with player
                                            feedback and technological
                                            advancements to deliver the best
                                            possible experience.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                            <lucideReact.Users className="w-5 h-5 text-metallic-accent" />
                                            Community Focus
                                        </h3>
                                        <p className="text-white/60">
                                            Building a strong, supportive
                                            community is at the heart of
                                            everything we do. We encourage
                                            collaboration, sportsmanship, and
                                            positive interactions among all our
                                            players.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                            <lucideReact.Rocket className="w-5 h-5 text-metallic-accent" />
                                            Innovation
                                        </h3>
                                        <p className="text-white/60">
                                            We&apos;re constantly pushing the
                                            boundaries of what&apos;s possible
                                            in gaming. From cutting-edge
                                            features to seamless integration, we
                                            strive to stay ahead of the curve.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
}

export default Page;
