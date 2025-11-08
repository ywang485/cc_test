# Task Tracker & Reward System

A gamified task tracking application that rewards you with coins for completing tasks. Use your earned coins to purchase free time for YouTube, games, and other leisure activities!

## Features

### Task Management
- Add tasks to your to-do list
- Mark tasks as complete/incomplete
- Delete tasks when no longer needed
- Persistent storage using browser localStorage

### Coin Reward System
- Earn **3 coins** for every task you complete
- Coins are automatically added when you check off a task
- Coins are removed if you uncheck a completed task

### Time Shop
Purchase free time with your earned coins:
- **15 minutes** for 5 coins
- **30 minutes** for 9 coins (best value!)
- **60 minutes** for 15 coins

### Timer
- Start a countdown timer for your purchased free time
- Pause and resume the timer as needed
- Reset timer (unused time is returned to your balance)
- Visual display with minutes and seconds

## How to Use

### Getting Started
1. Open `index.html` in your web browser
2. Start adding tasks to your list
3. Complete tasks to earn coins
4. Purchase free time in the shop
5. Use the timer when you want to enjoy your free time

### Workflow Example
1. Add "Finish homework" to your task list
2. Complete the homework and check it off → Earn 3 coins
3. Add and complete more tasks to accumulate coins
4. When you have 9 coins, purchase 30 minutes of free time
5. Click "Start" on the timer and enjoy your YouTube video!

## Technical Details

- **Frontend Only**: Pure HTML, CSS, and JavaScript (no frameworks required)
- **Data Persistence**: Uses browser localStorage to save your progress
- **Responsive Design**: Works on desktop and mobile devices
- **No Server Required**: Simply open the HTML file in any modern browser

## Files

- `index.html` - Main application structure
- `styles.css` - All styling and animations
- `app.js` - Application logic and functionality

## Browser Compatibility

Works with any modern browser that supports:
- ES6 JavaScript
- localStorage API
- CSS Grid and Flexbox

## Tips

- The 30-minute option offers the best value (0.3 coins per minute vs 0.33 and 0.25 for other options)
- You can pause the timer if you need to take a break
- Resetting the timer returns unused time to your balance
- Your progress is automatically saved, so you can close and reopen the app anytime

## Future Enhancements (Ideas)

- Customizable coin rewards per task
- Task categories and priorities
- Statistics and achievement badges
- Custom time packages
- Export/import data functionality
- Dark mode theme

---

Enjoy your productivity journey!
