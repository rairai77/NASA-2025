import * as d3 from "d3";

// ============================================
// RENDER DIAGRAM (Links, Nodes, Labels)
// ============================================

export function renderDiagram(svg, nodes, links, personColors, animationDuration, nodeRows, rowColors) {
    // Use the stageTransition for animation stages
    const linksWithStages = links.map(link => ({
        ...link,
        animationStage: link.stageTransition
    }));

    // Calculate row positions for table lines
    const rows = nodes.map(n => n.row);
    const maxRow = Math.max(...rows);
    const rowHeight = (svg.attr("height") - 100) / (maxRow + 1);
    
    // Draw colored background bars for each row (FIRST, so they're behind everything)
    const rowBackgrounds = svg.append("g").attr("class", "row-backgrounds");
    
    Object.entries(rowColors).forEach(([rowNum, color]) => {
        const y = 50 + parseInt(rowNum) * rowHeight;
        
        rowBackgrounds.append("rect")
            .attr("x", 0)
            .attr("y", y)
            .attr("width", svg.attr("width"))
            .attr("height", rowHeight)
            .attr("fill", color)
            .attr("opacity", 0.25);  // 25% opacity
    });
    
    // Draw horizontal row lines (like a table)
    const rowLines = svg.append("g").attr("class", "row-lines");
    
    // Create a map of row number to row name (only use room/module names, not crew or targets)
    const rowToName = {};
    Object.entries(nodeRows).forEach(([name, rowNum]) => {
        // Skip crew names and targets, only label with module/room names
        if (!name.startsWith("Crew") && !name.startsWith("-Target-")) {
            // Take the first room name we encounter for each row
            if (!rowToName[rowNum]) {
                rowToName[rowNum] = name;
            }
        }
    });
    
    // Draw lines and labels for each unique row that has a name
    Object.keys(rowToName).forEach(rowNum => {
        const y = 50 + parseInt(rowNum) * rowHeight;
        
        // Draw horizontal line
        rowLines.append("line")
            .attr("x1", 0)
            .attr("x2", svg.attr("width"))
            .attr("y1", y + rowHeight / 2) // Center of row
            .attr("y2", y + rowHeight / 2)
            .attr("stroke", "#e0e0e0")
            .attr("stroke-width", 1)
            .attr("stroke-dasharray", "5,5")
            .attr("opacity", 0.5);
        
        // Add row label on the left, centered vertically in the row
        rowLines.append("text")
            .attr("x", 10)
            .attr("y", y + rowHeight / 2)  // Center vertically
            .attr("dy", "0.35em")
            .attr("text-anchor", "start")
            .text(rowToName[rowNum])
            .style("font-size", "14px")
            .style("font-family", "sans-serif")
            .style("fill", "#666");
    });

    // Draw links
    const linkPaths = svg.append("g")
        .selectAll("path")
        .data(linksWithStages)
        .join("path")
        .attr("d", d => {
            // Create a smooth curve between nodes
            const path = d3.path();
            path.moveTo(d.source.x1, d.y0);
            
            const midX = (d.source.x1 + d.target.x0) / 2;
            path.bezierCurveTo(
                midX, d.y0,
                midX, d.y1,
                d.target.x0, d.y1
            );
            
            return path.toString();
        })
        .attr("stroke-width", d => d.width)
        .attr("fill", "none")
        .attr("stroke", d => personColors[d.person])
        .attr("opacity", 0.5)
        .attr("stroke-dasharray", function() {
            return this.getTotalLength();
        })
        .attr("stroke-dashoffset", function() {
            return this.getTotalLength();
        });

    // Animate links by stage
    linkPaths.transition()
        .delay(d => d.animationStage * animationDuration)
        .duration(animationDuration)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // Draw nodes
    const nodeRects = svg.append("g")
        .selectAll("rect")
        .data(nodes)
        .join("rect")
        .attr("x", d => d.x0)
        .attr("y", d => d.y0)
        .attr("height", d => d.y1 - d.y0)
        .attr("width", d => d.x1 - d.x0)
        .attr("fill", d => {
            // Check if this node is a crew member
            if (personColors[d.name]) return personColors[d.name];
            // Targets in a darker blue
            if (d.isTarget) return "#1976d2";
            return "#2196f3";  // Blue for modules
        })
        .attr("rx", 4)  // rounded corners
        .attr("opacity", 0);

    // Animate nodes
    nodeRects.transition()
        .delay(d => (d.stage + 1) * animationDuration * 0.7)
        .duration(500)
        .attr("opacity", 1);

    // Add target labels on the right side - LARGER FONT
    const targetLabels = svg.append("g")
        .selectAll("text")
        .data(nodes.filter(n => n.isTarget))
        .join("text")
        .attr("x", d => d.x1 + 8)  // To the right of the node
        .attr("y", d => (d.y0 + d.y1) / 2)
        .attr("dy", "0.35em")
        .attr("text-anchor", "start")
        .text(d => d.name)  // This will already have "-Target-" prefix removed by dataGenerator
        .style("font-size", "16px")  // Increased from 12px
        .style("font-family", "sans-serif")
        .style("fill", "#666")
        .style("font-weight", "bold")
        .attr("opacity", 0);

    // Animate target labels
    targetLabels.transition()
        .delay(d => (d.stage + 1) * animationDuration * 0.7)
        .duration(500)
        .attr("opacity", 1);

    return { linkPaths, nodeRects };
}
