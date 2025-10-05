import React, { useState, useEffect } from 'react';
import { defaults } from './defaults.js';

export function ConfigUI({ onSubmit }) {
    const [numPeople, setNumPeople] = useState(defaults.numberOfPeople);
    const [numHours, setNumHours] = useState(defaults.numberOfHours);
    const [schedule, setSchedule] = useState(() => {
        // Initialize empty schedule
        const initial = {};
        for (let i = 0; i < defaults.numberOfPeople; i++) {
            const personKey = `Crew ${String.fromCharCode(65 + i)}`;
            initial[personKey] = Array(defaults.numberOfHours).fill(null);
        }
        return initial;
    });
    const [isMobile, setIsMobile] = useState(false);
    const [currentPersonIndex, setCurrentPersonIndex] = useState(0);

    // Detect mobile
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Update schedule when people/hours change
    const updateScheduleSize = (newPeople, newHours) => {
        const newSchedule = {};
        for (let i = 0; i < newPeople; i++) {
            const personKey = `Crew ${String.fromCharCode(65 + i)}`;
            newSchedule[personKey] = Array(newHours).fill(null);
            
            // Copy existing data if available
            if (schedule[personKey]) {
                for (let j = 0; j < Math.min(schedule[personKey].length, newHours); j++) {
                    newSchedule[personKey][j] = schedule[personKey][j];
                }
            }
        }
        setSchedule(newSchedule);
    };

    const handlePeopleChange = (e) => {
        const newNum = parseInt(e.target.value);
        setNumPeople(newNum);
        updateScheduleSize(newNum, numHours);
        if (currentPersonIndex >= newNum) {
            setCurrentPersonIndex(0);
        }
    };

    const handleHoursChange = (e) => {
        const newNum = parseInt(e.target.value);
        setNumHours(newNum);
        updateScheduleSize(numPeople, newNum);
    };

    const handleDrop = (person, hour, room) => {
        setSchedule(prev => ({
            ...prev,
            [person]: prev[person].map((r, idx) => idx === hour ? room : r)
        }));
    };

    const handleMobileRoomSelect = (person, hour, room) => {
        setSchedule(prev => ({
            ...prev,
            [person]: prev[person].map((r, idx) => idx === hour ? room : r)
        }));
    };

    const clearSchedule = () => {
        setSchedule(prev => {
            const newSchedule = {};
            Object.keys(prev).forEach(person => {
                newSchedule[person] = Array(numHours).fill(null);
            });
            return newSchedule;
        });
    };

    const clearPerson = (person) => {
        setSchedule(prev => ({
            ...prev,
            [person]: Array(numHours).fill(null)
        }));
    };

    const randomFill = () => {
        const newSchedule = {};
        Object.keys(schedule).forEach(person => {
            newSchedule[person] = Array(numHours).fill(null).map(() => {
                const randomIndex = Math.floor(Math.random() * defaults.availableRooms.length);
                return defaults.availableRooms[randomIndex];
            });
        });
        setSchedule(newSchedule);
    };

    const isScheduleComplete = () => {
        return Object.values(schedule).every(personSchedule => 
            personSchedule.every(slot => slot !== null)
        );
    };

    const getCompletionPercentage = () => {
        const totalSlots = Object.keys(schedule).length * numHours;
        const filledSlots = Object.values(schedule).flat().filter(slot => slot !== null).length;
        return Math.round((filledSlots / totalSlots) * 100);
    };

    const handleVisualize = (visualizationType) => {
        if (!isScheduleComplete()) return;

        const personPaths = {};
        const nodeRows = {};
        
        const usedRooms = new Set();
        Object.values(schedule).forEach(hours => {
            hours.forEach(room => usedRooms.add(room));
        });
        const usedRoomsArray = Array.from(usedRooms);

        Object.entries(schedule).forEach(([person, hours], personIdx) => {
            nodeRows[person] = personIdx;
            nodeRows[`-Target-${person}`] = personIdx;
            
            const path = [...hours, `-Target-${person}`];
            
            personPaths[person] = {
                path,
                color: defaults.personColors[personIdx % defaults.personColors.length],
                value: 8
            };
        });

        usedRoomsArray.forEach((room, roomIdx) => {
            nodeRows[room] = roomIdx;
        });

        const rowColors = {};
        const allRowNumbers = [...new Set(Object.values(nodeRows))];
        const maxRow = Math.max(...allRowNumbers);
        
        for (let i = 0; i <= maxRow; i++) {
            rowColors[i] = defaults.rowColors[i % Object.keys(defaults.rowColors).length];
        }

        onSubmit({ personPaths, nodeRows, rowColors }, visualizationType);
    };

    const people = Object.keys(schedule);
    const completionPercentage = getCompletionPercentage();
    const currentPerson = people[currentPersonIndex];

    if (isMobile) {
        return <MobileConfigUI 
            numPeople={numPeople}
            numHours={numHours}
            schedule={schedule}
            currentPersonIndex={currentPersonIndex}
            setCurrentPersonIndex={setCurrentPersonIndex}
            handlePeopleChange={handlePeopleChange}
            handleHoursChange={handleHoursChange}
            handleMobileRoomSelect={handleMobileRoomSelect}
            clearPerson={clearPerson}
            clearSchedule={clearSchedule}
            randomFill={randomFill}
            handleVisualize={handleVisualize}
            isScheduleComplete={isScheduleComplete}
            completionPercentage={completionPercentage}
            people={people}
            currentPerson={currentPerson}
        />;
    }

    return (
        <DesktopConfigUI 
            numPeople={numPeople}
            numHours={numHours}
            schedule={schedule}
            handlePeopleChange={handlePeopleChange}
            handleHoursChange={handleHoursChange}
            handleDrop={handleDrop}
            clearPerson={clearPerson}
            clearSchedule={clearSchedule}
            randomFill={randomFill}
            handleVisualize={handleVisualize}
            isScheduleComplete={isScheduleComplete}
            completionPercentage={completionPercentage}
            people={people}
        />
    );
}

