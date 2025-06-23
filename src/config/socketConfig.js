export default function connectRoomSocket({
                                              code,
                                              onJoin,
                                              onLeave,
                                              onStarted,
                                          }) {
    const socket = new WebSocket("ws://localhost:8080/ws");

    socket.onopen = () => {
        const username = localStorage.getItem("username");
        socket.send(`JOIN:${code}:${username}`);
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);

            switch (data.type) {
                case "JOIN":
                    onJoin?.(data.username);
                    break;
                case "LEAVE":
                    onLeave?.(data.username);
                    break;
                case "STARTED":
                    onStarted?.(data.examId);
                    break;
                default:
                    break;
            }
        } catch (err) {
            console.error("Invalid WS message:", err);
        }
    };

    socket.onerror = (err) => {
        console.error("WebSocket error:", err);
    };

    return socket;
}
