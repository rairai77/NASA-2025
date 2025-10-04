import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";

// ============================================
// CONFIGURATION - Easy to modify!
// ============================================

// Define all nodes with fixed vertical positions (rows)
// People, collections, and targets can all share rows
const nodeRows = {
    // People
    "Person A": 0,
    "Person B": 1,
    "Person C": 2,
    
    // Collections
    "Collection A": 0,      // Shares row with Person A
    "Collection B": 1,      // Shares row with Person B
    "Collection Z": 3,
    "Processing Hub": 4,
    "Collection Y": 2,      // Shares row with Person C
    "Final Assembly": 5,
    
    // Targets
    "Target X": 0,          // Shares row with Person A and Collection A
    "Target Y": 4,          // Shares row with Processing Hub
    "Target W": 5           // Shares row with Final Assembly
};

// Define each person's path as a simple list of collections
const personPaths = {
    "Person A": {
        path: ["Collection A", "Collection Z", "Target X"],
        color: "#e74c3c",  // red
        value: 10
    },
    "Person B": {
        path: ["Collection B", "Collection Z", "Processing Hub", "Collection Z", "Target Y"],
        color: "#3498db",  // blue
        value: 15
    },
    "Person C": {
        path: ["Collection A", "Collection Y", "Collection Z", "Final Assembly", "Target W"],
        color: "#2ecc71",  // green
        value: 8
    }
};

// ============================================
// DATA GENERATION
// ============================================

function generateSankeyData(personPaths, nodeRows) {
    const nodes = [];
    const nodeMap = new Map(); // (stage, collection) -> node index
    const links = [];
    const personColors = {};
    
    // First pass: determine what stage each collection appears at for each person
    Object.entries(personPaths).forEach(([person, config]) => {
        const { path, color, value } = config;
        personColors[person] = color;
        
        // Track which stage each collection appears at in this person's journey
        path.forEach((collection, stage) => {
            const key = `${stage}-${collection}`;
            if (!nodeMap.has(key)) {
                const nodeIndex = nodes.length;
                nodes.push({
                    name: collection,
                    stage: stage,  // horizontal position (stage in journey)
                    row: nodeRows[collection],  // vertical position (fixed row)
                    id: key,
                    isTarget: collection.startsWith("Target")
                });
                nodeMap.set(key, nodeIndex);
            }
        });
    });
    
    // Add person nodes at stage -1
    Object.entries(personPaths).forEach(([person, config]) => {
        const nodeIndex = nodes.length;
        nodes.push({
            name: person,
            stage: -1,
            row: nodeRows[person],
            id: `person-${person}`,
            isPerson: true
        });
        nodeMap.set(`person-${person}`, nodeIndex);
    });
    
    // Create links
    Object.entries(personPaths).forEach(([person, config]) => {
        const { path, value } = config;
        
        // Link from person to first collection
        const personKey = `person-${person}`;
        const firstKey = `0-${path[0]}`;
        const personIdx = nodeMap.get(personKey);
        const firstIdx = nodeMap.get(firstKey);
        
        links.push({
            source: personIdx,
            target: firstIdx,
            value: value,
            person: person,
            stageTransition: 0
        });
        
        // Links between collections in the path
        for (let i = 0; i < path.length - 1; i++) {
            const sourceKey = `${i}-${path[i]}`;
            const targetKey = `${i + 1}-${path[i + 1]}`;
            const sourceIdx = nodeMap.get(sourceKey);
            const targetIdx = nodeMap.get(targetKey);
            
            links.push({
                source: sourceIdx,
                target: targetIdx,
                value: value,
                person: person,
                stageTransition: i + 1
            });
        }
    });
    
    console.log("Generated nodes:", nodes);
    console.log("Generated links:", links);
    
    return { nodes, links, personColors };
}

const { nodes: dataNodes, links: dataLinks, personColors } = generateSankeyData(personPaths, nodeRows);

