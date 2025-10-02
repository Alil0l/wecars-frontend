import { io } from 'socket.io-client';

let URL = '';
if(window.location.port) {
  URL = `http://${window.location.hostname}:9001`;
} else {
  URL = `${window.location.origin}/${window.location.host}`;
}

// Create socket connection
export const socket = io(URL);

// Initialize socket connection and subscribe to document events
export const initializeSocket = (submissionId = null) => {
  if (!socket.connected) {
    socket.connect();
  }

  // Subscribe to the document if submissionId is provided
  if (submissionId) {
    socket.emit('doctype_subscribe', 'WC Car Submission', submissionId);
  }

  return socket;
};

// Subscribe to a specific submission document
export const subscribeToSubmission = (submissionId) => {
  if (socket.connected && submissionId) {
    socket.emit('doctype_subscribe', 'WC Car Submission', submissionId);
  }
};

// Unsubscribe from a specific submission document
export const unsubscribeFromSubmission = (submissionId) => {
  if (socket.connected && submissionId) {
    socket.emit('doctype_unsubscribe', 'WC Car Submission', submissionId);
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};