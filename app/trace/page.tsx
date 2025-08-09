

"use client";
import dynamic from "next/dynamic";
const FlowProvider = dynamic(() => import("../components/FlowProvider"), { ssr: false });
import Sidebar from "../components/Sidebar";


// Add global style to ensure html and body are 100% height and no scrollbars
if (typeof window !== "undefined") {
    const style = document.createElement("style");
    style.innerHTML = `html, body { height: 100%; margin: 0; padding: 0; overflow: hidden; }`;
    document.head.appendChild(style);
}

export default function ChatPage() {
    return (
        <div
            style={{
                height: "100vh",
                width: "100vw",
                background: "linear-gradient(120deg, #f0f4ff 0%, #e6f7ff 100%)",
                display: "flex",
                flexDirection: "row",
                overflow: "hidden",
            }}
        >
            <div style={{ flex: 1, minWidth: 0, height: "100vh" }}>
                <FlowProvider />
            </div>
            <Sidebar />
        </div>
    );
}
