export default function socketInstance() {
    return new WebSocket("ws://localhost:8080/ws");
}
