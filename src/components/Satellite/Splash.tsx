import React from "react";
import styles from "./splash.module.css";

export const Splash: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        zIndex: 9,
        width: "100%",
        height: "100%",
        backgroundColor: "#02410ad4",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div className={styles.a}></div>
      <div className={styles.loading}>LOADING</div>
    </div>
  );
};
