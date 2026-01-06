import React, { useState, useEffect } from 'react';
import { Eye, Upload, PlayCircle, Lock, ArrowRight, ArrowLeft, Trash2, ChevronDown, Edit, Save, X } from 'lucide-react';

export default function HorseShowManager() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'viewer' or 'editor'
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [showMasterKeyPrompt, setShowMasterKeyPrompt] = useState(false);
  const [masterKeyInput, setMasterKeyInput] = useState('');
  const [pendingRole, setPendingRole] = useState(null);
  const [users, setUsers] = useState({});
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerMode, setRegisterMode] = useState(false);
  const [activeTab, setActiveTab] = useState('view');
  const [activeControlArea, setActiveControlArea] = useState('Main Ring');
  const [areas, setAreas] = useState(['Main Ring']);
  const [classes, setClasses] = useState({ 'Main Ring': [] });
  const [currentClasses, setCurrentClasses] = useState({ 'Main Ring': 0 });
  const [importText, setImportText] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState({});
  const [editingArea, setEditingArea] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editValue, setEditValue] = useState('');

  const ORGANIZATION_KEY = 'horseShowOrganization';
  const MASTER_KEY = 'emily';

  useEffect(() => {
    const storedUsers = localStorage.getItem('horseShowUsers');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      const stored = localStorage.getItem(ORGANIZATION_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setAreas(data.areas || ['Main Ring']);
        setClasses(data.classes || { 'Main Ring': [] });
        setCurrentClasses(data.currentClasses || { 'Main Ring': 0 });
        if (data.areas && data.areas.length > 0) {
          setActiveControlArea(data.areas[0]);
        }
      }
    }
  }, [currentUser]);

  const saveData = (newAreas, newClasses, newCurrentClasses) => {
    localStorage.setItem(ORGANIZATION_KEY, JSON.stringify({
      areas: newAreas,
      classes: newClasses,
      currentClasses: newCurrentClasses
    }));
  };

  const handleLogin = () => {
    if (!loginForm.username || !loginForm.password) {
      alert('Please enter username and password');
      return;
    }
    if (users[loginForm.username] && users[loginForm.username] === loginForm.password) {
      setCurrentUser(loginForm.username);
      setShowRoleSelection(true);
      setLoginForm({ username: '', password: '' });
    } else {
      alert('Invalid username or password');
    }
  };

  const handleRoleSelection = (role) => {
    if (role === 'viewer') {
      setUserRole('viewer');
      setIsLoggedIn(true);
      setShowRoleSelection(false);
      setActiveTab('view');
    } else if (role === 'editor') {
      setPendingRole('editor');
      setShowRoleSelection(false);
      setShowMasterKeyPrompt(true);
    }
  };

  const handleMasterKeySubmit = () => {
    if (masterKeyInput === MASTER_KEY) {
      setUserRole(pendingRole);
      setIsLoggedIn(true);
      setShowMasterKeyPrompt(false);
      setMasterKeyInput('');
      setPendingRole(null);
    } else {
      alert('Incorrect master key');
      setMasterKeyInput('');
    }
  };

  const handleRoleSwitch = () => {
    const newRole = userRole === 'viewer' ? 'editor' : 'viewer';
    if (newRole === 'editor') {
      setPendingRole('editor');
      setShowMasterKeyPrompt(true);
    } else {
      setUserRole('viewer');
      setActiveTab('view');
    }
  };

  const handleRegister = () => {
    if (!loginForm.username || !loginForm.password) {
      alert('Please enter username and password');
      return;
    }
    if (users[loginForm.username]) {
      alert('Username already exists');
      return;
    }
    const newUsers = { ...users, [loginForm.username]: loginForm.password };
    setUsers(newUsers);
    localStorage.setItem('horseShowUsers', JSON.stringify(newUsers));
    setIsLoggedIn(true);
    setCurrentUser(loginForm.username);
    setLoginForm({ username: '', password: '' });
    setRegisterMode(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserRole(null);
    setActiveTab('view');
  };

  const handleImport = () => {
    if (!importText.trim()) {
      alert('Please enter some classes to import');
      return;
    }

    const lines = importText.trim().split('\n');
    const newClasses = {};
    const newAreas = [];
    let currentArea = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;
      
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        currentArea = trimmed.slice(1, -1);
        if (!newAreas.includes(currentArea)) {
          newAreas.push(currentArea);
          newClasses[currentArea] = [];
        }
      } else if (currentArea) {
        newClasses[currentArea].push(trimmed);
      }
    });

    if (newAreas.length === 0) {
      alert('Please specify at least one area using [Area Name]');
      return;
    }

    const updatedCurrentClasses = {};
    newAreas.forEach(area => {
      updatedCurrentClasses[area] = 0;
    });

    setAreas(newAreas);
    setClasses(newClasses);
    setCurrentClasses(updatedCurrentClasses);
    setActiveControlArea(newAreas[0]);
    saveData(newAreas, newClasses, updatedCurrentClasses);
    setImportText('');
    setActiveTab('view');
    alert('Classes imported successfully!');
  };

  const removeArea = (areaName) => {
    if (areas.length === 1) {
      alert('Must have at least one area!');
      return;
    }
    
    const confirmed = window.confirm(`Remove ${areaName}? This will delete all its classes.`);
    if (!confirmed) return;
    
    const updatedAreas = areas.filter(a => a !== areaName);
    const updatedClasses = { ...classes };
    delete updatedClasses[areaName];
    const updatedCurrentClasses = { ...currentClasses };
    delete updatedCurrentClasses[areaName];
    
    setAreas(updatedAreas);
    setClasses(updatedClasses);
    setCurrentClasses(updatedCurrentClasses);
    saveData(updatedAreas, updatedClasses, updatedCurrentClasses);
    
    if (activeControlArea === areaName && updatedAreas.length > 0) {
      setActiveControlArea(updatedAreas[0]);
    }
  };

  const startEditingArea = (area) => {
    setEditingArea(area);
    setEditValue(area);
  };

  const saveAreaEdit = () => {
    if (!editValue.trim()) {
      alert('Area name cannot be empty');
      return;
    }
    
    const trimmedValue = editValue.trim();
    if (areas.includes(trimmedValue) && trimmedValue !== editingArea) {
      alert('An area with this name already exists');
      return;
    }

    const updatedAreas = areas.map(a => a === editingArea ? trimmedValue : a);
    const updatedClasses = {};
    const updatedCurrentClasses = {};
    
    areas.forEach(area => {
      const newName = area === editingArea ? trimmedValue : area;
      updatedClasses[newName] = classes[area];
      updatedCurrentClasses[newName] = currentClasses[area];
    });

    setAreas(updatedAreas);
    setClasses(updatedClasses);
    setCurrentClasses(updatedCurrentClasses);
    saveData(updatedAreas, updatedClasses, updatedCurrentClasses);
    
    if (activeControlArea === editingArea) {
      setActiveControlArea(trimmedValue);
    }
    
    setEditingArea(null);
    setEditValue('');
  };

  const startEditingClass = (area, index) => {
    setEditingClass({ area, index });
    setEditValue(classes[area][index]);
  };

  const saveClassEdit = () => {
    if (!editValue.trim()) {
      alert('Class name cannot be empty');
      return;
    }

    const updatedClasses = { ...classes };
    updatedClasses[editingClass.area][editingClass.index] = editValue.trim();
    
    setClasses(updatedClasses);
    saveData(areas, updatedClasses, currentClasses);
    setEditingClass(null);
    setEditValue('');
  };

  const removeClass = (area, index) => {
    const confirmed = window.confirm('Remove this class?');
    if (!confirmed) return;
    
    const updatedClasses = { ...classes };
    updatedClasses[area] = updatedClasses[area].filter((_, i) => i !== index);
    
    const updatedCurrentClasses = { ...currentClasses };
    if (currentClasses[area] >= updatedClasses[area].length && updatedClasses[area].length > 0) {
      updatedCurrentClasses[area] = updatedClasses[area].length - 1;
    } else if (updatedClasses[area].length === 0) {
      updatedCurrentClasses[area] = 0;
    }
    
    setClasses(updatedClasses);
    setCurrentClasses(updatedCurrentClasses);
    saveData(areas, updatedClasses, updatedCurrentClasses);
  };

  const previousClass = (area) => {
    const current = currentClasses[area] || 0;
    if (current > 0) {
      const updated = { ...currentClasses, [area]: current - 1 };
      setCurrentClasses(updated);
      saveData(areas, classes, updated);
    } else {
      alert('This is the first class!');
    }
  };

  const nextClass = (area) => {
    const areaClasses = classes[area] || [];
    const current = currentClasses[area] || 0;
    if (current < areaClasses.length - 1) {
      const updated = { ...currentClasses, [area]: current + 1 };
      setCurrentClasses(updated);
      saveData(areas, classes, updated);
    } else {
      alert('This is the last class!');
    }
  };

  const jumpToClass = (area, index) => {
    const updated = { ...currentClasses, [area]: index };
    setCurrentClasses(updated);
    saveData(areas, classes, updated);
    setDropdownOpen({ ...dropdownOpen, [area]: false });
  };

  if (!isLoggedIn) {
    if (showMasterKeyPrompt) {
      return (
        <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Enter Master Key
            </h1>
            <p className="text-center text-gray-600 mb-6">
              Editor access requires a master key
            </p>
            
            <div className="space-y-4 mb-6">
              <input
                type="password"
                placeholder="Master Key"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-red-700 focus:outline-none"
                value={masterKeyInput}
                onChange={(e) => setMasterKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleMasterKeySubmit()}
              />
            </div>
            
            <button
              onClick={handleMasterKeySubmit}
              className="w-full bg-red-700 text-white py-4 rounded-lg hover:bg-red-800 transition font-bold text-lg mb-3"
            >
              Submit
            </button>
            
            <button
              onClick={() => {
                setShowMasterKeyPrompt(false);
                setMasterKeyInput('');
                setPendingRole(null);
                setShowRoleSelection(true);
              }}
              className="w-full text-red-700 hover:text-red-800 font-semibold"
            >
              Back
            </button>
          </div>
        </div>
      );
    }

    if (showRoleSelection) {
      return (
        <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Select Your Role
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Welcome, {currentUser}!
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => handleRoleSelection('viewer')}
                className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition font-bold text-lg"
              >
                Viewer
                <div className="text-sm font-normal mt-1">View classes only</div>
              </button>
              
              <button
                onClick={() => handleRoleSelection('editor')}
                className="w-full bg-red-700 text-white py-4 rounded-lg hover:bg-red-800 transition font-bold text-lg"
              >
                Editor
                <div className="text-sm font-normal mt-1">Full access (requires master key)</div>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            All American Youth Horse Show
            <br />
            Class Manager
          </h1>
          
          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Username"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-red-700 focus:outline-none"
              value={loginForm.username}
              onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && (registerMode ? handleRegister() : handleLogin())}
            />
            
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-red-700 focus:outline-none"
              value={loginForm.password}
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && (registerMode ? handleRegister() : handleLogin())}
            />
          </div>
          
          <button
            onClick={registerMode ? handleRegister : handleLogin}
            className="w-full bg-green-600 text-white py-4 rounded-lg hover:bg-green-700 transition font-bold text-lg mb-3"
          >
            {registerMode ? 'Create Account' : 'Login'}
          </button>
          
          <button
            onClick={() => setRegisterMode(!registerMode)}
            className="w-full text-green-600 hover:text-green-700 font-semibold"
          >
            {registerMode ? 'Back to Login' : 'Create New Account'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {showMasterKeyPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
              Enter Master Key
            </h1>
            <p className="text-center text-gray-600 mb-6">
              {userRole === 'viewer' ? 'Editor access requires a master key' : 'Switching to viewer mode'}
            </p>
            
            <div className="space-y-4 mb-6">
              <input
                type="password"
                placeholder="Master Key"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-red-700 focus:outline-none"
                value={masterKeyInput}
                onChange={(e) => setMasterKeyInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleMasterKeySubmit()}
              />
            </div>
            
            <button
              onClick={handleMasterKeySubmit}
              className="w-full bg-red-700 text-white py-4 rounded-lg hover:bg-red-800 transition font-bold text-lg mb-3"
            >
              Submit
            </button>
            
            <button
              onClick={() => {
                setShowMasterKeyPrompt(false);
                setMasterKeyInput('');
                setPendingRole(null);
              }}
              className="w-full text-red-700 hover:text-red-800 font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-blue-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">All American Youth Horse Show Class Manager</h1>
          <div className="flex items-center gap-4">
            <span className="font-semibold">{currentUser} ({userRole})</span>
            <button
              onClick={handleRoleSwitch}
              className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition font-semibold"
            >
              Switch to {userRole === 'viewer' ? 'Editor' : 'Viewer'}
            </button>
            <button
              onClick={handleLogout}
              className="bg-white text-blue-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-xl shadow-lg mb-4">
          <div className="flex">
            <button
              onClick={() => setActiveTab('view')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-lg transition ${
                activeTab === 'view'
                  ? 'bg-red-700 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } rounded-tl-xl`}
            >
              <Eye className="w-6 h-6" />
              View
            </button>
            {userRole === 'editor' && (
              <>
                <button
                  onClick={() => setActiveTab('button')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-lg transition ${
                    activeTab === 'button'
                      ? 'bg-red-700 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <PlayCircle className="w-6 h-6" />
                  Control
                </button>
                <button
                  onClick={() => setActiveTab('import')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-lg transition ${
                    activeTab === 'import'
                      ? 'bg-red-700 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  <Upload className="w-6 h-6" />
                  Import
                </button>
                <button
                  onClick={() => setActiveTab('edit')}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 font-bold text-lg transition ${
                    activeTab === 'edit'
                      ? 'bg-red-700 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } rounded-tr-xl`}
                >
                  <Edit className="w-6 h-6" />
                  Edit
                </button>
              </>
            )}
            {userRole === 'viewer' && (
              <div className="flex-1 bg-gray-200 rounded-tr-xl"></div>
            )}
          </div>

          <div className="p-6">
            {activeTab === 'view' && (
              <div>
                {areas.length === 0 || (areas.length === 1 && classes[areas[0]].length === 0) ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-xl mb-4">No classes imported yet</p>
                    <button
                      onClick={() => setActiveTab('import')}
                      className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 font-semibold"
                    >
                      Import Classes
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {areas.map(area => {
                      const areaClasses = classes[area] || [];
                      const currentIdx = currentClasses[area] || 0;
                      const currentClass = areaClasses[currentIdx];
                      const nextClass = areaClasses[currentIdx + 1];

                      return (
                        <div key={area} className="border-4 border-red-700 rounded-xl p-4 bg-white">
                          <h3 className="text-xl font-bold text-center text-gray-800 mb-4 bg-red-700 text-white py-2 rounded-lg">
                            {area}
                          </h3>
                          
                          <div className="mb-4">
                            <div className="text-sm font-bold text-red-700 mb-1">NOW</div>
                            <div className="bg-red-100 border-2 border-red-700 rounded-lg p-3 min-h-20 flex items-center justify-center">
                              {currentClass ? (
                                <div className="text-center">
                                  <div className="text-xs text-red-700 font-bold mb-1">
                                    Class {currentIdx + 1} of {areaClasses.length}
                                  </div>
                                  <div className="text-base font-bold text-gray-900">{currentClass}</div>
                                </div>
                              ) : (
                                <div className="text-gray-500 text-sm">No class running</div>
                              )}
                            </div>
                          </div>

                          <div>
                            <div className="text-xs font-bold text-blue-700 mb-1">UP NEXT</div>
                            <div className="bg-blue-100 border border-blue-500 rounded-lg p-2 min-h-12 flex items-center justify-center">
                              {nextClass ? (
                                <div className="text-center">
                                  <div className="text-xs text-blue-700 font-bold mb-1">
                                    Class {currentIdx + 2}
                                  </div>
                                  <div className="text-sm font-bold text-gray-800">{nextClass}</div>
                                </div>
                              ) : (
                                <div className="text-gray-500 text-xs">Last class</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'button' && (
              <div>
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                  {areas.map(area => (
                    <button
                      key={area}
                      onClick={() => setActiveControlArea(area)}
                      className={`px-6 py-3 rounded-lg font-bold text-lg whitespace-nowrap transition ${
                        activeControlArea === area
                          ? 'bg-red-700 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {area}
                    </button>
                  ))}
                </div>

                {areas.map(area => {
                  if (area !== activeControlArea) return null;
                  
                  const areaClasses = classes[area] || [];
                  const currentIdx = currentClasses[area] || 0;

                  return (
                    <div key={area} className="border-4 border-red-700 rounded-xl p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-2xl font-bold text-center text-white bg-red-700 py-3 px-6 rounded-lg flex-1">
                          {area}
                        </h3>
                      </div>

                      {areaClasses.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No classes for this area</p>
                      ) : (
                        <>
                          <div className="flex gap-3 mb-4">
                            <button
                              onClick={() => previousClass(area)}
                              className="flex-1 bg-orange-600 text-white py-4 rounded-xl hover:bg-orange-700 transition font-bold text-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={currentIdx === 0}
                            >
                              <ArrowLeft className="w-6 h-6" />
                              Go Back
                            </button>
                            <button
                              onClick={() => nextClass(area)}
                              className="flex-1 bg-red-700 text-white py-4 rounded-xl hover:bg-red-800 transition font-bold text-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={currentIdx >= areaClasses.length - 1}
                            >
                              Next Class
                              <ArrowRight className="w-6 h-6" />
                            </button>
                          </div>

                          <div className="mb-4">
                            <button
                              onClick={() => setDropdownOpen({ ...dropdownOpen, [area]: !dropdownOpen[area] })}
                              className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center justify-between"
                            >
                              <span>
                                {areaClasses[currentIdx] 
                                  ? `${currentIdx + 1}. ${areaClasses[currentIdx]}`
                                  : 'No class selected'}
                              </span>
                              <ChevronDown className={`w-5 h-5 transition-transform ${dropdownOpen[area] ? 'rotate-180' : ''}`} />
                            </button>
                            
                            {dropdownOpen[area] && (
                              <div className="mt-2 max-h-96 overflow-y-auto border-2 border-gray-300 rounded-lg bg-white">
                                {areaClasses.map((cls, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => jumpToClass(area, idx)}
                                    className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition border-b border-gray-200 last:border-b-0 ${
                                      currentIdx === idx ? 'bg-red-100 font-bold' : ''
                                    }`}
                                  >
                                    <span className="font-bold mr-2">{idx + 1}.</span>
                                    {cls}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'import' && (
              <div>
                <div className="mb-4 bg-blue-100 border-2 border-blue-500 rounded-lg p-4">
                  <p className="font-bold mb-2">How to import:</p>
                  <p className="text-sm mb-2">Type one class per line. For multiple rings, use [Ring Name]:</p>
                  <pre className="text-sm bg-white p-3 rounded mt-2">
{`[Main Ring]
Lead Line Walk/Trot
Beginner Equitation

[Ring 2]
Hunter Pleasure
Western Pleasure

[Barn A]
Showmanship
Trail Class`}
                  </pre>
                </div>
                <textarea
                  className="w-full h-80 px-4 py-3 border-2 border-gray-300 rounded-lg text-lg focus:border-red-700 focus:outline-none"
                  placeholder="Enter your classes here..."
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                />
                <button
                  onClick={handleImport}
                  className="mt-4 w-full bg-red-700 text-white px-8 py-4 rounded-lg hover:bg-red-800 transition font-bold text-xl"
                >
                  Import Classes
                </button>
              </div>
            )}

            {activeTab === 'edit' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Areas and Classes</h2>
                
                {areas.map(area => (
                  <div key={area} className="border-4 border-red-700 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                      {editingArea === area ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            className="flex-1 px-4 py-2 border-2 border-red-700 rounded-lg text-xl font-bold focus:outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && saveAreaEdit()}
                          />
                          <button
                            onClick={saveAreaEdit}
                            className="bg-red-700 text-white p-2 rounded-lg hover:bg-red-800"
                          >
                            <Save className="w-6 h-6" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingArea(null);
                              setEditValue('');
                            }}
                            className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-2xl font-bold text-gray-800">{area}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => startEditingArea(area)}
                              className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                              title="Edit Area Name"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            {areas.length > 1 && (
                              <button
                                onClick={() => removeArea(area)}
                                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                                title="Remove Area"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      {(classes[area] || []).map((cls, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
                          {editingClass?.area === area && editingClass?.index === idx ? (
                            <>
                              <span className="font-bold text-gray-600">{idx + 1}.</span>
                              <input
                                type="text"
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1 px-3 py-2 border-2 border-red-700 rounded-lg focus:outline-none"
                                onKeyDown={(e) => e.key === 'Enter' && saveClassEdit()}
                              />
                              <button
                                onClick={saveClassEdit}
                                className="bg-red-700 text-white p-2 rounded-lg hover:bg-red-800"
                              >
                                <Save className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => {
                                  setEditingClass(null);
                                  setEditValue('');
                                }}
                                className="bg-gray-600 text-white p-2 rounded-lg hover:bg-gray-700"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-gray-600">{idx + 1}.</span>
                              <span className="flex-1 text-gray-800">{cls}</span>
                              <button
                                onClick={() => startEditingClass(area, idx)}
                                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
                                title="Edit Class"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeClass(area, idx)}
                                className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700"
                                title="Remove Class"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                      {(!classes[area] || classes[area].length === 0) && (
                        <p className="text-center text-gray-500 py-4">No classes in this area</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}