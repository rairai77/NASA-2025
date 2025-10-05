import React, { useState, useEffect } from 'react';
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
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleConfigSubmit = (submittedConfig, visualizationType) => {
        setConfig(submittedConfig);
        setMode('chart');
        
        // Small delay to let React render the chart div
        setTimeout(() => renderSankeyChart(submittedConfig, isMobile), 100);
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
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
                    backgroundImage: isMobile ? 'none' : `
                        radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%),
                        radial-gradient(2px 2px at 20px 30px, #eee, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 60px 70px, #fff, rgba(0,0,0,0)),
                        radial-gradient(1px 1px at 50px 50px, #fff, rgba(0,0,0,0)),
                        radial-gradient(1px 1px at 130px 80px, #fff, rgba(0,0,0,0)),
                        radial-gradient(2px 2px at 90px 10px, #fff, rgba(0,0,0,0))
                    `,
                    backgroundSize: '100% 100%, 200px 200px, 200px 200px, 200px 200px, 200px 200px, 200px 200px',
                    backgroundRepeat: 'no-repeat, repeat, repeat, repeat, repeat, repeat',
                    overflow: 'hidden'
                }}>
                    {/* Header Bar */}
                    <div style={{
                        background: 'rgba(10, 14, 39, 0.95)',
                        backdropFilter: 'blur(10px)',
                        borderBottom: '1px solid rgba(100,150,255,0.2)',
                        padding: isMobile ? '15px' : '20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: isMobile ? '10px' : '20px',
                        boxShadow: '0 2px 20px rgba(0,0,0,0.5), 0 0 100px rgba(33,150,243,0.1)',
                        flexShrink: 0
                    }}>
                        <button 
                            onClick={handleBackToConfig}
                            style={{
                                padding: isMobile ? '8px 12px' : '10px 20px',
                                background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: isMobile ? '12px' : '14px',
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
                            <span>{isMobile ? 'Back' : 'Back to Editor'}</span>
                        </button>
                        
                        <div>
                            <h1 style={{ 
                                margin: 0, 
                                fontSize: isMobile ? '18px' : '24px', 
                                fontWeight: '700',
                                color: 'white',
                                textShadow: '0 0 20px rgba(33,150,243,0.5)'
                            }}>
                                🛰️ {isMobile ? 'Activity Flow' : 'Space Habitat Activity Flow'}
                            </h1>
                            {!isMobile && (
                                <p style={{ 
                                    margin: '4px 0 0 0', 
                                    fontSize: '14px', 
                                    color: 'rgba(255,255,255,0.7)',
                                    fontWeight: '500'
                                }}>
                                    Tracking crew movements across habitat modules in orbit
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div style={{
                        flex: 1,
                        padding: isMobile ? '10px' : '20px',
                        display: 'flex',
                        justifyContent: isMobile ? 'flex-start' : 'center',
                        alignItems: 'center',
                        overflowX: 'auto',
                        overflowY: 'auto'
                    }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.98)',
                            borderRadius: isMobile ? '12px' : '16px',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 100px rgba(33,150,243,0.2)',
                            padding: isMobile ? '15px 10px' : '30px 20px',
                            border: '1px solid rgba(33,150,243,0.3)',
                            display: 'inline-block'
                        }}>
                            <div id="chart"></div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    {!isMobile && (
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            color: 'rgba(255,255,255,0.8)',
                            fontSize: '14px',
                            flexShrink: 0
                        }}>
                            <p style={{ margin: 0 }}>
                                Each colored path represents a crew member's journey through different habitat modules during their day
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function renderSankeyChart(config, isMobile) {
    const { personPaths, nodeRows, rowColors } = config;

    // Generate the Sankey data
    const { nodes: dataNodes, links: dataLinks, personColors, personLinkChains } = generateSankeyData(personPaths, nodeRows);

    const data = {
        nodes: dataNodes,
        links: dataLinks
    };

    // Visualization dimensions - adjust for mobile
    const width = isMobile ? Math.max(window.innerWidth - 40, 1000) : 1600;
    const height = isMobile ? 500 : 700;

    // Apply layout - pass isMobile parameter
    const { nodes, links } = customLayoutWithFixedRows(data, width, height, isMobile);

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
    
    // On mobile, scroll to show the left side first
    if (isMobile) {
        setTimeout(() => {
            const chartContainer = document.getElementById('chart').parentElement.parentElement;
            chartContainer.scrollLeft = 0;
        }, 200);
    }
}

// Mount the React app
const root = createRoot(document.getElementById('root'));
root.render(<App />);
