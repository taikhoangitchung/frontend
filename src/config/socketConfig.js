export default function socketInstance() {
    return new WebSocket("ws://localhost:8080/ws");
}

export const useKickSocket = ({username, onKick}) => {
    const socket = new WebSocket(`ws://localhost:8080/ws/kick?username=${username}`);

    socket.onmessage = (event) => {
        onKick?.(event.data);
    };

    return () => {
        socket.close();
    };
};
