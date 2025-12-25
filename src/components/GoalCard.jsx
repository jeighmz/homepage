import React from 'react'
import './GoalCard.css'

function GoalCard({ goal, formatValue, onEdit, onIncrement, onDecrement }) {
  const percentage = (goal.current / goal.target) * 100
  const remaining = goal.target - goal.current
  const isCompleted = goal.current >= goal.target
  
  // Calculate if on track (considering year progress)
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 1)
  const endOfYear = new Date(now.getFullYear(), 11, 31)
  const yearProgress = ((now - startOfYear) / (endOfYear - startOfYear)) * 100
  const goalProgress = percentage
  
  // Mutually exclusive indicators
  let trackStatus = null
  if (goalProgress >= yearProgress - 5) {
    trackStatus = 'on-track'
  } else if (goalProgress < yearProgress - 10) {
    trackStatus = 'behind'
  }

  // Calculate velocity (progress per day)
  const daysElapsed = Math.max(1, 365 - ((endOfYear - now) / (1000 * 60 * 60 * 24)))
  const dailyRate = goal.current / daysElapsed
  const remainingDays = (endOfYear - now) / (1000 * 60 * 60 * 24)
  const projectedCompletion = goal.current + (dailyRate * remainingDays)
  const velocityPercentage = (projectedCompletion / goal.target) * 100

  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#6b7280'
  }

  // Get progress trend from history
  const getTrend = () => {
    if (!goal.history || goal.history.length < 2) return null
    const recent = goal.history.slice(-7) // Last 7 days
    if (recent.length < 2) return null
    const first = recent[0].progress
    const last = recent[recent.length - 1].progress
    return last > first ? 'up' : last < first ? 'down' : 'stable'
  }

  const trend = getTrend()

  return (
    <div 
      className={`goal-card ${isCompleted ? 'completed' : ''}`}
      style={{
        '--goal-color': goal.color,
        '--goal-color-shadow': goal.color + '40',
        '--goal-color-light': goal.color + 'CC'
      }}
    >
      <div className="goal-header">
        <div className="goal-title-wrapper">
          {goal.icon && <span className="goal-icon">{goal.icon}</span>}
          <div className="goal-title-content">
            <h2 className="goal-title">{goal.title}</h2>
            {goal.category && (
              <span className="goal-category">{goal.category}</span>
            )}
          </div>
        </div>
        <div className="goal-header-right">
          {isCompleted && (
            <div className="completion-badge">
              <span>✓</span>
            </div>
          )}
        </div>
      </div>

      <div className="goal-stats">
        <div className="goal-stat">
          <span className="stat-label">Progress</span>
          <span className="stat-value" style={{ color: goal.color }}>
            {formatValue(goal.current, goal.unit)} / {formatValue(goal.target, goal.unit)}
          </span>
          {!isCompleted && (
            <div className="quick-actions">
              <button 
                className="quick-btn decrement"
                onClick={() => onDecrement(goal.id)}
                title="Decrease by 1"
              >
                −
              </button>
              <button 
                className="quick-btn increment"
                onClick={() => onIncrement(goal.id)}
                title="Increase by 1"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>


      <div className="progress-container">
        <div className="progress-info">
          <span className="progress-percentage-text">
            {percentage.toFixed(1)}% Complete
          </span>
          {!isCompleted && trackStatus && (
            <span className={`progress-status ${trackStatus}`}>
              {trackStatus === 'on-track' ? '✓ On Track' : '⚠ Behind'}
            </span>
          )}
        </div>
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ 
              width: `${percentage}%`,
              backgroundColor: goal.color
            }}
          ></div>
        </div>
      </div>

      <button className="goal-edit-btn" onClick={onEdit} title="Edit goal">
        Edit
      </button>
    </div>
  )
}

export default GoalCard

