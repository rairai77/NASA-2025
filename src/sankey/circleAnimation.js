import * as d3 from "d3";

// ============================================
// ANIMATED ASTRONAUTS WALKING THE PATHS
// ============================================

export function animateCircles(svg, nodes, links, linkPaths, personColors, personLinkChains, animationSettings) {
    const { linkDrawDuration, circleTravelDuration, nodePauseDuration, diagramCompleteBuffer } = animationSettings;
    
    // Calculate when the diagram drawing is complete
    const maxStage = Math.max(...links.map(l => l.stageTransition));
    const diagramCompleteTime = (maxStage + 1) * linkDrawDuration + diagramCompleteBuffer;

    // Find the leftmost X position of all person nodes for synchronized start
    const personNodes = nodes.filter(n => n.isPerson);
    const startX = Math.min(...personNodes.map(n => n.x0));

    // Find the longest path to synchronize arrival times
    const maxPathLength = Math.max(...Object.values(personLinkChains).map(chain => chain.length));

    // Create group for astronauts
    const astronautGroup = svg.append("g");

    // Function to animate an astronaut along a person's path
    function animatePersonPath(person, linkChain, startDelay) {
        const color = personColors[person];
        
        // Get the person's row
        const personNode = nodes.find(n => n.name === person);
        const personY = personNode.y0 + (personNode.y1 - personNode.y0) / 2;
        
        // Create an astronaut (image instead of emoji)
        const astronautSize = 30;  // Size of the astronaut image
        const astronaut = astronautGroup.append("image")
            .attr("href", "/astronaut.png")  // Path to astronaut image
            .attr("width", astronautSize)
            .attr("height", astronautSize)
            .attr("opacity", 0);
        
        // Add a colored glow/shadow effect
        astronaut.style("filter", `drop-shadow(0 0 3px ${color})`);
        
        // Start position (synchronized X, at person's Y)
        // Center the image on the position
        astronaut.attr("x", startX - astronautSize / 2)
            .attr("y", personY - astronautSize / 2);
        
        // Fade in the astronaut
        astronaut.transition()
            .delay(startDelay)
            .duration(300)
            .attr("opacity", 1);
        
        let cumulativeDelay = startDelay + 300;
        
        // Calculate adjusted travel duration so all paths finish at the same time
        // Total time available for travel and pauses
        const totalAvailableTime = maxPathLength * circleTravelDuration + (maxPathLength - 1) * nodePauseDuration;
        const thisPathPauseTime = (linkChain.length - 1) * nodePauseDuration;
        const thisPathTravelTime = totalAvailableTime - thisPathPauseTime;
        const adjustedTravelDuration = thisPathTravelTime / linkChain.length;
        
        // Animate through each link in the chain
        linkChain.forEach((linkIdx, i) => {
            const link = links[linkIdx];
            
            // Get target node center (where we're going)
            const targetCenterX = link.target.x0 + (link.target.x1 - link.target.x0) / 2;
            const targetCenterY = link.target.y0 + (link.target.y1 - link.target.y0) / 2;
            
            // Animate smoothly to the target center (adjust for image centering)
            astronaut.transition()
                .delay(cumulativeDelay)
                .duration(adjustedTravelDuration)
                .ease(d3.easeCubicInOut)
                .attr("x", targetCenterX - astronautSize / 2)
                .attr("y", targetCenterY - astronautSize / 2);
            
            cumulativeDelay += adjustedTravelDuration;
            
            // Pause briefly at each node (except the last one)
            if (i < linkChain.length - 1) {
                cumulativeDelay += nodePauseDuration;
            }
        });
        
        // Fade out the astronaut at the end
        astronaut.transition()
            .delay(cumulativeDelay)
            .duration(300)
            .attr("opacity", 0)
            .on("end", function() {
                // Loop the animation
                setTimeout(() => animatePersonPath(person, linkChain, 0), 1000);
            });
    }

    // Start animating all person paths at the same time after diagram is complete
    Object.entries(personLinkChains).forEach(([person, linkChain]) => {
        animatePersonPath(person, linkChain, diagramCompleteTime);
    });
}
