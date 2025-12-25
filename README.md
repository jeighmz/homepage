# Yearly Goals Dashboard

A beautiful, modern dashboard for tracking yearly goals with progress bars.

## Features

- 📊 Visual progress bars for each goal
- 🎨 Modern, responsive design
- 📱 Mobile-friendly interface
- 🎯 Overall progress tracking
- 💫 Smooth animations and transitions

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` folder.

## Customization

You can customize the goals by editing the `goals` array in `src/App.jsx`. Each goal has:
- `title`: The name of the goal
- `current`: Current progress value
- `target`: Target value for the year
- `unit`: Unit of measurement (books, miles, dollars, days, etc.)
- `color`: Color theme for the progress bar

## Technologies Used

- React 18
- Vite
- CSS3 (with modern features like backdrop-filter)

