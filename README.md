# 📋 Attendance System Landing Page

A dynamic landing page for viewing attendance records, designed for GitHub Pages deployment.

## 🌟 Features

- **Dynamic File Detection**: Automatically discovers and lists attendance HTML files
- **Search & Filter**: Search through attendance records by date or name
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Embedded Viewing**: View attendance records directly in the page using iframes
- **Easy Management**: Simple system for adding new attendance files
- **GitHub Pages Ready**: Optimized for GitHub Pages deployment

## 🚀 Quick Start

### 1. Deploy to GitHub Pages

1. Fork or clone this repository
2. Go to your repository settings
3. Navigate to "Pages" section
4. Select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Your landing page will be available at `https://yourusername.github.io/repository-name`

### 2. Adding New Attendance Files

#### Method 1: Using the Manifest File (Recommended)

1. Add your attendance HTML file to the repository root
2. Edit `attendance-manifest.json` and add a new entry:

```json
{
  "filename": "attendance-2024-03-15.html",
  "title": "Attendance - March 15, 2024",
  "date": "2024-03-15",
  "description": "Weekly team meeting",
  "category": "meeting"
}
```

3. Update the `lastUpdated` timestamp
4. Commit and push your changes

#### Method 2: Automatic Discovery

If you don't use the manifest file, the system will automatically detect files following these naming conventions:
- `attendance-YYYY-MM-DD.html` (e.g., `attendance-2024-03-15.html`)
- `attendance-session-XX.html` (e.g., `attendance-session-03.html`)

## 📁 File Structure

```
attendance-landpage/
├── index.html                    # Main landing page
├── attendance-manifest.json      # File manifest (optional but recommended)
├── attendance-2024-01-15.html   # Sample attendance file
├── attendance-2024-02-01.html   # Sample attendance file
├── attendance-session-01.html   # Sample attendance file
└── README.md                     # This file
```

## 🎨 Customization

### Styling
The landing page uses embedded CSS for easy customization. Key color variables and styles can be modified in the `<style>` section of `index.html`.

### Naming Conventions
- **Date-based**: `attendance-YYYY-MM-DD.html`
- **Session-based**: `attendance-session-XX.html`
- **Custom**: Any filename starting with "attendance-"

### Categories
Available categories in the manifest:
- `foundry` - Foundry Battle
- `canyon` - Canyon Battle

## 🔧 Technical Details

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive design
- Progressive enhancement for older browsers

### File Detection Methods
1. **Manifest-based**: Reads from `attendance-manifest.json` (preferred)
2. **Discovery-based**: Attempts to fetch predefined file patterns
3. **Fallback**: Graceful degradation if no files are found

### Security Considerations
- All files are served from the same domain
- No external dependencies for core functionality
- Client-side only (no server-side processing required)

## 📱 Mobile Support

The landing page is fully responsive and includes:
- Touch-friendly interface
- Optimized layouts for small screens
- Readable text and accessible controls
- Smooth scrolling and transitions

## 🛠️ Development

### Local Testing
1. Clone the repository
2. Open `index.html` in a web browser
3. For full functionality, serve from a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   ```

### Adding Features
The codebase is modular and well-commented. Key areas for extension:
- File detection logic in `getAttendanceFilesList()`
- Display formatting in `formatDisplayName()`
- Search functionality in `filterFiles()`

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues or questions:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include browser version and steps to reproduce

---

**Happy attendance tracking! 📊**
#
