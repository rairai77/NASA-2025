import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as d3 from "d3";
import './style.css';
import { ConfigUI } from './ConfigUI.jsx';
import { generateSankeyData } from "./sankey/dataGenerator.js";
import { customLayoutWithFixedRows } from "./sankey/layout.js";
import { renderDiagram } from "./sankey/renderer.js";
import { animateCircles } from "./sankey/circleAnimation.js";
import { animationSettings } from "./sankey/config.js";

function App() {
    const [mode, setMode] = useState('config'); // 'config' or 'chart'
    const [config, setConfig] = useState(null);

    const handleConfigSubmit = (submittedConfig) => {
        setConfig(submittedConfig);
        setMode('chart');
        
        // Small delay to let React render the chart div
        setTimeout(() => renderSankeyChart(submittedConfig), 100);
    };

    const handleBackToConfig = () => {
        // Clear the chart
        d3.select("#chart").selectAll("*").remove();
        setMode('config');
    };

    return (
        <div>
            {mode === 'config' && (
                <ConfigUI onSubmit={handleConfigSubmit} />
            )}
            {mode === 'chart' && (
                <div style={{
                    minHeight: '100vh',
                    background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
                    backgroundImage: `
                        radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%),
                        radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 60px 70px, #fff, rgba(0,0,0,0)),
                        radial-gradient(1px 1px at 50px 50px, #fff, rgba(0,0,0,0)),
                        radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 90px 10px, #fff, rgba(0,0,0,0))
                    `,
                    backgroundSize: '100% 100%, 200px 200px, 200px 200px, 200px 200px, 200px 200px, 200px 200px',
                    backgroundRepeat: 'no-repeat, repeat, repeat, repeat, repeat, repeat',
                    padding: '0'
                }}>
                    {/* Header Bar */}
                    <div style={{
                        background: 'rgba(10, 14, 39, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderBottom: '1px solid rgba(100,150,255,0.2)',
                        padding: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        boxShadow: '0 2px 20px rgba(0,0,0,0.5), 0 0 100px rgba(33,150,243,0.1)'
                    }}>
                        <button 
                            onClick={handleBackToConfig}
                            style={{
                                padding: '10px 20px',
                                background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 2px 8px rgba(33, 150, 243, 0.4)',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 4px 12px rgba(33, 150, 243, 0.6)';
                            }}
                            onMouseOut={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = '0 2px 8px rgba(33, 150, 243, 0.4)';
                            }}
                        >
                            <span style={{ fontSize: '18px' }}>←</span>
                            <span>Back to Editor</span>
                        </button>
                        
                        <div>
                            <h1 style={{ 
                                margin: 0, 
                                fontSize: '24px', 
                                fontWeight: '700',
                                color: 'white',
                                textShadow: '0 0 20px rgba(33,150,243,0.5)'
                            }}>
                                🛰️ Space Habitat Activity Flow
                            </h1>
                            <p style={{ 
                                margin: '4px 0 0 0', 
                                fontSize: '14px', 
                                color: 'rgba(255,255,255,0.7)',
                                fontWeight: '500'
                            }}>
                                Tracking crew movements across habitat modules
                            </p>
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div style={{
                        padding: '20px 0',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start'
                    }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            borderRadius: '16px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 100px rgba(33,150,243,0.2)',
                            padding: '30px 20px',
                            display: 'inline-block',
                            border: '1px solid rgba(33,150,243,0.3)'
                        }}>
                            <div id="chart"></div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div style={{
                        textAlign: 'center',
                        padding: '20px',
                        color: 'rgba(255,255,255,0.8)',
                        fontSize: '14px'
                    }}>
                        <p style={{ margin: 0 }}>
                            Each colored path represents a crew member's journey through different habitat modules during their day
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}

function renderSankeyChart(config) {
    const { personPaths, nodeRows, rowColors } = config;

    // Generate the Sankey data
    const { nodes: dataNodes, links: dataLinks, personColors, personLinkChains } = generateSankeyData(personPaths, nodeRows);

    const data = {
        nodes: dataNodes,
        links: dataLinks
    };

    // Visualization dimensions
    const width = 1600;
    const height = 700;

    // Apply layout
    const { nodes, links } = customLayoutWithFixedRows(data, width, height);

    // Create SVG
    const svg = d3
        .select("#chart")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    // Render the diagram
    const { linkPaths } = renderDiagram(svg, nodes, links, personColors, animationSettings.linkDrawDuration, nodeRows, rowColors);

    // Animate astronauts
    animateCircles(svg, nodes, links, linkPaths, personColors, personLinkChains, animationSettings);

    console.log("Sankey diagram rendered from config");
}

// Mount the React app
const root = createRoot(document.getElementById('root'));
root.render(<App />);
