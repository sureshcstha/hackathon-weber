const historyTableBody = document.getElementById('history-table-body');
const sessions = JSON.parse(localStorage.getItem('focusSessions')) || [];

function renderHistory() {
  // Clear the table before re-rendering
  historyTableBody.innerHTML = '';

    if (sessions.length === 0) {
    historyTableBody.innerHTML = "<tr><td colspan='5'>No sessions saved yet.</td></tr>";
    } else {
    sessions.forEach((session, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${session.timestamp}</td>
        <td>${formatTime(session.focusedTime)}</td>
        <td>${formatTime(session.distractedTime)}</td>
        <td>${formatTime(session.totalTime)}</td>
        <td>${session.focusPercentage}%</td>
        <td><button class="delete-btn" data-index="${index}">Delete</button></td>
        `;
        historyTableBody.appendChild(row);
    });
    }
    // Add event listeners for delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', handleDelete);
    });
}

function handleDelete(event) {
  const index = event.target.getAttribute('data-index');
  sessions.splice(index, 1); // Remove session from array
  localStorage.setItem('focusSessions', JSON.stringify(sessions)); // Update localStorage
  renderHistory(); // Re-render the table
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

renderHistory(); // Initial render