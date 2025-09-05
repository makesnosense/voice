async function createRoom() {
  try {
    const response = await fetch('/create-room', { method: 'POST' });
    const data = await response.json();

    window.location.href = `/${data.roomId}`;

  } catch (error) {
    alert('Failed to create room: ' + error.message);
  }
}

window.createRoom = createRoom;
