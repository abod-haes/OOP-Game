import React from "react";
import Landing from "@/components/landing";

import HomeEditor from "@/components/home-editor";
import Map from "@/components/map/map";

function Page() {
    return (
        <main className=" ">
            <div className="container mx-auto grid grid-cols-1 gap-y-24 w-full h-full">
                <Landing />

                <HomeEditor />
            </div>
            <div className="px-10 mx-auto grid grid-cols-1 gap-y-24 w-full h-full pt-24 overflow-hidden ">
                <Map />
            </div>
        </main>
    );
}

export default Page;