// MOBILE UI
function MobileConfigUI({
    numPeople, numHours, schedule, currentPersonIndex, setCurrentPersonIndex,
    handlePeopleChange, handleHoursChange, handleMobileRoomSelect, clearPerson,
    clearSchedule, randomFill, handleVisualize, isScheduleComplete, completionPercentage,
    people, currentPerson
}) {
    return (
        <div style={{ 
            minHeight: '100vh',
            background: 'radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%)',
            padding: '10px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)',
                padding: '20px 15px',
                color: 'white',
                borderRadius: '12px',
                marginBottom: '15px'
            }}>
                <h1 style={{ margin: '0 0 5px 0', fontSize: '24px', fontWeight: '700' }}>
                    🛰️ CrossPaths
                </h1>
                <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
                    Schedule builder
                </p>
            </div>

            {/* Controls */}
            <div style={{ 
                background: 'white',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '15px'
            }}>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6c757d', marginBottom: '5px' }}>
                            CREW
                        </label>
                        <input 
                            type="number" 
                            min="1" 
                            max="10" 
                            value={numPeople} 
                            onChange={handlePeopleChange}
                            style={{ 
                                width: '100%',
                                padding: '10px',
                                border: '2px solid #dee2e6',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: '600', color: '#6c757d', marginBottom: '5px' }}>
                            HOURS
                        </label>
                        <input 
                            type="number" 
                            min="1" 
                            max="12" 
                            value={numHours} 
                            onChange={handleHoursChange}
                            style={{ 
                                width: '100%',
                                padding: '10px',
                                border: '2px solid #dee2e6',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: '600'
                            }}
                        />
                    </div>
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#6c757d' }}>PROGRESS</span>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#495057' }}>{completionPercentage}%</span>
                    </div>
                    <div style={{ position: 'relative', height: '8px', background: '#e9ecef', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${completionPercentage}%`,
                            background: completionPercentage === 100 
                                ? 'linear-gradient(90deg, #4caf50, #66bb6a)' 
                                : 'linear-gradient(90deg, #2196f3, #42a5f5)',
                            transition: 'width 0.3s ease'
                        }}></div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={clearSchedule}
                        style={{ 
                            flex: '1 1 auto',
                            padding: '10px 12px',
                            background: 'white',
                            border: '2px solid #dee2e6',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px'
                        }}
                    >
                        🗑️ Clear
                    </button>
                    <button 
                        onClick={randomFill}
                        style={{ 
                            flex: '1 1 auto',
                            padding: '10px 12px',
                            background: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '600',
                            fontSize: '13px'
                        }}
                    >
                        🎲 Random
                    </button>
                </div>
            </div>

            {/* Person Navigator */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '15px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <button
                        onClick={() => setCurrentPersonIndex(Math.max(0, currentPersonIndex - 1))}
                        disabled={currentPersonIndex === 0}
                        style={{
                            padding: '8px 12px',
                            background: currentPersonIndex === 0 ? '#e9ecef' : '#2196f3',
                            color: currentPersonIndex === 0 ? '#adb5bd' : 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: currentPersonIndex === 0 ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '18px'
                        }}
                    >
                        ←
                    </button>
                    <div style={{ 
                        flex: 1, 
                        textAlign: 'center',
                        background: defaults.personColors[currentPersonIndex % defaults.personColors.length] + '20',
                        padding: '12px',
                        borderRadius: '8px',
                        margin: '0 10px'
                    }}>
                        <div style={{ 
                            fontSize: '18px', 
                            fontWeight: '700',
                            color: defaults.personColors[currentPersonIndex % defaults.personColors.length]
                        }}>
                            {currentPerson}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '2px' }}>
                            {currentPersonIndex + 1} of {numPeople}
                        </div>
                    </div>
                    <button
                        onClick={() => setCurrentPersonIndex(Math.min(numPeople - 1, currentPersonIndex + 1))}
                        disabled={currentPersonIndex === numPeople - 1}
                        style={{
                            padding: '8px 12px',
                            background: currentPersonIndex === numPeople - 1 ? '#e9ecef' : '#2196f3',
                            color: currentPersonIndex === numPeople - 1 ? '#adb5bd' : 'white',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: currentPersonIndex === numPeople - 1 ? 'not-allowed' : 'pointer',
                            fontWeight: '600',
                            fontSize: '18px'
                        }}
                    >
                        →
                    </button>
                </div>
                <button
                    onClick={() => clearPerson(currentPerson)}
                    style={{
                        width: '100%',
                        padding: '10px',
                        background: 'white',
                        border: '2px solid #dee2e6',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        fontSize: '13px'
                    }}
                >
                    Clear This Person
                </button>
            </div>

            {/* Hour Schedule */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '15px'
            }}>
                <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', fontWeight: '700' }}>
                    📅 Hourly Schedule
                </h3>
                {Array.from({ length: numHours }, (_, hour) => (
                    <div key={hour} style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '6px' }}>
                            Hour {hour + 1}
                        </label>
                        <select
                            value={schedule[currentPerson][hour] || ''}
                            onChange={(e) => handleMobileRoomSelect(currentPerson, hour, e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                border: '2px solid #dee2e6',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: '600',
                                background: schedule[currentPerson][hour] ? '#2196f3' : 'white',
                                color: schedule[currentPerson][hour] ? 'white' : '#495057',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="">Select room...</option>
                            {defaults.availableRooms.map(room => (
                                <option key={room} value={room}>{room}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            {/* Visualize Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    onClick={() => handleVisualize('chart')} 
                    disabled={!isScheduleComplete()}
                    style={{ 
                        flex: 1,
                        padding: '14px',
                        background: isScheduleComplete() 
                            ? 'linear-gradient(135deg, #2196f3, #42a5f5)' 
                            : '#dee2e6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: isScheduleComplete() ? 'pointer' : 'not-allowed',
                        fontWeight: '700',
                        fontSize: '14px'
                    }}
                >
                    📊 Flow Chart
                </button>
            </div>
        </div>
    );
}

// DESKTOP UI
function DesktopConfigUI({
    numPeople, numHours, schedule, handlePeopleChange, handleHoursChange,
    handleDrop, clearPerson, clearSchedule, randomFill, handleVisualize,
    isScheduleComplete, completionPercentage, people
}) {
    return (
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
            padding: '20px 10px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div style={{ 
                maxWidth: '100%', 
                margin: '0 auto',
                background: 'rgba(255, 255, 255, 0.98)',
                borderRadius: '16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 100px rgba(100,150,255,0.3)',
                overflow: 'hidden',
                border: '1px solid rgba(100,150,255,0.3)'
            }}>
                {/* Header */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)',
                    padding: '30px 20px',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 20% 50%, rgba(100,150,255,0.1) 0%, transparent 50%)',
                        pointerEvents: 'none'
                    }}></div>
                    <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', fontWeight: '700', position: 'relative', zIndex: 1 }}>
                        🛰️ CrossPaths for Space Habitats
                    </h1>
                    <p style={{ margin: 0, fontSize: '16px', opacity: 0.9, position: 'relative', zIndex: 1 }}>
                        Designate crew activities across habitat modules and visualize daily routines
                    </p>
                </div>

                {/* Controls Bar */}
                <div style={{ 
                    padding: '20px',
                    background: '#f8f9fa',
                    borderBottom: '1px solid #e9ecef'
                }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '20px' }}>
                        <div style={{ flex: '0 0 auto' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '5px' }}>
                                CREW MEMBERS
                            </label>
                            <input 
                                type="number" 
                                min="1" 
                                max="10" 
                                value={numPeople} 
                                onChange={handlePeopleChange}
                                style={{ 
                                    width: '80px', 
                                    padding: '10px',
                                    border: '2px solid #dee2e6',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}
                            />
                        </div>
                        
                        <div style={{ flex: '0 0 auto' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '5px' }}>
                                HOURS
                            </label>
                            <input 
                                type="number" 
                                min="1" 
                                max="12" 
                                value={numHours} 
                                onChange={handleHoursChange}
                                style={{ 
                                    width: '80px', 
                                    padding: '10px',
                                    border: '2px solid #dee2e6',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600'
                                }}
                            />
                        </div>

                        <div style={{ flex: 1, minWidth: '200px' }}>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '5px' }}>
                                SCHEDULE PROGRESS
                            </label>
                            <div style={{ position: 'relative', height: '44px', background: '#e9ecef', borderRadius: '8px', overflow: 'hidden' }}>
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    height: '100%',
                                    width: `${completionPercentage}%`,
                                    background: completionPercentage === 100 
                                        ? 'linear-gradient(90deg, #4caf50, #66bb6a)' 
                                        : 'linear-gradient(90deg, #2196f3, #42a5f5)',
                                    transition: 'width 0.3s ease'
                                }}></div>
                                <div style={{
                                    position: 'absolute',
                                    left: 0,
                                    top: 0,
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: '700',
                                    color: completionPercentage > 50 ? 'white' : '#495057',
                                    fontSize: '14px'
                                }}>
                                    {completionPercentage}% Complete
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: '0 0 auto', display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                            <button 
                                onClick={clearSchedule}
                                style={{ 
                                    padding: '12px 20px',
                                    background: 'white',
                                    border: '2px solid #dee2e6',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.target.style.background = '#f8f9fa'}
                                onMouseOut={(e) => e.target.style.background = 'white'}
                            >
                                🗑️ Clear All
                            </button>
                            
                            <button 
                                onClick={randomFill}
                                style={{ 
                                    padding: '12px 20px',
                                    background: '#ff9800',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    transition: 'all 0.2s',
                                    boxShadow: '0 2px 8px rgba(255,152,0,0.3)'
                                }}
                                onMouseOver={(e) => {
                                    e.target.style.background = '#fb8c00';
                                    e.target.style.transform = 'translateY(-2px)';
                                    e.target.style.boxShadow = '0 4px 12px rgba(255,152,0,0.4)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.background = '#ff9800';
                                    e.target.style.transform = 'translateY(0)';
                                    e.target.style.boxShadow = '0 2px 8px rgba(255,152,0,0.3)';
                                }}
                            >
                                🎲 Random Fill
                            </button>
                            
                            <button 
                                onClick={() => handleVisualize('chart')} 
                                disabled={!isScheduleComplete()}
                                style={{ 
                                    padding: '12px 20px',
                                    background: isScheduleComplete() 
                                        ? 'linear-gradient(135deg, #2196f3, #42a5f5)' 
                                        : '#dee2e6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    cursor: isScheduleComplete() ? 'pointer' : 'not-allowed',
                                    fontWeight: '700',
                                    fontSize: '14px',
                                    transition: 'all 0.2s',
                                    boxShadow: isScheduleComplete() ? '0 2px 8px rgba(33,150,243,0.3)' : 'none'
                                }}
                                onMouseOver={(e) => {
                                    if (isScheduleComplete()) {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = '0 4px 12px rgba(33,150,243,0.4)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (isScheduleComplete()) {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = '0 2px 8px rgba(33,150,243,0.3)';
                                    }
                                }}
                            >
                                📊 Visualize Flow
                            </button>
                        </div>
                    </div>

                    {/* Module Palette - Horizontal */}
                    <div>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#6c757d', marginBottom: '10px' }}>
                            🛰️ HABITAT MODULES (drag to schedule)
                        </label>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '10px',
                            padding: '15px',
                            background: 'white',
                            borderRadius: '8px',
                            border: '2px dashed #dee2e6'
                        }}>
                            {defaults.availableRooms.map(room => (
                                <RoomTile key={room} room={room} />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Schedule Table - Scrollable */}
                <div style={{ padding: '20px' }}>
                    <h3 style={{ margin: '0 0 15px 0', fontSize: '18px', fontWeight: '700', color: '#495057' }}>
                        📅 Daily Activity Schedule
                    </h3>
                    <div style={{ 
                        borderRadius: '12px',
                        overflow: 'auto',
                        border: '1px solid #dee2e6',
                        background: 'white',
                        maxHeight: '600px'
                    }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ 
                                        border: '1px solid #dee2e6', 
                                        padding: '16px',
                                        background: '#f8f9fa',
                                        color: '#495057',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        textAlign: 'left',
                                        position: 'sticky',
                                        left: 0,
                                        zIndex: 10
                                    }}>
                                        Crew Member
                                    </th>
                                    {Array.from({ length: numHours }, (_, i) => (
                                        <th key={i} style={{ 
                                            border: '1px solid #dee2e6', 
                                            padding: '16px',
                                            background: '#f8f9fa',
                                            color: '#495057',
                                            fontWeight: '700',
                                            fontSize: '14px',
                                            minWidth: '140px'
                                        }}>
                                            Hour {i + 1}
                                        </th>
                                    ))}
                                    <th style={{ 
                                        border: '1px solid #dee2e6', 
                                        padding: '16px',
                                        background: '#f8f9fa',
                                        color: '#495057',
                                        fontWeight: '700',
                                        fontSize: '14px',
                                        position: 'sticky',
                                        right: 0,
                                        zIndex: 10
                                    }}>
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {people.map((person, personIdx) => (
                                    <tr key={person}>
                                        <td style={{ 
                                            border: '1px solid #dee2e6', 
                                            padding: '12px 16px',
                                            fontWeight: '700',
                                            background: defaults.personColors[personIdx] + '15',
                                            color: defaults.personColors[personIdx],
                                            position: 'sticky',
                                            left: 0,
                                            zIndex: 5
                                        }}>
                                            {person}
                                        </td>
                                        {schedule[person].map((room, hour) => (
                                            <DropCell 
                                                key={`${person}-${hour}`}
                                                person={person}
                                                hour={hour}
                                                room={room}
                                                onDrop={handleDrop}
                                            />
                                        ))}
                                        <td style={{ 
                                            border: '1px solid #dee2e6', 
                                            padding: '12px 16px', 
                                            textAlign: 'center',
                                            background: 'white',
                                            position: 'sticky',
                                            right: 0,
                                            zIndex: 5
                                        }}>
                                            <button 
                                                onClick={() => clearPerson(person)}
                                                style={{ 
                                                    padding: '6px 12px',
                                                    fontSize: '12px',
                                                    cursor: 'pointer',
                                                    background: 'white',
                                                    border: '1px solid #dee2e6',
                                                    borderRadius: '6px',
                                                    fontWeight: '600',
                                                    color: '#6c757d'
                                                }}
                                            >
                                                Clear
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Draggable module tile component
function RoomTile({ room }) {
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDragStart = (e) => {
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', room);
        setIsDragging(true);
    };

    const handleDragEnd = () => {
        setIsDragging(false);
    };

    return (
        <div
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            style={{
                padding: '10px 16px',
                background: isDragging ? '#1976d2' : '#2196f3',
                color: 'white',
                borderRadius: '8px',
                cursor: 'grab',
                userSelect: 'none',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '13px',
                transition: 'all 0.2s',
                boxShadow: isDragging ? '0 4px 12px rgba(33,150,243,0.4)' : '0 2px 6px rgba(33,150,243,0.3)',
                transform: isDragging ? 'scale(0.95)' : 'scale(1)',
                whiteSpace: 'nowrap'
            }}
        >
            {room}
        </div>
    );
}

// Droppable cell component
function DropCell({ person, hour, room, onDrop }) {
    const [isDragOver, setIsDragOver] = React.useState(false);

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const roomName = e.dataTransfer.getData('text/plain');
        onDrop(person, hour, roomName);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    return (
        <td
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            style={{
                border: '1px solid #dee2e6',
                padding: '8px',
                minWidth: '140px',
                height: '60px',
                background: isDragOver 
                    ? 'linear-gradient(135deg, #e3f2fd, #bbdefb)' 
                    : (room ? '#f8f9fa' : 'white'),
                transition: 'all 0.2s',
                position: 'relative'
            }}
        >
            {room ? (
                <div style={{
                    padding: '8px 12px',
                    background: '#2196f3',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    textAlign: 'center',
                    boxShadow: '0 2px 4px rgba(33,150,243,0.3)'
                }}>
                    {room}
                </div>
            ) : (
                <div style={{
                    padding: '8px',
                    color: '#adb5bd',
                    fontSize: '11px',
                    textAlign: 'center',
                    fontStyle: 'italic'
                }}>
                    Drop here
                </div>
            )}
        </td>
    );
}
