import React from "react";
import JavaEditor from "./java-editor/JavaEditor";
import { HoverButton } from "./ui/hover-button";
import { IoMdSettings } from "react-icons/io";
import { Meteors } from "./ui/meteors";
import { cn } from "@/lib/utils";

function HomeEditor() {
    return (
        <div className="w-full relative ">
            <div
                className={cn(
                    "relative backdrop-blur-lg bg-[rgba(43,55,80,0.1)] shadow-xl max-w-screen-2xl mx-auto w-full border border-gray-800 px-4 py-8 h-full overflow-hidden rounded-2xl  items-start",
                    "before:shadow-[inset_0_0_0_1px_rgba(170,202,255,0.2),inset_0_0_16px_0_rgba(170,202,255,0.1),inset_0_-3px_12px_0_rgba(170,202,255,0.15),0_1px_3px_0_rgba(0,0,0,0.50),0_4px_12px_0_rgba(0,0,0,0.45)]",
                    "before:mix-blend-multiply before:transition-transform before:duration-300",
                    "overflow-hidden"
                )}
            >
                <div className="absolute w-full h-full top-0 left-0 z-10"></div>

                <JavaEditor />

                <Meteors number={20} />
            </div>
            <HoverButton className=" flex items-center gap-1 mx-auto mt-10  ">
                <IoMdSettings /> Run Code
            </HoverButton>
        </div>
    );
}

export default HomeEditor;
