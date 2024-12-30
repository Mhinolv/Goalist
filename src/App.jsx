import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import confetti from 'canvas-confetti'

function App() {
  const [goals, setGoals] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [expandedGoals, setExpandedGoals] = useState(new Set())
  const [quote, setQuote] = useState({ q: "The journey of a thousand miles begins with one step.", a: "Lao Tzu" })
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const formRef = useRef(null)
  const editInputRef = useRef(null)
  const [newGoal, setNewGoal] = useState({
    text: '',
    days: '',
    why: '',
    consequences: ''
  })

  const triggerConfetti = () => {
    const count = 200
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#000000', '#333333', '#666666']
    }

    function fire(particleRatio, opts) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      })
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    })

    fire(0.2, {
      spread: 60,
    })

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    })

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    })
  }

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await axios.get('https://cors-anywhere.herokuapp.com/https://zenquotes.io/api/today', {
          headers: {
            'Origin': null
          }
        })
        if (response.data && response.data[0]) {
          setQuote(response.data[0])
        }
      } catch (error) {
        console.log('Using default quote')
      }
    }
    fetchQuote()
  }, [])

  const handleShowForm = () => {
    setShowForm(!showForm)
    if (!showForm && formRef.current) {
      setTimeout(() => {
        formRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        })
      }, 100)
    }
  }

  const addGoal = (e) => {
    e.preventDefault()
    if (!newGoal.text.trim() || !newGoal.days.trim()) return

    setGoals([
      ...goals,
      {
        id: Date.now(),
        text: newGoal.text,
        days: parseInt(newGoal.days),
        why: newGoal.why,
        consequences: newGoal.consequences,
        status: 'not started',
        completed: false
      }
    ])
    setNewGoal({
      text: '',
      days: '',
      why: '',
      consequences: ''
    })
    setShowForm(false)
  }

  const startEditing = (goal) => {
    setEditingId(goal.id)
    setEditText(goal.text)
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus()
      }
    }, 50)
  }

  const handleEditSubmit = (e) => {
    e.preventDefault()
    if (editText.trim()) {
      setGoals(goals.map(goal =>
        goal.id === editingId ? { ...goal, text: editText.trim() } : goal
      ))
      setEditingId(null)
    }
  }

  const handleEditKeyDown = (e) => {
    if (e.key === 'Escape') {
      setEditingId(null)
    }
  }

  const toggleGoalExpansion = (id) => {
    const newExpanded = new Set(expandedGoals)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedGoals(newExpanded)
  }

  const removeGoal = (id) => {
    setGoals(goals.filter(goal => goal.id !== id))
  }

  const updateStatus = (id, status) => {
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, status } : goal
    ))
  }

  const toggleCompleted = (id) => {
    const goal = goals.find(g => g.id === id)
    const wasCompleted = goal?.completed
    
    setGoals(goals.map(goal =>
      goal.id === id ? { ...goal, completed: !goal.completed } : goal
    ))

    if (!wasCompleted) {
      triggerConfetti()
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewGoal(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const totalGoals = goals.length
  const startedGoals = goals.filter(goal => goal.status === 'in progress').length
  const completedGoals = goals.filter(goal => goal.completed).length
  const totalDays = goals.reduce((sum, goal) => sum + goal.days, 0)

  return (
    <div className="container">
      <div className="header">
        <h1>Goalist</h1>
        <p className="tagline">No fluff, just progress.</p>
      </div>

      <div className="quote-container">
        <p className="quote-text">"{quote.q}"</p>
        <p className="quote-author">— {quote.a}</p>
      </div>
      
      <div className="summary">
        <h2>Goals Summary</h2>
        <div className="summary-content">
          <span>Total Goals: {totalGoals}</span>
          <span>Started: {startedGoals}/{totalGoals}</span>
          <span>Completed: {completedGoals}/{totalGoals}</span>
          <span>Total Days: {totalDays}</span>
        </div>
      </div>

      <button 
        className="add-goal-button"
        onClick={handleShowForm}
      >
        {showForm ? 'Cancel' : 'Add New Goal'}
      </button>

      <form ref={formRef} onSubmit={addGoal} className={`goal-form ${showForm ? 'visible' : ''}`}>
        <div className="form-row">
          <label className="form-label">What is your goal?</label>
          <input
            type="text"
            name="text"
            value={newGoal.text}
            onChange={handleInputChange}
            placeholder="Enter your goal"
            required
          />
        </div>

        <div className="form-row">
          <label className="form-label">How many days will it take?</label>
          <input
            type="number"
            name="days"
            value={newGoal.days}
            onChange={handleInputChange}
            placeholder="Number of days"
            min="1"
            max="365"
            required
          />
        </div>

        <div className="form-row">
          <label className="form-label">Why does achieving this goal matter to you?</label>
          <textarea
            name="why"
            value={newGoal.why}
            onChange={handleInputChange}
            placeholder="What's your motivation?"
            required
          />
        </div>

        <div className="form-row">
          <label className="form-label">What happens if you don't complete this goal?</label>
          <textarea
            name="consequences"
            value={newGoal.consequences}
            onChange={handleInputChange}
            placeholder="Consider the consequences"
            required
          />
        </div>

        <button type="submit">Add Goal</button>
      </form>

      <div className="goals-list">
        {goals.map(goal => (
          <div key={goal.id}>
            <div className="goal-item">
              <span 
                className={`material-icons caret ${expandedGoals.has(goal.id) ? 'expanded' : ''}`}
                onClick={() => toggleGoalExpansion(goal.id)}
              >
                chevron_right
              </span>
              <input
                type="checkbox"
                checked={goal.completed}
                onChange={() => toggleCompleted(goal.id)}
              />
              <div className="goal-text-container">
                {editingId === goal.id ? (
                  <form onSubmit={handleEditSubmit} style={{ margin: 0 }}>
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={handleEditSubmit}
                      className="edit-input"
                    />
                  </form>
                ) : (
                  <>
                    <span 
                      className="goal-text"
                      style={{ textDecoration: goal.completed ? 'line-through' : 'none' }}
                    >
                      {goal.text}
                    </span>
                    <button 
                      className="edit-btn"
                      onClick={() => startEditing(goal)}
                    >
                      <span className="material-icons">edit</span>
                    </button>
                  </>
                )}
              </div>
              <select
                value={goal.status}
                onChange={(e) => updateStatus(goal.id, e.target.value)}
              >
                <option value="not started">Not Started</option>
                <option value="in progress">In Progress</option>
              </select>
              <span className="days-info">
                {goal.days} days
              </span>
              <span className="percentage">
                {((goal.days / 365) * 100).toFixed(1)}% of year
              </span>
              <button className="delete-btn" onClick={() => removeGoal(goal.id)}>
                <span className="material-icons">delete</span>
              </button>
            </div>
            <div className={`goal-details ${expandedGoals.has(goal.id) ? 'visible' : ''}`}>
              <p><strong>Why:</strong> {goal.why}</p>
              <p><strong>If not completed:</strong> {goal.consequences}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
