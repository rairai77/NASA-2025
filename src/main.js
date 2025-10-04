import * as d3 from "d3";
import { nodeRows, personPaths, animationSettings, rowColors } from "./sankey/config.js";
import { generateSankeyData } from "./sankey/dataGenerator.js";
import { customLayoutWithFixedRows } from "./sankey/layout.js";
import { renderDiagram } from "./sankey/renderer.js";
import { animateCircles } from "./sankey/circleAnimation.js";

// ============================================
// MAIN EXECUTION
// ============================================

// Generate the Sankey data
const { nodes: dataNodes, links: dataLinks, personColors, personLinkChains } = generateSankeyData(personPaths, nodeRows);

const data = {
    nodes: dataNodes,
    links: dataLinks
};

// Visualization dimensions - adjusted for 9 hours
const width = 1600;  // Reduced from 1800 (fewer hours = less width needed)
const height = 700;  // Reduced slightly

// Apply layout
const { nodes, links } = customLayoutWithFixedRows(data, width, height);

// Create SVG
const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

// Render the diagram (links, nodes, labels) - pass nodeRows and rowColors
const { linkPaths } = renderDiagram(svg, nodes, links, personColors, animationSettings.linkDrawDuration, nodeRows, rowColors);

// Animate circles walking the paths
animateCircles(svg, nodes, links, linkPaths, personColors, personLinkChains, animationSettings);

console.log("9-hour workday Sankey diagram initialized");
