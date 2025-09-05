import { io } from 'https://cdn.socket.io/4.7.5/socket.io.esm.min.js';

const socket = io();  // Uses served socket.io from script tag
let currentRoomId = null;

// DOM elements (only room page elements)
const roomIdSpan = document.getElementById('roomId');
const userCountSpan = document.getElementById('userCount');
const messages = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');

// Initialize room
function init() {
  // Extract room ID from URL
  const roomId = window.location.pathname.slice(1); // Remove leading slash

  if (!roomId) {
    // No room ID in URL, redirect to landing
    window.location.href = '/';
    return;
  }

  joinRoom(roomId);
  setupEventListeners();
}

// set up event listeners
function setupEventListeners() {
  // global functions for HTML onclick handlers
  window.sendMessage = sendMessage;
  window.handleEnter = handleEnter;
}

function joinRoom(roomId) {
  currentRoomId = roomId;
  roomIdSpan.textContent = roomId;
  socket.emit('join-room', roomId);
}

function sendMessage() {
  const text = messageInput.value.trim();
  if (text && currentRoomId) {
    socket.emit('message', { text });
    messageInput.value = '';
  }
}

function handleEnter(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

socket.on('joined-room', (data) => {
  console.log('✅ Joined room:', data.roomId);
  userCountSpan.textContent = data.userCount;
});

socket.on('user-count', (count) => {
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