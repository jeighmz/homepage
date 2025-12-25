import React, { useState, useMemo, useEffect, useRef } from 'react'
import './App.css'
import GoalCard from './components/GoalCard'
import EditGoalModal from './components/EditGoalModal'
import { exportGoals, importGoals } from './utils/exportImport'
import { db } from './firebase/config'
import { doc, getDoc, setDoc } from 'firebase/firestore'

function App() {
  const [goals, setGoals] = useState([
    {
      id: 1,
      title: 'Read 50 Books',
      current: 32,
      target: 50,
      unit: 'books',
      color: '#0078D4',
      icon: '📚',
      category: 'Learning',
      priority: 'high',
      notes: 'Focus on non-fiction this year',
      history: []
    },
    {
      id: 2,
      title: 'Run 1000 Miles',
      current: 645,
      target: 1000,
      unit: 'miles',
      color: '#0078D4',
      icon: '🏃',
      category: 'Health',
      priority: 'high',
      notes: '',
      history: []
    },
    {
      id: 3,
      title: 'Save $10,000',
      current: 7250,
      target: 10000,
      unit: 'dollars',
      color: '#107c10',
      icon: '💰',
      category: 'Finance',
      priority: 'high',
      notes: '',
      history: []
    },
    {
      id: 4,
      title: 'Learn Spanish',
      current: 180,
      target: 365,
      unit: 'days',
      color: '#ffaa44',
      icon: '🇪🇸',
      category: 'Learning',
      priority: 'medium',
      notes: 'Daily practice with Duolingo',
      history: []
    },
    {
      id: 5,
      title: 'Write 100 Blog Posts',
      current: 47,
      target: 100,
      unit: 'posts',
      color: '#d13438',
      icon: '✍️',
      category: 'Creative',
      priority: 'medium',
      notes: '',
      history: []
    },
    {
      id: 6,
      title: 'Complete 12 Online Courses',
      current: 8,
      target: 12,
      unit: 'courses',
      color: '#0078D4',
      icon: '🎓',
      category: 'Learning',
      priority: 'low',
      notes: '',
      history: []
    }
  ])

  const [sortBy, setSortBy] = useState('default')
  const [filterBy, setFilterBy] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingGoal, setEditingGoal] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const fileInputRef = useRef(null)
  const [weather, setWeather] = useState({ temp: null, condition: null, location: null, loading: true })
  const [controlsExpanded, setControlsExpanded] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [favorites, setFavorites] = useState([])
  const [editingFavorite, setEditingFavorite] = useState(null)
  const [apps, setApps] = useState([])
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const getFaviconUrl = (url) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
      const domain = urlObj.hostname
      // Use Google's favicon service
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
    } catch (e) {
      return null
    }
  }

  // Load from Firestore on mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      
      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.warn('Firestore load timeout, using localStorage fallback')
        loadFromLocalStorage()
        setIsLoading(false)
      }, 3000) // 3 second timeout
      
      const loadFromLocalStorage = () => {
        const savedGoals = localStorage.getItem('hobbi-goals')
        if (savedGoals) {
          try {
            const parsed = JSON.parse(savedGoals)
            setGoals(parsed)
          } catch (e) {
            console.error('Failed to load goals from localStorage', e)
          }
        }
        
        const savedFavorites = localStorage.getItem('hobbi-favorites')
        if (savedFavorites) {
          try {
            const parsed = JSON.parse(savedFavorites)
            // Ensure all favorites have favicons
            const favoritesWithFavicons = parsed.map(fav => ({
              ...fav,
              favicon: fav.favicon || getFaviconUrl(fav.url)
            }))
            setFavorites(favoritesWithFavicons)
          } catch (e) {
            console.error('Failed to load favorites from localStorage', e)
          }
        }
        
        const savedApps = localStorage.getItem('hobbi-apps')
        if (savedApps) {
          try {
            const parsed = JSON.parse(savedApps)
            const appsWithFavicons = parsed.map(app => ({
              ...app,
              favicon: app.favicon || getFaviconUrl(app.url)
            }))
            setApps(appsWithFavicons)
          } catch (e) {
            console.error('Failed to load apps from localStorage', e)
          }
        }
      }
      
      try {
        const dataDoc = await getDoc(doc(db, 'dashboard', 'data'))
        clearTimeout(timeout)
        
        if (dataDoc.exists()) {
          const data = dataDoc.data()
          if (data.goals && Array.isArray(data.goals)) {
            setGoals(data.goals)
          }
          if (data.favorites && Array.isArray(data.favorites)) {
            // Ensure all favorites have favicons
            const favoritesWithFavicons = data.favorites.map(fav => ({
              ...fav,
              favicon: fav.favicon || getFaviconUrl(fav.url)
            }))
            setFavorites(favoritesWithFavicons)
          }
          if (data.apps && Array.isArray(data.apps)) {
            // Ensure all apps have favicons
            const appsWithFavicons = data.apps.map(app => ({
              ...app,
              favicon: app.favicon || getFaviconUrl(app.url)
            }))
            setApps(appsWithFavicons)
          }
        } else {
          // Document doesn't exist, try localStorage fallback
          loadFromLocalStorage()
        }
      } catch (error) {
        if (timeout) clearTimeout(timeout)
        console.error('Failed to load data from Firestore:', error)
        // Fallback to localStorage if Firestore fails
        loadFromLocalStorage()
      } finally {
        setIsLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Track progress history (local only, saved on manual save)
  useEffect(() => {
    const today = new Date().toDateString()
    const lastSaved = localStorage.getItem('hobbi-last-saved')
    
    if (lastSaved !== today) {
      goals.forEach(goal => {
        if (!goal.history) goal.history = []
        const existingEntry = goal.history.find(h => h.date === today)
        if (!existingEntry) {
          goal.history.push({
            date: today,
            progress: (goal.current / goal.target) * 100
          })
          // Keep only last 30 days
          if (goal.history.length > 30) {
            goal.history = goal.history.slice(-30)
          }
        }
      })
      localStorage.setItem('hobbi-last-saved', today)
    }
  }, [goals])

  // Fetch weather data with caching
  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Check if we have cached weather data
        const cachedWeather = localStorage.getItem('hobbi-weather')
        let staleCache = null
        
        if (cachedWeather) {
          try {
            const cached = JSON.parse(cachedWeather)
            const cacheAge = Date.now() - cached.timestamp
            const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes
            
            if (cacheAge < CACHE_DURATION) {
              // Use fresh cached data
              setWeather({
                temp: cached.temp,
                condition: cached.condition,
                location: cached.location,
                loading: false
              })
              return
            } else {
              // Cache is stale but we'll use it as fallback
              staleCache = cached
            }
          } catch (e) {
            // Invalid cache, continue to fetch
          }
        }

        if (!navigator.geolocation) {
          // Use stale cache if available, otherwise show nothing
          if (staleCache) {
            setWeather({
              temp: staleCache.temp,
              condition: staleCache.condition,
              location: staleCache.location,
              loading: false
            })
          } else {
            setWeather({ temp: null, condition: null, location: null, loading: false })
          }
          return
        }

        // Set a timeout to use stale cache if geolocation takes too long
        const fallbackTimeout = setTimeout(() => {
          if (staleCache) {
            setWeather({
              temp: staleCache.temp,
              condition: staleCache.condition,
              location: staleCache.location,
              loading: false
            })
          } else {
            setWeather({ temp: null, condition: null, location: null, loading: false })
          }
        }, 5000) // 5 second fallback

        navigator.geolocation.getCurrentPosition(
          async (position) => {
            clearTimeout(fallbackTimeout)
            const { latitude, longitude } = position.coords
            
            try {
              // Fetch weather and location in parallel with timeout
              const controller = new AbortController()
              const timeout = setTimeout(() => controller.abort(), 8000) // 8 second timeout for fetch
              
              const [weatherResponse, locationResponse] = await Promise.all([
                fetch(
                  `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit`,
                  { signal: controller.signal }
                ),
                fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
                  { signal: controller.signal }
                )
              ])
              
              clearTimeout(timeout)
              
              let locationName = null
              if (locationResponse.ok) {
                const locationData = await locationResponse.json()
                // Build more specific location string
                const parts = []
                if (locationData.locality) parts.push(locationData.locality)
                if (locationData.principalSubdivision && locationData.principalSubdivision !== locationData.locality) {
                  parts.push(locationData.principalSubdivision)
                }
                locationName = parts.length > 0 ? parts.join(', ') : locationData.city || locationData.principalSubdivision || null
              }
              
              if (weatherResponse.ok) {
                const data = await weatherResponse.json()
                const temp = Math.round(data.current.temperature_2m)
                const weatherCode = data.current.weather_code
                
                // Map weather codes to conditions
                const getWeatherCondition = (code) => {
                  if (code === 0) return '☀️'
                  if (code <= 3) return '⛅'
                  if (code <= 48) return '☁️'
                  if (code <= 67 || code <= 77) return '🌧️'
                  if (code <= 82) return '🌦️'
                  if (code <= 86) return '❄️'
                  return '🌤️'
                }
                
                const condition = getWeatherCondition(weatherCode)
                
                const weatherData = {
                  temp,
                  condition,
                  location: locationName,
                  loading: false
                }
                
                // Save to cache
                localStorage.setItem('hobbi-weather', JSON.stringify({
                  temp,
                  condition,
                  location: locationName,
                  timestamp: Date.now()
                }))
                
                setWeather(weatherData)
              } else {
                // Use stale cache if API fails
                if (staleCache) {
                  setWeather({
                    temp: staleCache.temp,
                    condition: staleCache.condition,
                    location: staleCache.location,
                    loading: false
                  })
                } else {
                  setWeather({ temp: null, condition: null, location: locationName, loading: false })
                }
              }
            } catch (fetchError) {
              clearTimeout(timeout)
              // Use stale cache if fetch fails
              if (staleCache) {
                setWeather({
                  temp: staleCache.temp,
                  condition: staleCache.condition,
                  location: staleCache.location,
                  loading: false
                })
              } else {
                setWeather({ temp: null, condition: null, location: null, loading: false })
              }
            }
          },
          (error) => {
            clearTimeout(fallbackTimeout)
            // Silently use stale cache or show nothing - no console errors
            if (staleCache) {
              setWeather({
                temp: staleCache.temp,
                condition: staleCache.condition,
                location: staleCache.location,
                loading: false
              })
            } else {
              setWeather({ temp: null, condition: null, location: null, loading: false })
            }
          },
          {
            timeout: 10000, // 10 seconds
            enableHighAccuracy: false,
            maximumAge: 600000 // Use cached location if available (10 minutes)
          }
        )
      } catch (error) {
        // Silent error handling
        const cachedWeather = localStorage.getItem('hobbi-weather')
        if (cachedWeather) {
          try {
            const cached = JSON.parse(cachedWeather)
            setWeather({
              temp: cached.temp,
              condition: cached.condition,
              location: cached.location,
              loading: false
            })
          } catch (e) {
            setWeather({ temp: null, condition: null, location: null, loading: false })
          }
        } else {
          setWeather({ temp: null, condition: null, location: null, loading: false })
        }
      }
    }

    fetchWeather()
  }, [])


  // Update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const formatValue = (value, unit) => {
    if (unit === 'dollars') {
      return `$${value.toLocaleString()}`
    }
    return value.toLocaleString()
  }

  const daysRemaining = useMemo(() => {
    const now = new Date()
    const endOfYear = new Date(now.getFullYear(), 11, 31)
    const diffTime = endOfYear - now
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }, [])

  const stats = useMemo(() => {
    if (!goals || goals.length === 0) {
      return { completed: 0, total: 0, overallProgress: 0, onTrack: 0 }
    }
    const completed = goals.filter(g => g.current >= g.target).length
    const total = goals.length
    const overallProgress = goals.reduce((sum, goal) => sum + (goal.current / goal.target), 0) / goals.length * 100
    const yearProgress = ((365 - daysRemaining) / 365) * 100
    const onTrack = goals.filter(g => {
      const percentage = (g.current / g.target) * 100
      return percentage >= yearProgress - 5
    }).length
    
    return { completed, total, overallProgress, onTrack }
  }, [goals, daysRemaining])

  const categories = useMemo(() => {
    const cats = new Set(goals.map(g => g.category).filter(Boolean))
    return Array.from(cats).sort()
  }, [goals])

  const sortedAndFilteredGoals = useMemo(() => {
    let filtered = [...goals]
    
    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(g => 
        g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.notes && g.notes.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(g => g.category === selectedCategory)
    }
    
    // Status filter
    if (filterBy === 'completed') {
      filtered = filtered.filter(g => g.current >= g.target)
    } else if (filterBy === 'in-progress') {
      filtered = filtered.filter(g => g.current < g.target && g.current > 0)
    } else if (filterBy === 'not-started') {
      filtered = filtered.filter(g => g.current === 0)
    }
    
    // Sort
    if (sortBy === 'progress') {
      filtered.sort((a, b) => (b.current / b.target) - (a.current / a.target))
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    } else if (sortBy === 'remaining') {
      filtered.sort((a, b) => (a.target - a.current) - (b.target - b.current))
    } else if (sortBy === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      filtered.sort((a, b) => (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0))
    }
    
    return filtered
  }, [goals, sortBy, filterBy, searchQuery, selectedCategory])

  const handleSaveGoal = (goalData) => {
    if (goalData.id) {
      // Update existing goal
      const existingGoal = goals.find(g => g.id === goalData.id)
      setGoals(goals.map(g => g.id === goalData.id ? {
        ...goalData,
        history: existingGoal?.history || []
      } : g))
    } else {
      // Add new goal
      const newGoal = {
        ...goalData,
        id: Date.now(),
        history: []
      }
      setGoals([...goals, newGoal])
    }
  }

  const handleDeleteGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id))
  }

  const handleEditGoal = (goal) => {
    setEditingGoal(goal)
    setIsModalOpen(true)
  }

  const handleAddGoal = () => {
    setEditingGoal(null)
    setIsModalOpen(true)
  }

  const handleExport = () => {
    exportGoals(goals)
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    try {
      const importedGoals = await importGoals(file)
      if (window.confirm(`Import ${importedGoals.length} goals? This will replace your current goals.`)) {
        setGoals(importedGoals)
      }
    } catch (error) {
      alert('Failed to import goals: ' + error.message)
    }
    // Reset file input
    e.target.value = ''
  }

  const handleIncrement = (id) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, current: Math.min(g.current + 1, g.target) } : g
    ))
  }

  const handleDecrement = (id) => {
    setGoals(goals.map(g => 
      g.id === id ? { ...g, current: Math.max(g.current - 1, 0) } : g
    ))
  }

  const handleDuplicateGoal = (goal) => {
    const newGoal = {
      ...goal,
      id: Date.now(),
      title: `${goal.title} (Copy)`,
      current: 0,
      history: []
    }
    setGoals([...goals, newGoal])
  }

  const handleAddFavorite = () => {
    const url = prompt('Enter URL:')
    const title = prompt('Enter title:') || 'New Favorite'
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`
      const newFavorite = {
        id: Date.now(),
        title,
        url: fullUrl,
        icon: '🔗',
        favicon: getFaviconUrl(fullUrl)
      }
      setFavorites([...favorites, newFavorite])
    }
  }

  const handleDeleteFavorite = (id) => {
    if (window.confirm('Delete this favorite?')) {
      setFavorites(favorites.filter(f => f.id !== id))
    }
  }

  const handleEditFavorite = (favorite) => {
    const newTitle = prompt('Enter new title:', favorite.title)
    const newUrl = prompt('Enter new URL:', favorite.url)
    if (newTitle && newUrl) {
      const fullUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`
      setFavorites(favorites.map(f => 
        f.id === favorite.id 
          ? { ...f, title: newTitle, url: fullUrl, favicon: getFaviconUrl(newUrl) }
          : f
      ))
    }
  }

  const handleAddApp = () => {
    const url = prompt('Enter URL:')
    const title = prompt('Enter title:') || 'New App'
    if (url) {
      const fullUrl = url.startsWith('http') ? url : `https://${url}`
      const newApp = {
        id: Date.now(),
        title,
        url: fullUrl,
        icon: '📱',
        favicon: getFaviconUrl(fullUrl)
      }
      setApps([...apps, newApp])
    }
  }

  const handleDeleteApp = (id) => {
    if (window.confirm('Delete this app?')) {
      setApps(apps.filter(a => a.id !== id))
    }
  }

  const handleEditApp = (app) => {
    const newTitle = prompt('Enter new title:', app.title)
    const newUrl = prompt('Enter new URL:', app.url)
    if (newTitle && newUrl) {
      const fullUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`
      setApps(apps.map(a => 
        a.id === app.id 
          ? { ...a, title: newTitle, url: fullUrl, favicon: getFaviconUrl(fullUrl) }
          : a
      ))
    }
  }

  const handleSaveToFirestore = async () => {
    try {
      setIsSaving(true)
      await setDoc(doc(db, 'dashboard', 'data'), {
        goals: goals,
        favorites: favorites,
        apps: apps,
        lastUpdated: new Date().toISOString()
      })
      alert('Saved successfully!')
    } catch (error) {
      console.error('Failed to save to Firestore:', error)
      alert('Failed to save: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="app">
        <div style={{ textAlign: 'center', padding: '40px', color: '#ffffff' }}>
          Loading...
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="main-header">
        <div className="header-content">
          <div className="header-right">
            {weather.location && (
              <div className="header-location">
                <span className="location-icon">📍</span>
                <span className="location-text">{weather.location}</span>
              </div>
            )}
            {weather.loading ? (
              <div className="header-weather loading">
                <span className="weather-loading">Loading...</span>
              </div>
            ) : weather.temp !== null ? (
              <div className="header-weather">
                <span className="weather-icon">{weather.condition}</span>
                <span className="weather-temp">{weather.temp}°</span>
              </div>
            ) : null}
            <div className="header-date">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      <header className="app-header">
        <div className="favorites-section">
          <div className="favorites-header">
            <h2 className="favorites-title">Favorites</h2>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button 
                className="save-btn" 
                onClick={handleSaveToFirestore} 
                disabled={isSaving}
                title="Save to Firestore"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button className="favorite-add-btn" onClick={handleAddFavorite} title="Add Favorite">
                +
              </button>
            </div>
          </div>
          <div className="favorites-grid">
            {favorites.length > 0 ? (
              favorites.map(favorite => (
                <div key={favorite.id} className="favorite-item">
                  <a 
                    href={favorite.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="favorite-link"
                  >
                    <div className="favorite-icon">
                      {favorite.favicon ? (
                        <img 
                          src={favorite.favicon} 
                          alt={favorite.title}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <span style={{ display: favorite.favicon ? 'none' : 'flex' }}>{favorite.icon}</span>
                    </div>
                    <div className="favorite-title">{favorite.title}</div>
                  </a>
                  <div className="favorite-actions">
                    <button 
                      className="favorite-edit-btn" 
                      onClick={() => handleEditFavorite(favorite)}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button 
                      className="favorite-delete-btn" 
                      onClick={() => handleDeleteFavorite(favorite.id)}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="favorites-empty">
                <p>No favorites yet. Click + to add one.</p>
              </div>
            )}
          </div>
        </div>

        <div className="apps-section">
          <div className="apps-header">
            <h2 className="apps-title">My Apps</h2>
            <button className="app-add-btn" onClick={handleAddApp} title="Add App">
              +
            </button>
          </div>
          <div className="apps-grid">
            {apps.length > 0 ? (
              apps.map(app => (
                <div key={app.id} className="app-item">
                  <a 
                    href={app.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="app-link"
                  >
                    <div className="app-icon">
                      {app.favicon ? (
                        <img 
                          src={app.favicon} 
                          alt={app.title}
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.nextSibling.style.display = 'flex'
                          }}
                        />
                      ) : null}
                      <span style={{ display: app.favicon ? 'none' : 'flex' }}>{app.icon}</span>
                    </div>
                    <div className="app-title">{app.title}</div>
                  </a>
                  <div className="app-actions">
                    <button 
                      className="app-edit-btn" 
                      onClick={() => handleEditApp(app)}
                      title="Edit"
                    >
                      ✎
                    </button>
                    <button 
                      className="app-delete-btn" 
                      onClick={() => handleDeleteApp(app.id)}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="apps-empty">
                <p>No apps yet. Click + to add one.</p>
              </div>
            )}
          </div>
        </div>

        <div className="header-top">
          <div className="digital-clock">
            <div className="clock-time">
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                second: '2-digit',
                hour12: false
              })}
            </div>
            <div className="clock-label">Time</div>
          </div>
          <div className="time-remaining">
            <span className="time-label">Days Remaining</span>
            <span className="time-value">{daysRemaining}</span>
          </div>
        </div>

        <div className="overall-progress">
          <div className="overall-progress-label">
            <span>Overall Progress</span>
            <span className="overall-percentage">{(stats?.overallProgress || 0).toFixed(1)}%</span>
          </div>
          <div className="overall-progress-bar">
            <div 
              className="overall-progress-fill" 
              style={{ width: `${stats?.overallProgress || 0}%` }}
            ></div>
          </div>
        </div>

        <button 
          className="controls-toggle"
          onClick={() => setControlsExpanded(!controlsExpanded)}
        >
          {controlsExpanded ? '▼ Hide Controls' : '▶ Show Controls'}
        </button>
        
        <div className={`controls-container ${controlsExpanded ? 'expanded' : ''}`}>
          <div className="controls">
            <div className="control-group search-group">
              <label htmlFor="search">Search:</label>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search goals..."
                className="control-input"
              />
            </div>
            <div className="control-group">
              <label htmlFor="sort">Sort:</label>
              <select 
                id="sort" 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="control-select"
              >
                <option value="default">Default</option>
                <option value="progress">Progress</option>
                <option value="name">Name</option>
                <option value="remaining">Remaining</option>
                <option value="priority">Priority</option>
              </select>
            </div>
            <div className="control-group">
              <label htmlFor="filter">Filter:</label>
              <select 
                id="filter" 
                value={filterBy} 
                onChange={(e) => setFilterBy(e.target.value)}
                className="control-select"
              >
                <option value="all">All</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="not-started">Not Started</option>
              </select>
            </div>
            {categories.length > 0 && (
              <div className="control-group">
                <label htmlFor="category">Category:</label>
                <select 
                  id="category" 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="control-select"
                >
                  <option value="all">All</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="control-group actions-group">
              <button className="btn-add-goal" onClick={handleAddGoal} title="Add New Goal">
                +
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="goals-grid">
        {sortedAndFilteredGoals.length > 0 ? (
          sortedAndFilteredGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              formatValue={formatValue}
              onEdit={() => handleEditGoal(goal)}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          ))
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <h3>No goals found</h3>
            <p>Try adjusting your search or filters, or add a new goal.</p>
          </div>
        )}
      </div>

      <EditGoalModal
        goal={editingGoal}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingGoal(null)
        }}
        onSave={handleSaveGoal}
        onDelete={handleDeleteGoal}
        onDuplicate={handleDuplicateGoal}
      />
    </div>
  )
}

export default App

