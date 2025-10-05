// ============================================
// DATA GENERATION
// ============================================

export function generateSankeyData(personPaths, nodeRows) {
    const nodes = [];
    const nodeMap = new Map(); // (stage, collection) -> node index
    const links = [];
    const personColors = {};
    const personLinkChains = {}; // Track the chain of links for each person

    // First pass: determine what stage each collection appears at for each person
    Object.entries(personPaths).forEach(([person, config]) => {
        const { path, color, value } = config;
        personColors[person] = color;
        personLinkChains[person] = [];

        // Track which stage each collection appears at in this person's journey
        path.forEach((collection, stage) => {
            const key = `${stage}-${collection}`;
            if (!nodeMap.has(key)) {
                const nodeIndex = nodes.length;
                nodes.push({
                    name: collection.replace("-Target-", ""),
                    stage: stage, // horizontal position (stage in journey)
                    row: nodeRows[collection], // vertical position (fixed row)
                    id: key,
                    isTarget: collection.startsWith("-Target-"),
                    peopleHere: [], // Track which people visit this node
                });
                nodeMap.set(key, nodeIndex);
            }
            // Add this person to the node's visitor list
            const nodeIndex = nodeMap.get(key);
            if (!nodes[nodeIndex].peopleHere.includes(person)) {
                nodes[nodeIndex].peopleHere.push(person);
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
            isPerson: true,
            peopleHere: [person],
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

        const linkIdx = links.length;
        links.push({
            source: personIdx,
            target: firstIdx,
            value: value,
            person: person,
            stageTransition: 0,
        });
        personLinkChains[person].push(linkIdx);

        // Links between collections in the path
        for (let i = 0; i < path.length - 1; i++) {
            const sourceKey = `${i}-${path[i]}`;
            const targetKey = `${i + 1}-${path[i + 1]}`;
            const sourceIdx = nodeMap.get(sourceKey);
            const targetIdx = nodeMap.get(targetKey);

            const linkIdx = links.length;
            links.push({
                source: sourceIdx,
                target: targetIdx,
                value: value,
                person: person,
                stageTransition: i + 1,
            });
            personLinkChains[person].push(linkIdx);
        }
    });

    return { nodes, links, personColors, personLinkChains };
}
