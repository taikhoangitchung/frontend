export default function socketInstance() {
    return new WebSocket("ws://localhost:8080/ws");
}

export const useKickSocket = ({email, onKick}) => {
    const socket = new WebSocket(`ws://localhost:8080/ws/kick?email=${email}`);

    socket.onmessage = (event) => {
        console.log(event.data);
        onKick?.(event.data);
    };

    return () => {
        socket.close();
    };
};
