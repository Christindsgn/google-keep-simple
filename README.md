# Google Keep Simple - PWA

A lightweight, mobile-first Progressive Web App (PWA) that replicates Google Keep's core functionality with a focus on simplicity and performance.

## ✨ Features

### 📱 **PWA Capabilities**
- **Installable** - Add to home screen on mobile/desktop
- **Offline support** - Works without internet connection
- **Responsive design** - Optimized for all screen sizes
- **Fast loading** - Lightweight and efficient

### 🎯 **Core Functionality**
- **Smart note taking** - Per-line input system
- **Multiple input types** - Text, checkbox, and bullet lists
- **Auto-save** - Notes persist in browser storage
- **Mobile keyboard handling** - Bottom toolbar sticks above keyboard

### 🔄 **Input Type Switching**
- **Double-tap empty lines** to cycle through input types
- **Text → Checkbox → Bullet → Text** seamless switching
- **Content-aware** - Only empty lines can switch types

### 🗑️ **Smart Delete System**
- **Cross button deletion** for checkbox/bullet items
- **First-line protection** - Converts to normal text instead of deleting
- **Focus management** - Automatically focuses previous/next line

### ⌨️ **Advanced Keyboard Handling**
- **Two-step backspace** for special input types
- **Enter key behavior** - Creates new lines with appropriate type
- **Content preservation** - Maintains lines with existing content

## 🚀 **Quick Start**

### **Live Demo**
- **Desktop:** Open in any modern browser
- **Mobile:** Add to home screen for app-like experience

### **Local Development**
```bash
# Clone the repository
git clone https://github.com/yourusername/google-keep-simple.git
cd google-keep-simple

# Start local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

### **Mobile Testing**
```bash
# Get your computer's IP address
ifconfig | grep "inet " | grep -v 127.0.0.1

# Access from mobile device
# http://YOUR_IP_ADDRESS:8080
```

## 📱 **Mobile Installation**

### **iOS Safari:**
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Select "Add to Home Screen"
4. Tap "Add"

### **Android Chrome:**
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home screen"
4. Tap "Add"

## 🛠️ **Technical Stack**

- **HTML5** - Semantic markup
- **CSS3** - Flexbox, Grid, custom properties
- **Vanilla JavaScript** - No frameworks, pure ES6+
- **PWA APIs** - Service Worker, Web App Manifest
- **Local Storage** - Data persistence

## 🎨 **Design Features**

- **Google Material Icons** - Consistent 24px icons
- **Inter Font** - Modern, readable typography
- **Responsive layout** - Adapts to any screen size
- **Touch-friendly** - Optimized for mobile interaction
- **Keyboard-aware** - Smart positioning with mobile keyboards

## 📁 **Project Structure**

```
google-keep-simple/
├── index.html              # Main HTML structure
├── style.css               # All styling and responsive design
├── script.js               # Core JavaScript functionality
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── icon.svg                # App icon (SVG)
├── icon-192.png           # App icon (192px)
├── icon-512.png           # App icon (512px)
├── favicon.ico            # Browser favicon
├── .gitignore             # Git ignore rules
└── README.md              # This documentation
```

## 🔧 **Development**

### **Key Features Implemented:**
- ✅ **Per-line input system** - Each line is independent
- ✅ **Type switching** - Double-tap to cycle input types
- ✅ **Smart deletion** - First-line protection
- ✅ **Backspace handling** - Two-step deletion for special types
- ✅ **Mobile optimization** - Keyboard and viewport handling
- ✅ **PWA features** - Installable, offline-capable
- ✅ **Auto-save** - Local storage persistence

### **Browser Support:**
- ✅ **Chrome/Chromium** (recommended for PWA features)
- ✅ **Firefox**
- ✅ **Safari** (iOS/Desktop)
- ✅ **Edge**

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

## 🙏 **Acknowledgments**

- Inspired by Google Keep's clean interface
- Built with modern web standards
- Optimized for mobile-first experience

---

**Made with ❤️ for a simpler note-taking experience** 