const io = require('socket.io')(); // Import socket.io

// Socket.IO logic for admin
io.on('connection', socket => {
    console.log('Admin connected');

    // Example: Listen for admin log out event
    socket.on('admin_logout', () => {
        console.log('Admin logged out');

        // Broadcast to all connected clients that admin has logged out
        io.emit('admin_logged_out');
    });

    // Add more admin-specific socket.io logic here as needed
});

module.exports = { io }; // Export io if needed
