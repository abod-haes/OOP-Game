import React from "react";

const Loader = ({ color }: { color?: "main" | "light" }) => {
  const style = {
    "--uib-size": "20px",
    "--uib-speed": "0.8s",
    "--uib-color": color === "main" ? "#1c9dea" : "#fff",
  } as React.CSSProperties;

  return (
    <div className="three-body" style={style}>
      <div className="three-body__dot"></div>
      <div className="three-body__dot"></div>
      <div className="three-body__dot"></div>
    </div>
  );
};

export default Loader;
