import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';

const socket = io();  // Uses served socket.io from script tag

const roomIdSpan = document.getElementById('roomId');
const userCountSpan = document.getElementById('userCount');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

function init() {
  // Extract room ID from URL
  const roomId = window.location.pathname.slice(1); // Remove leading <slash></slash>

  if (!roomId) {
    // No room ID in URL, redirect to landing
    window.location.href = '/';
    return;
  }

  joinRoom(roomId);
  setupEventListeners();
}

function setupEventListeners() {
  window.sendMessage = sendMessage;
  window.handleEnter = handleEnter;
}

function joinRoom(roomId) {
  socket.emit('join-room', roomId);
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (text && socket.roomId) {
    socket.emit('message', { text });
    messageInput.value = '';
  }
}

function handleEnter(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

socket.on('room-join-success', (data) => {
  console.log('✅ You joined room:', data.roomId);
  socket.roomId = data.roomId;
  roomIdSpan.textContent = data.roomId;
});


socket.on('room-usercount-update', (count) => {
  userCountSpan.textContent = count;
});

socket.on('message', (data) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message';
  messageDiv.innerHTML = `
    <strong>${data.userId}:</strong> ${data.text}
    <div class="timestamp">${new Date(data.timestamp).toLocaleTimeString()}</div>
  `;
  messages.appendChild(messageDiv);
  messages.scrollTop = messages.scrollHeight;
});

socket.on('error', (error) => {
  alert('Error: ' + error);
  window.location.href = '/';
});

document.addEventListener('DOMContentLoaded', init);