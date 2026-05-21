const locks = require('./lockStore');

module.exports = (io, socket) => {
    // 1. Agent enters the workspace dashboard
    socket.on('join_dashboard', () => {
        // Send the current locked state structure back to the freshly connected agent
        const currentLocks = Object.fromEntries(locks);
        socket.emit('current_locks', currentLocks);
    });

    // 2. Lock Request Protocol
    socket.on('lock_ticket', ({ ticket_id, agent_name }) => {
        // Check if the ticket is already held by someone else
        if (locks.has(ticket_id)) {
            const existing_lock = locks.get(ticket_id);
            if (existing_lock.socketId !== socket.id) {
                return socket.emit('lock_rejected', { ticket_id, message: "Ticket is already locked." });
            }
        }
        // Assign the lock atomically in memory
        locks.set(ticket_id, { socketId: socket.id, agent_name });
        io.emit('ticket_locked', { ticket_id, agent_name });
    });
    //Unlock Ticket
    socket.on('unlock_ticket', ({ ticket_id }) => {
        const lock = locks.get(ticket_id);
        // Ensure only the lock owner can release it manually
        if (lock && lock.socketId === socket.id) {
            locks.delete(ticket_id);
            io.emit('ticket_unlocked', { ticket_id });
        }
    });
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);

        for (const [ticket_id, lockDetails] of locks.entries()) {
            if (lockDetails.socketId === socket.id) {
                locks.delete(ticket_id);
                // Notify all remaining clients to unlock this row instantly
                io.emit('ticket_unlocked', { ticket_id });
                console.log(`Ghost Disconnect: Automatically free ticket #${ticket_id}`);
            }
        }
    });
}