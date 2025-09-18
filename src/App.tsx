import React, { useState, useEffect, useRef } from 'react';
import { Plus, Settings, Sun, Moon, Trash2, Edit3, X, ChevronUp, ChevronDown } from 'lucide-react';

const KanbanBoard = () => {
  const [boards, setBoards] = useState({
    work: {
      title: 'Work',
      tasks: {
        todo: [],
        inprogress: [],
        done: []
      },
      columnOrder: ['todo', 'inprogress', 'done'],
      columnTitles: {
        todo: 'To Do',
        inprogress: 'In Progress',
        done: 'Done'
      },
      collapsed: false,
      height: 400 // Default height in pixels
    },
    life: {
      title: 'Life',
      tasks: {
        todo: [],
        inprogress: [],
        done: []
      },
      columnOrder: ['todo', 'inprogress', 'done'],
      columnTitles: {
        todo: 'Personal',
        inprogress: 'Doing',
        done: 'Completed'
      },
      collapsed: false,
      height: 400 // Default height in pixels
    }
  });
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('blue');
  const [showSettings, setShowSettings] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const [draggedBoard, setDraggedBoard] = useState(null);
  const [draggedColumn, setDraggedColumn] = useState(null);
  const [draggedColumnIndex, setDraggedColumnIndex] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editingColumn, setEditingColumn] = useState(null);
  const [editingBoardTitle, setEditingBoardTitle] = useState(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [showNewTaskInput, setShowNewTaskInput] = useState('');
  const [boardOrder, setBoardOrder] = useState(['work', 'life']);
  const [draggedBoardId, setDraggedBoardId] = useState(null);

  
  const inputRef = useRef(null);
  const editInputRef = useRef(null);
  const columnEditRef = useRef(null);
  const boardTitleRef = useRef(null);

  const themes = {
    blue: { primary: 'bg-blue-500', secondary: 'bg-blue-100', accent: 'border-blue-300' },
    green: { primary: 'bg-green-500', secondary: 'bg-green-100', accent: 'border-green-300' },
    purple: { primary: 'bg-purple-500', secondary: 'bg-purple-100', accent: 'border-purple-300' },
    orange: { primary: 'bg-orange-500', secondary: 'bg-orange-100', accent: 'border-orange-300' },
    pink: { primary: 'bg-pink-500', secondary: 'bg-pink-100', accent: 'border-pink-300' }
  };

  // Initialize heights based on viewport
  useEffect(() => {
    const initializeHeights = () => {
      const viewportHeight = window.innerHeight;
      const headerHeight = 120; // Approximate header + settings height
      const availableHeight = viewportHeight - headerHeight - 100; // Leave some margin
      const boardHeight = Math.max(300, Math.floor(availableHeight / 2) - 40); // Split between boards with margin
      
      setBoards(prev => ({
        work: { ...prev.work, height: boardHeight },
        life: { ...prev.life, height: boardHeight }
      }));
    };

    initializeHeights();
    window.addEventListener('resize', initializeHeights);
    return () => window.removeEventListener('resize', initializeHeights);
  }, []);

  // Load data from memory on component mount
  useEffect(() => {
    const savedBoards = JSON.parse(localStorage.getItem('kanban-boards') || 'null');
    const savedTheme = localStorage.getItem('kanban-theme') || 'blue';
    const savedDarkMode = localStorage.getItem('kanban-darkmode') === 'true';
    const savedBoardOrder = JSON.parse(localStorage.getItem('kanban-board-order') || '["work","life"]');
    
    if (savedBoards) {
      // Merge saved data but keep initialized heights if not saved
      setBoards(prev => ({
        work: { ...prev.work, ...savedBoards.work, height: savedBoards.work?.height || prev.work.height },
        life: { ...prev.life, ...savedBoards.life, height: savedBoards.life?.height || prev.life.height }
      }));
    }
    setCurrentTheme(savedTheme);
    setIsDarkMode(savedDarkMode);
    setBoardOrder(savedBoardOrder);
  }, []);

  // Save data to memory whenever boards, theme, or dark mode changes
  useEffect(() => {
    localStorage.setItem('kanban-boards', JSON.stringify(boards));
  }, [boards]);

  useEffect(() => {
    localStorage.setItem('kanban-theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    localStorage.setItem('kanban-darkmode', isDarkMode.toString());
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem('kanban-board-order', JSON.stringify(boardOrder));
  }, [boardOrder]);



  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key.toLowerCase()) {
        case 'n':
          e.preventDefault();
          setShowNewTaskInput('work-todo');
          break;
        case 't':
          e.preventDefault();
          setIsDarkMode(!isDarkMode);
          break;
        case 's':
          e.preventDefault();
          setShowSettings(!showSettings);
          break;
        case 'escape':
          setShowSettings(false);
          setShowNewTaskInput('');
          setEditingTask(null);
          setEditingColumn(null);
          setEditingBoardTitle(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDarkMode, showSettings]);

  // Focus management
  useEffect(() => {
    if (showNewTaskInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showNewTaskInput]);

  useEffect(() => {
    if (editingTask && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingTask]);

  useEffect(() => {
    if (editingColumn && columnEditRef.current) {
      columnEditRef.current.focus();
    }
  }, [editingColumn]);

  useEffect(() => {
    if (editingBoardTitle && boardTitleRef.current) {
      boardTitleRef.current.focus();
    }
  }, [editingBoardTitle]);

  const addTask = (boardId, columnId, text) => {
    if (!text.trim()) return;
    
    const newTask = {
      id: Date.now(),
      text: text.trim(),
      createdAt: new Date().toLocaleDateString()
    };
    
    setBoards(prev => ({
      ...prev,
      [boardId]: {
        ...prev[boardId],
        tasks: {
          ...prev[boardId].tasks,
          [columnId]: [...prev[boardId].tasks[columnId], newTask]
        }
      }
    }));
    
    setNewTaskText('');
    setShowNewTaskInput('');
  };

  const deleteTask = (boardId, columnId, taskId) => {
    setBoards(prev => ({
      ...prev,
      [boardId]: {
        ...prev[boardId],
        tasks: {
          ...prev[boardId].tasks,
          [columnId]: prev[boardId].tasks[columnId].filter(task => task.id !== taskId)
        }
      }
    }));
  };

  const updateTask = (boardId, columnId, taskId, newText) => {
    if (!newText.trim()) return;
    
    setBoards(prev => ({
      ...prev,
      [boardId]: {
        ...prev[boardId],
        tasks: {
          ...prev[boardId].tasks,
          [columnId]: prev[boardId].tasks[columnId].map(task => 
            task.id === taskId ? { ...task, text: newText.trim() } : task
          )
        }
      }
    }));
    setEditingTask(null);
  };

  const updateColumnTitle = (boardId, columnId, newTitle) => {
    if (!newTitle.trim()) return;
    
    setBoards(prev => ({
      ...prev,
      [boardId]: {
        ...prev[boardId],
        columnTitles: {
          ...prev[boardId].columnTitles,
          [columnId]: newTitle.trim()
        }
      }
    }));
    setEditingColumn(null);
  };

  const updateBoardTitle = (boardId, newTitle) => {
    if (!newTitle.trim()) return;
    
    setBoards(prev => ({
      ...prev,
      [boardId]: {
        ...prev[boardId],
        title: newTitle.trim()
      }
    }));
    setEditingBoardTitle(null);
  };

  const toggleBoardCollapsed = (boardId) => {
    setBoards(prev => ({
      ...prev,
      [boardId]: {
        ...prev[boardId],
        collapsed: !prev[boardId].collapsed
      }
    }));
  };

  // Column drag handlers
  const handleColumnDragStart = (e, columnId, boardId, index) => {
    e.stopPropagation();
    setDraggedColumn(columnId);
    setDraggedColumnIndex(index);
    setDraggedBoard(boardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleColumnDragOver = (e, targetIndex, boardId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedColumnIndex === null || draggedColumnIndex === targetIndex || draggedBoard !== boardId) return;
    
    setBoards(prev => {
      const newOrder = [...prev[boardId].columnOrder];
      const draggedItem = newOrder[draggedColumnIndex];
      
      // Remove dragged item
      newOrder.splice(draggedColumnIndex, 1);
      // Insert at target position
      newOrder.splice(targetIndex, 0, draggedItem);
      
      return {
        ...prev,
        [boardId]: {
          ...prev[boardId],
          columnOrder: newOrder
        }
      };
    });
    
    setDraggedColumnIndex(targetIndex);
  };

  const handleColumnDragEnd = () => {
    setDraggedColumn(null);
    setDraggedColumnIndex(null);
    setDraggedBoard(null);
  };

  // Board drag handlers
  const handleBoardDragStart = (e, boardId) => {
    setDraggedBoardId(boardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleBoardDragOver = (e, targetBoardId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedBoardId || draggedBoardId === targetBoardId) return;
    
    const currentIndex = boardOrder.indexOf(draggedBoardId);
    const targetIndex = boardOrder.indexOf(targetBoardId);
    
    const newOrder = [...boardOrder];
    newOrder.splice(currentIndex, 1);
    newOrder.splice(targetIndex, 0, draggedBoardId);
    
    setBoardOrder(newOrder);
  };

  const handleBoardDragEnd = () => {
    setDraggedBoardId(null);
  };

  const handleDragStart = (e, task, boardId, columnId) => {
    e.stopPropagation();
    setDraggedTask(task);
    setDraggedFrom({ boardId, columnId });
    setDraggedBoard(boardId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetBoardId, targetColumnId) => {
    e.preventDefault();
    
    if (!draggedTask || !draggedFrom) return;
    
    if (draggedFrom.boardId === targetBoardId && draggedFrom.columnId === targetColumnId) {
      setDraggedTask(null);
      setDraggedFrom(null);
      setDraggedBoard(null);
      return;
    }

    setBoards(prev => {
      const newBoards = { ...prev };
      
      // Remove from source
      newBoards[draggedFrom.boardId].tasks[draggedFrom.columnId] = 
        newBoards[draggedFrom.boardId].tasks[draggedFrom.columnId].filter(task => task.id !== draggedTask.id);
      
      // Add to target
      newBoards[targetBoardId].tasks[targetColumnId] = 
        [...newBoards[targetBoardId].tasks[targetColumnId], draggedTask];
      
      return newBoards;
    });
    
    setDraggedTask(null);
    setDraggedFrom(null);
    setDraggedBoard(null);
  };

  const theme = themes[currentTheme];
  const bgClass = isDarkMode ? 'bg-gray-900' : 'bg-gray-50';
  const cardBg = isDarkMode ? 'bg-gray-800' : 'bg-white';
  const boardBg = isDarkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 to-gray-200';
  const textClass = isDarkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-300' : 'text-gray-600';

  const renderBoard = (boardId, board) => {
    const columns = board.columnOrder.map(columnId => ({
      id: columnId,
      title: board.columnTitles[columnId],
      tasks: board.tasks[columnId] || []
    }));

    const totalTasks = Object.values(board.tasks).flat().length;
    const contentHeight = board.collapsed ? 0 : board.height;

    return (
      <div 
        key={boardId} 
        className="mb-6 relative"
        draggable
        onDragStart={(e) => handleBoardDragStart(e, boardId)}
        onDragOver={(e) => handleBoardDragOver(e, boardId)}
        onDragEnd={handleBoardDragEnd}
      >
        <div className={`${boardBg} rounded-xl shadow-inner border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} transition-all duration-300 relative ${
          draggedBoardId === boardId ? 'opacity-50 rotate-1 scale-95' : ''
        }`}>
          {/* Board Header */}
          <div className="p-4 border-b border-gray-300 dark:border-gray-600 cursor-move">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {editingBoardTitle === boardId ? (
                  <input
                    ref={boardTitleRef}
                    type="text"
                    defaultValue={board.title}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        updateBoardTitle(boardId, e.target.value);
                      }
                    }}
                    onBlur={(e) => updateBoardTitle(boardId, e.target.value)}
                    className="text-xl font-bold bg-transparent border-b-2 border-blue-500 focus:outline-none"
                  />
                ) : (
                  <h2 
                    className="text-xl font-bold cursor-pointer hover:text-blue-500 transition-colors"
                    onClick={() => setEditingBoardTitle(boardId)}
                    title="Click to rename • Drag board to reorder"
                  >
                    {board.title}
                  </h2>
                )}
                <span className={`text-sm ${textSecondary} bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full`}>
                  {totalTasks} tasks
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleBoardCollapsed(boardId)}
                  className={`p-2 rounded-lg ${theme.primary} text-white hover:opacity-90 transition-opacity`}
                  title={board.collapsed ? "Expand" : "Collapse"}
                >
                  {board.collapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Board Content */}
          <div 
            style={{ height: `${contentHeight}px` }}
            className="overflow-hidden transition-all duration-300"
          >
            {!board.collapsed && (
              <div className="p-6 h-full">
                <div className="h-full overflow-x-auto">
                  <div className="flex gap-6 h-full">
                    {columns.map((column, index) => {
                      return (
                        <div 
                          key={column.id} 
                          draggable
                          onDragStart={(e) => handleColumnDragStart(e, column.id, boardId, index)}
                          onDragOver={(e) => handleColumnDragOver(e, index, boardId)}
                          onDragEnd={handleColumnDragEnd}
                          className={`${cardBg} rounded-lg shadow-lg p-4 flex-1 transition-all duration-300 hover:shadow-xl border ${isDarkMode ? 'border-gray-600' : 'border-gray-200'} flex flex-col h-full ${
                            draggedColumn === column.id && draggedBoard === boardId ? 'opacity-50 rotate-2 scale-95' : ''
                          }`}
                        >
                          <div 
                            className="flex justify-between items-center mb-4 flex-shrink-0 cursor-grab active:cursor-grabbing"
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            {editingColumn === `${boardId}-${column.id}` ? (
                              <input
                                ref={columnEditRef}
                                type="text"
                                defaultValue={column.title}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    updateColumnTitle(boardId, column.id, e.target.value);
                                  }
                                }}
                                onBlur={(e) => updateColumnTitle(boardId, column.id, e.target.value)}
                                className="text-lg font-semibold bg-transparent border-b-2 border-blue-500 focus:outline-none flex-1 mr-2"
                              />
                            ) : (
                              <h3 
                                className="text-lg font-semibold cursor-pointer hover:text-blue-500 transition-colors"
                                onClick={() => setEditingColumn(`${boardId}-${column.id}`)}
                                title="Click to rename • Drag column to reorder"
                              >
                                {column.title}
                              </h3>
                            )}
                            <div className="flex items-center space-x-2">
                              <span className={`text-sm ${textSecondary} bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full`}>
                                {column.tasks.length}
                              </span>
                              <button
                                onClick={() => setShowNewTaskInput(`${boardId}-${column.id}`)}
                                className={`p-1 rounded ${theme.primary} text-white hover:opacity-90 transition-opacity`}
                                title="Add task"
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>

                          {/* New task input */}
                          {showNewTaskInput === `${boardId}-${column.id}` && (
                            <div className="mb-4 flex-shrink-0">
                              <input
                                ref={inputRef}
                                type="text"
                                value={newTaskText}
                                onChange={(e) => setNewTaskText(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    addTask(boardId, column.id, newTaskText);
                                  }
                                }}
                                onBlur={() => {
                                  if (newTaskText.trim()) {
                                    addTask(boardId, column.id, newTaskText);
                                  } else {
                                    setShowNewTaskInput('');
                                  }
                                }}
                                placeholder="Enter task..."
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                              />
                            </div>
                          )}

                          {/* Tasks */}
                          <div
                            className="flex-1 space-y-3 overflow-y-auto"
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, boardId, column.id)}
                            onMouseDown={(e) => e.stopPropagation()}
                          >
                            {column.tasks.map(task => (
                              <div
                                key={task.id}
                                data-task-card="true"
                                draggable
                                onDragStart={(e) => handleDragStart(e, task, boardId, column.id)}
                                className={`p-3 rounded-lg ${cardBg} hover:shadow-md transition-all duration-200 cursor-move group border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 shadow-sm ${
                                  draggedBoard === boardId && draggedTask?.id === task.id ? 'opacity-50' : ''
                                }`}
                              >
                                {editingTask === task.id ? (
                                  <div className="flex items-center space-x-2">
                                    <input
                                      ref={editInputRef}
                                      type="text"
                                      defaultValue={task.text}
                                      onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                          updateTask(boardId, column.id, task.id, e.target.value);
                                        }
                                      }}
                                      onBlur={(e) => updateTask(boardId, column.id, task.id, e.target.value)}
                                      className="flex-1 p-1 border rounded focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <button
                                      onClick={() => setEditingTask(null)}
                                      className="text-gray-400 hover:text-red-500"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex justify-between items-start">
                                      <p className="text-sm font-medium flex-1">{task.text}</p>
                                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1">
                                        <button
                                          onClick={() => setEditingTask(task.id)}
                                          className="text-gray-400 hover:text-blue-500"
                                          title="Edit task"
                                        >
                                          <Edit3 size={14} />
                                        </button>
                                        <button
                                          onClick={() => deleteTask(boardId, column.id, task.id)}
                                          className="text-gray-400 hover:text-red-500"
                                          title="Delete task"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    </div>
                                    <p className={`text-xs ${textSecondary} mt-2`}>
                                      Added {task.createdAt}
                                    </p>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${bgClass} ${textClass} transition-colors duration-300`}>
      {/* Header */}
      <div className={`${cardBg} shadow-sm border-b border-gray-200 dark:border-gray-700`}>
        <div className="max-w-full mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">My Kanban Boards</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-2 rounded-lg ${theme.primary} text-white hover:opacity-90 transition-opacity`}
              title="Toggle dark mode (T)"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg ${theme.primary} text-white hover:opacity-90 transition-opacity`}
              title="Settings (S)"
            >
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className={`${cardBg} shadow-lg border-b border-gray-200 dark:border-gray-700`}>
          <div className="max-w-full mx-auto px-4 py-4">
            <h3 className="text-lg font-semibold mb-4">Color Theme</h3>
            <div className="flex space-x-3">
              {Object.keys(themes).map(themeKey => (
                <button
                  key={themeKey}
                  onClick={() => setCurrentTheme(themeKey)}
                  className={`w-8 h-8 rounded-full ${themes[themeKey].primary} ${
                    currentTheme === themeKey ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                  }`}
                />
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <p><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">N</kbd> New task</p>
              <p><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">T</kbd> Toggle theme</p>
              <p><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">S</kbd> Settings</p>
              <p><kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">ESC</kbd> Cancel</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Boards */}
      <div className="px-4 py-6">
        {boardOrder.map(boardId => renderBoard(boardId, boards[boardId]))}
      </div>
    </div>
  );
};

export default KanbanBoard;