const data = {
    nodes: dataNodes,
    links: dataLinks
};

// ============================================
// CUSTOM LAYOUT WITH FIXED ROWS
// ============================================

function customLayoutWithFixedRows(data, width, height) {
    const { nodes, links } = data;
    
    // Find the range of stages (horizontal position)
    const stages = [...new Set(nodes.map(n => n.stage))].sort((a, b) => a - b);
    const minStage = stages[0];
    const maxStage = stages[stages.length - 1];
    
    // Calculate x positions for each stage
    const stageWidth = (width - 300) / (maxStage - minStage);
    
    // Find max stage for targets to align them
    const targetNodes = nodes.filter(n => n.isTarget);
    const maxTargetStage = targetNodes.length > 0 ? Math.max(...targetNodes.map(n => n.stage)) : maxStage;
    
    // Find the range of rows (vertical position)
    const rows = nodes.map(n => n.row);
    const maxRow = Math.max(...rows);
    
    // Calculate positions
    const rowHeight = (height - 100) / (maxRow + 1);
    const nodeWidth = 20;
    const nodeHeight = 35;
    
    nodes.forEach((node, i) => {
        node.index = i;
        
        // X position based on stage
        if (node.isTarget) {
            // All targets align at the same x position (rightmost)
            node.x0 = 100 + (maxTargetStage - minStage) * stageWidth;
        } else {
            const normalizedStage = node.stage - minStage;
            node.x0 = 100 + normalizedStage * stageWidth;
        }
        node.x1 = node.x0 + nodeWidth;
        
        // Y position based on row (fixed vertical position)
        node.y0 = 50 + node.row * rowHeight;
        node.y1 = node.y0 + nodeHeight;
    });
    
    // Process links
    links.forEach(link => {
        const source = nodes[link.source];
        const target = nodes[link.target];
        
        link.source = source;
        link.target = target;
        link.width = link.value * 2; // Scale the width
        link.y0 = source.y0 + (source.y1 - source.y0) / 2;
        link.y1 = target.y0 + (target.y1 - target.y0) / 2;
    });
    
    return { nodes, links };
}

// ============================================
// VISUALIZATION
// ============================================

const width = 1400;
const height = 500;

console.log("Input data:", data);

const { nodes, links } = customLayoutWithFixedRows(data, width, height);

console.log("Layout nodes:", nodes);
console.log("Layout links:", links);

const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

console.log("SVG created");

// Use the stageTransition for animation stages
const linksWithStages = links.map(link => ({
    ...link,
    animationStage: link.stageTransition
}));

console.log("Links with stages:", linksWithStages);

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

console.log("Links drawn:", linkPaths.size());

// Animate links by stage
const animationDuration = 1000;
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
        // Check if this node is a person
        if (personColors[d.name]) return personColors[d.name];
        // Targets in a different color
        if (d.isTarget) return "#666";
        return "#999";  // neutral gray for collections
    })
    .attr("rx", 5)  // rounded corners
    .attr("opacity", 0);

console.log("Nodes drawn:", nodeRects.size());

// Animate nodes
nodeRects.transition()
    .delay(d => (d.stage + 1) * animationDuration * 0.7)
    .duration(500)
    .attr("opacity", 1);

// Add labels
const labels = svg.append("g")
    .selectAll("text")
    .data(nodes)
    .join("text")
    .attr("x", d => d.x1 + 8)
    .attr("y", d => (d.y0 + d.y1) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "start")
    .text(d => d.name)
    .style("font-size", "13px")
    .style("font-family", "sans-serif")
    .style("font-weight", d => personColors[d.name] ? "bold" : "normal")
    .attr("opacity", 0);

console.log("Labels drawn:", labels.size());

// Animate labels
labels.transition()
    .delay(d => (d.stage + 1) * animationDuration * 0.7)
    .duration(500)
    .attr("opacity", 1);

console.log("Animation setup complete");
