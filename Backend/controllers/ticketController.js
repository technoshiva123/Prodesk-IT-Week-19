const locks = require('../sockets/lockStore')

const mockTickets = [
    { ticket_id: "TKT-101", customer: "Walmart Dallas", issue: "Truck breakdown on I-20", status: "Open" },
    { ticket_id: "TKT-102", customer: "Amazon FTW6", issue: "Missed delivery window", status: "In-Progress" },
    { ticket_id: "TKT-103", customer: "Home Depot", issue: "Double-billed invoice error", status: "Open" },
    { ticket_id: "TKT-104", customer: "Target Logistics", issue: "Damaged pallet reports", status: "Closed" }
];

// 1. Fetch All Tickets along with their lock status
const getAllTickets = (req, res) => {
    try {
        const ticketLockState = mockTickets.map(ticket => {
            const isLocked = locks.has(ticket.ticket_id)
            const lockDetails = isLocked ? locks.get(ticket.ticket_id) : null;

            return {
                ...ticket,
                is_Locked: isLocked,
                locked_by: lockDetails ? lockDetails.agent_name : null
            };
        });
        return res.status(200).json({
            success: true,
            data: ticketLockState
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error while fetching tickets",
            error: error.message
        });
    }
};

module.exports = {
    getAllTickets
};