export default function createExamSocket({ code, onStart, onSubmit, onEnd, onJoin, onLeave}) {
    const socket = new WebSocket("ws://localhost:8080/ws/rooms");
    const email = localStorage.getItem("email");
    const username = localStorage.getItem("username");
    socket.addEventListener("open", () => {
        console.log("✅ Socket connected");
        socket.send(`JOIN:${code}:${email}:${username}`);
    });

    socket.addEventListener("message", (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === "START") {
                console.log("🚀 Received START");
                onStart?.();
            }else if (data.type === "SUBMIT") {
                console.log("Received SUBMIT");
                onSubmit?.(data);
            }else if (data.type === "END") {
                console.log("🚀 Received END");
                onEnd?.();
            }else if (data.type === "JOIN") {
                onJoin?.(data.username);
            }else if (data.type === "LEAVE") {
                onLeave?.(data.username);
            }
        } catch (err) {
            console.error("❌ Lỗi parse message:", err);
        }
    });

    const cleanup = () => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(`LEAVE:${code}:${email}:${username}`);
        }
        socket.close();
        console.log("❌ Socket closed");
    };

    return { socket, cleanup };
}



export const useKickSocket = ({email, onKick}) => {
    const socket = new WebSocket(`ws://localhost:8080/ws/kick?email=${email}`);

    socket.onmessage = (event) => {
        onKick?.(event.data);
    };

    return () => {
        socket.close();
    };
};
