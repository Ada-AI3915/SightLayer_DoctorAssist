import { io } from "socket.io-client";
import config from "../../config.json"

export const socket = io(config.SOCKET_URL);
