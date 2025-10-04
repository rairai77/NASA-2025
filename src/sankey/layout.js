// ============================================
// CUSTOM LAYOUT WITH FIXED ROWS
// ============================================

export function customLayoutWithFixedRows(data, width, height) {
    const { nodes, links } = data;
    
    // Find the range of stages (horizontal position)
    const stages = [...new Set(nodes.map(n => n.stage))].sort((a, b) => a - b);
    const minStage = stages[0];
    const maxStage = stages[stages.length - 1];
    
    // Calculate x positions for each stage - INCREASED SPACING
    const stageWidth = (width - 400) / (maxStage - minStage);  // Increased gap (reduced from 600)
    
    // Find max stage for targets to align them
    const targetNodes = nodes.filter(n => n.isTarget);
    const maxTargetStage = targetNodes.length > 0 ? Math.max(...targetNodes.map(n => n.stage)) : maxStage;
    
    // Find the range of rows (vertical position)
    const rows = nodes.map(n => n.row);
    const maxRow = Math.max(...rows);
    
    // Calculate positions
    const rowHeight = (height - 100) / (maxRow + 1);
    const nodeWidth = 60;  // Width
    const nodeHeight = 20; // Height
    
    nodes.forEach((node, i) => {
        node.index = i;
        
        // X position based on stage
        if (node.isTarget) {
            // All targets align at the same x position (rightmost)
            node.x0 = 200 + (maxTargetStage - minStage) * stageWidth;
        } else {
            const normalizedStage = node.stage - minStage;
            node.x0 = 200 + normalizedStage * stageWidth;
        }
        node.x1 = node.x0 + nodeWidth;
        
        // Y position based on row (fixed vertical position)
        // Center the node vertically within the row
        const rowTop = 50 + node.row * rowHeight;
        const rowCenter = rowTop + rowHeight / 2;
        node.y0 = rowCenter - nodeHeight / 2;  // Center the node in the row
        node.y1 = node.y0 + nodeHeight;
    });
    
    // Process links
    links.forEach(link => {
        const source = nodes[link.source];
        const target = nodes[link.target];
        
        link.source = source;
        link.target = target;
        link.width = link.value * 1.5;
        link.y0 = source.y0 + (source.y1 - source.y0) / 2;
        link.y1 = target.y0 + (target.y1 - target.y0) / 2;
    });
    
    return { nodes, links };
}
