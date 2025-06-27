export default function createExamSocket({ code, onStart, onSubmit, onEnd, onJoin, onLeave }) {
    const socket = new WebSocket("ws://localhost:8080/ws/rooms");
    const email = localStorage.getItem("email");
    const username = localStorage.getItem("username");

    socket.onopen = () => {
        console.log("✅ Socket connected");
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(`JOIN:${code}:${email}:${username}`);
        }
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            console.log("📨 Received:", data);

            switch (data.type) {
                case "START":
                    console.log("🚀 Received START");
                    onStart?.();
                    break;
                case "SUBMIT":
                    console.log("📤 Received SUBMIT");
                    onSubmit?.(data.users);
                    break;
                case "END":
                    console.log("🏁 Received END");
                    onEnd?.();
                    break;
                case "JOIN":
                    console.log("👤 User joined:", data);
                    onJoin?.(data);
                    break;
                case "LEAVE":
                    console.log("👋 User left:", data);
                    onLeave?.(data);
                    break;
                default:
                    console.warn("⚠️ Unknown message type:", data.type);
            }
        } catch (err) {
            console.error("❌ Lỗi parse message:", err, " - Raw:", event.data);
        }
    };

    const cleanup = () => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(`LEAVE:${code}:${email}:${username}`);
        }
        socket.close();
        console.log("❌ Socket closed");
    };

    return { socket, cleanup };
}



export const kickSocket = ({email, onKick}) => {
    const socket = new WebSocket(`ws://localhost:8080/ws/kick?email=${email}`);

    socket.onmessage = (event) => {
        console.log("message", event.data);
        onKick?.(event.data);
    };

    return () => {
        socket.close();
    };
};
