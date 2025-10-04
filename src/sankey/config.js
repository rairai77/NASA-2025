// ============================================
// CONFIGURATION - 9-Hour Workday
// ============================================

// Define all nodes with fixed vertical positions (rows)
// People, rooms, and targets can all share the same rows
export const nodeRows = {
    // People - share rows with rooms
    "Person A": 0,
    "Person B": 1,
    "Person C": 2,
    "Person D": 3,
    "Person E": 4,
    
    // Rooms (work locations throughout the day)
    "Office": 0,            // Shares with Person A
    "Conference Room": 1,   // Shares with Person B
    "Lab": 2,               // Shares with Person C
    "Cafeteria": 3,         // Shares with Person D
    "Meeting Room 1": 4,    // Shares with Person E
    "Meeting Room 2": 5,
    "Workshop": 6,
    "Library": 7,
    "Break Room": 8,
    
    // End of day targets - each person has their own
    "-Target-Person A": 0,  // Shares with Office/Person A
    "-Target-Person B": 1,  // Shares with Conference Room/Person B
    "-Target-Person C": 2,  // Shares with Lab/Person C
    "-Target-Person D": 3,  // Shares with Cafeteria/Person D
    "-Target-Person E": 4   // Shares with Meeting Room 1/Person E
};

// Define colors for each row background (25% opacity will be applied automatically)
// Using more vibrant colors since transparency will tone them down
export const rowColors = {
    0: "#ff5252",  // Red
    1: "#2196f3",  // Blue
    2: "#4caf50",  // Green
    3: "#ff9800",  // Orange
    4: "#9c27b0",  // Purple
    5: "#00bcd4",  // Cyan
    6: "#ffeb3b",  // Yellow
    7: "#e91e63",  // Pink
    8: "#03a9f4",  // Light Blue
};

// Define each person's 9-hour workday path (9 rooms = 9 hours)
// Each step represents one hour of the workday
export const personPaths = {
    "Person A": {
        path: [
            "Office",           // Hour 1 (9 AM)
            "Office",           // Hour 2 (10 AM)
            "Conference Room",  // Hour 3 (11 AM)
            "Cafeteria",        // Hour 4 (12 PM - Lunch)
            "Lab",              // Hour 5 (1 PM)
            "Lab",              // Hour 6 (2 PM)
            "Meeting Room 1",   // Hour 7 (3 PM)
            "Office",           // Hour 8 (4 PM)
            "Office",           // Hour 9 (5 PM)
            "-Target-Person A"  // End of day
        ],
        color: "#e74c3c",  // red
        value: 8
    },
    "Person B": {
        path: [
            "Workshop",         // Hour 1
            "Workshop",         // Hour 2
            "Cafeteria",        // Hour 3 (Lunch)
            "Meeting Room 2",   // Hour 4
            "Conference Room",  // Hour 5
            "Office",           // Hour 6
            "Lab",              // Hour 7
            "Break Room",       // Hour 8
            "Office",           // Hour 9
            "-Target-Person B"  // End of day
        ],
        color: "#3498db",  // blue
        value: 8
    },
    "Person C": {
        path: [
            "Lab",              // Hour 1
            "Lab",              // Hour 2
            "Cafeteria",        // Hour 3 (Lunch)
            "Library",          // Hour 4
            "Office",           // Hour 5
            "Meeting Room 1",   // Hour 6
            "Conference Room",  // Hour 7
            "Office",           // Hour 8
            "Office",           // Hour 9
            "-Target-Person C"  // End of day
        ],
        color: "#2ecc71",  // green
        value: 8
    },
    "Person D": {
        path: [
            "Office",           // Hour 1
            "Conference Room",  // Hour 2
            "Conference Room",  // Hour 3
            "Cafeteria",        // Hour 4 (Lunch)
            "Meeting Room 2",   // Hour 5
            "Office",           // Hour 6
            "Workshop",         // Hour 7
            "Lab",              // Hour 8
            "Office",           // Hour 9
            "-Target-Person D"  // End of day
        ],
        color: "#f39c12",  // orange
        value: 8
    },
    "Person E": {
        path: [
            "Meeting Room 1",   // Hour 1
            "Meeting Room 1",   // Hour 2
            "Office",           // Hour 3
            "Cafeteria",        // Hour 4 (Lunch)
            "Workshop",         // Hour 5
            "Lab",              // Hour 6
            "Library",          // Hour 7
            "Meeting Room 2",   // Hour 8
            "Office",           // Hour 9
            "-Target-Person E"  // End of day
        ],
        color: "#9b59b6",  // purple
        value: 8
    }
};

// Animation settings - adjusted for 9 stages
export const animationSettings = {
    linkDrawDuration: 400,  // Faster drawing to keep total time reasonable
    circleTravelDuration: 800,  // Time for astronaut to travel each link
    nodePauseDuration: 100,  // Brief pause at each room
    diagramCompleteBuffer: 500  // Buffer time after diagram completes
};
