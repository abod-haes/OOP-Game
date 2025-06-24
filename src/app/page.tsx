import React from "react";
import Landing from "@/components/landing";

import HomeEditor from "@/components/home-editor";
import Map from "@/components/map/map";

function Page() {
    return (
        <main className=" ">
            <div className="container pb-10 mx-auto grid grid-cols-1 gap-y-24 w-full h-full">
                <Landing />

                <HomeEditor />
            </div>
            <div className="px-10 mx-auto grid grid-cols-1 gap-y-24 w-full h-full py-32 overflow-hidden ">
                {/* Map Section with Title and Description */}
                <div className="text-center space-y-8">
                    <div className="space-y-4">
                        <h2 className="text-4xl md:text-6xl font-bold text-white animate-glow">
                            🗺️ Adventure Map
                        </h2>
                        <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                            Embark on your coding journey! Each level presents
                            unique programming challenges that will test your
                            skills and help you master the art of software
                            development.
                            <span className="text-metallic-accent font-semibold">
                                {" "}
                                Click on any level
                            </span>{" "}
                            to begin your adventure.
                        </p>
                        {/* <div className="flex justify-center gap-4 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-metallic-accent rounded-full animate-pulse"></div>
                                <span>Available Levels</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Completed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                <span>Locked</span>
                            </div>
                        </div> */}
                    </div>
                </div>
                <Map />
            </div>
        </main>
    );
}

export default Page;
