import React, { useState, useEffect } from 'react'
import './EditGoalModal.css'

function EditGoalModal({ goal, isOpen, onClose, onSave, onDelete, onDuplicate }) {
  const [formData, setFormData] = useState({
    title: '',
    current: 0,
    target: 0,
    unit: 'items',
    color: '#3b82f6',
    icon: '🎯',
    category: '',
    priority: 'medium',
    notes: ''
  })

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        current: goal.current || 0,
        target: goal.target || 0,
        unit: goal.unit || 'items',
        color: goal.color || '#3b82f6',
        icon: goal.icon || '🎯',
        category: goal.category || '',
        priority: goal.priority || 'medium',
        notes: goal.notes || ''
      })
    } else {
      setFormData({
        title: '',
        current: 0,
        target: 0,
        unit: 'items',
        color: '#3b82f6',
        icon: '🎯',
        category: '',
        priority: 'medium',
        notes: ''
      })
    }
  }, [goal])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({ ...goal, ...formData })
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      onDelete(goal.id)
      onClose()
    }
  }

  const colorOptions = [
    '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', 
    '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'
  ]

  const iconOptions = [
    '🎯', '📚', '🏃', '💰', '🇪🇸', '✍️', '🎓', 
    '💪', '🎨', '🎵', '🌱', '🚀', '⭐', '🏆'
  ]

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{goal ? 'Edit Goal' : 'New Goal'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label>Icon</label>
            <div className="icon-selector">
              {iconOptions.map(icon => (
                <button
                  key={icon}
                  type="button"
                  className={`icon-option ${formData.icon === icon ? 'selected' : ''}`}
                  onClick={() => setFormData({ ...formData, icon })}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="title">Goal Title</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="e.g., Read 50 Books"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="current">Current Progress</label>
              <input
                id="current"
                type="number"
                min="0"
                value={formData.current}
                onChange={(e) => setFormData({ ...formData, current: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="target">Target</label>
              <input
                id="target"
                type="number"
                min="1"
                value={formData.target}
                onChange={(e) => setFormData({ ...formData, target: parseFloat(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="unit">Unit</label>
            <input
              id="unit"
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              placeholder="e.g., books, miles, dollars"
            />
          </div>

          <div className="form-group">
            <label>Color</label>
            <div className="color-selector">
              {colorOptions.map(color => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${formData.color === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <input
                id="category"
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Health, Learning"
              />
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="form-select"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any notes or details about this goal..."
              rows="3"
              className="form-textarea"
            />
          </div>

          <div className="modal-actions">
            {goal && (
              <button type="button" className="btn-delete" onClick={handleDelete}>
                Delete
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-save">
                {goal ? 'Save Changes' : 'Add Goal'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditGoalModal

