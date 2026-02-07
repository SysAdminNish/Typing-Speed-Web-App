# ⌨️ Typing Speed Test

A clean, modern web application for testing and improving your typing speed. Track your progress, analyze your performance, and build better typing habits.



## ✨ Features

- **Multiple Test Durations**: Choose from 30 seconds to 10 minutes
- **Real-time Feedback**: See your typing accuracy as you type with color-coded characters
- **Comprehensive Metrics**: Track WPM (Words Per Minute), accuracy, consistency, and more
- **Performance Analytics**: View WPM over time with interactive charts
- **Progress Tracking**: Store test history and personal bests in local storage
- **Smooth Scrolling**: Auto-scrolling passage display that follows your typing
- **Keyboard Shortcuts**: Quick access with Enter to start and Escape to exit
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (for ES6 module support)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/SysAdminNish/Typing-Speed-Web-App.git
cd typing-speed-test
```

2. Serve the application using a local web server:

**Option 1: Using Python**
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option 2: Using Node.js**
```bash
npx serve
```

**Option 3: Using VS Code**
- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

3. Open your browser and navigate to:
```
http://localhost:8000
```

## 📖 How to Use

1. **Select Duration**: Choose your preferred test duration (30s, 1min, 2min, 5min, or 10min)
2. **Start Test**: Click "Start Test" or press Enter
3. **Type Away**: Type the displayed passage as accurately as possible
4. **View Results**: See your WPM, accuracy, consistency, and performance graph
5. **Track Progress**: Visit the Reports page to see your history and personal bests

### Keyboard Shortcuts

- **Enter**: Start a new test (from landing screen)
- **Escape**: Exit current test and return to home

## 📊 Metrics Explained

- **WPM (Words Per Minute)**: Your typing speed, calculated as (characters typed / 5) / (time in minutes)
- **Accuracy**: Percentage of correctly typed characters
- **Consistency**: Standard deviation of your WPM throughout the test (lower is better)
- **Characters Typed**: Total number of characters you entered during the test

## 🏗️ Project Structure

```
typing-speed-test/
├── index.html          # Main HTML file
├── styles.css          # All styling
├── app.js             # Main application controller
├── test.js            # Test logic and metrics calculation
├── chart.js           # Chart.js integration for visualizations
├── storage.js         # LocalStorage management
├── texts.js           # Typing passage collection
└── README.md          # This file
```

## 🛠️ Technical Details

### Built With

- **Vanilla JavaScript** (ES6 modules)
- **Chart.js** - For performance visualizations
- **LocalStorage API** - For persistent data storage
- **CSS3** - Modern, responsive styling

### Browser Support

- Chrome/Edge 89+
- Firefox 87+
- Safari 14+
- Opera 75+

## 💾 Data Storage

All test results are stored locally in your browser using the LocalStorage API. Your data never leaves your device, ensuring complete privacy.

### Stored Data

- Test history (date, duration, WPM, accuracy, consistency)
- Personal best records per duration
- Per-second WPM data for performance graphs

### Clear Data

To clear your test history, open your browser's developer console and run:
```javascript
localStorage.removeItem('typingTestHistory');
```

## 🎨 Customization

### Adding New Text Passages

Edit `texts.js` and add new passages to the `PASSAGES` array:

```javascript
const PASSAGES = [
  "Your new passage here...",
  // ... existing passages
];
```

### Changing Colors

Modify the CSS variables in `styles.css`:

```css
:root {
  --color-correct: #22c55e;
  --color-incorrect: #ef4444;
  --color-primary: #3b82f6;
  /* ... other variables */
}
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Ideas for Contributions

- [ ] Add more text passage categories (code, technical writing, literature)
- [ ] Implement different keyboard layouts support
- [ ] Add dark mode toggle
- [ ] Create difficulty levels
- [ ] Add multiplayer/competitive mode
- [ ] Export test results as CSV/JSON
- [ ] Add sound effects for typing feedback

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Text passages sourced from classic literature, famous quotes, and public domain works
- Inspired by popular typing test platforms like Monkeytype and TypeRacer
- Chart.js for beautiful, responsive charts

## 📧 Contact

Project Link: https://github.com/SysAdminNish/Typing-Speed-Web-App

---

**Happy Typing!** 🎯 Practice makes perfect. Track your progress and watch your speed improve over time.
