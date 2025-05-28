import React from "react";
import Landing from "@/components/landing";

import HomeEditor from "@/components/home-editor";

function Page() {
    return (
        <main className=" bg-[#030303]">
            <div className="container mx-auto grid grid-cols-1 gap-y-24 w-full h-full">
                <Landing />
                <HomeEditor />
            </div>
        </main>
    );
}

export default Page;
