import React from "react";
import { FC, ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { MouseAnimation } from "./MouseAnimation";

interface ProvidersProps {
    children: ReactNode;
}

const Providers: FC<ProvidersProps> = ({ children }) => {
    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            {children}
            <MouseAnimation />
        </>
    );
};

export default Providers;
