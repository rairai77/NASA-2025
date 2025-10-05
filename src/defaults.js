// ============================================
// DEFAULT CONFIGURATION
// ============================================

export const defaults = {
    numberOfPeople: 5,
    numberOfHours: 9,
    
    // Available space habitat modules/areas
    availableRooms: [
        "Galley",
        "Sleep Quarters",
        "Hygiene Bay",
        "Medical Bay",
        "Exercise Room",
        "Observation Deck",
        "Research Lab",
        "Engineering Bay",
        "Command Center",
        "Communications Hub",
        "Storage Module",
        "Airlock"
    ],
    
    // Crew member colors (will be assigned A, B, C, D, E, etc.)
    personColors: [
        "#e74c3c",  // red
        "#3498db",  // blue
        "#2ecc71",  // green
        "#f39c12",  // orange
        "#9b59b6",  // purple
        "#e91e63",  // pink
        "#00bcd4",  // cyan
        "#ff5722",  // deep orange
        "#795548",  // brown
        "#607d8b"   // blue grey
    ],
    
    // Row background colors for modules
    rowColors: {
        0: "#ff5252",  // Red
        1: "#2196f3",  // Blue
        2: "#4caf50",  // Green
        3: "#ff9800",  // Orange
        4: "#9c27b0",  // Purple
        5: "#00bcd4",  // Cyan
        6: "#ffeb3b",  // Yellow
        7: "#e91e63",  // Pink
        8: "#03a9f4",  // Light Blue
        9: "#8bc34a",  // Light Green
        10: "#ff9800", // Orange
        11: "#9c27b0", // Purple
        12: "#00bcd4", // Cyan
        13: "#ffeb3b", // Yellow
        14: "#e91e63", // Pink
    }
};
