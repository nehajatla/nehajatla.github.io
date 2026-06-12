# Neha Jatla - Portfolio

A modern, responsive portfolio website featuring smooth scrolling, beautiful animations, and a clean dark theme.

## Features

✨ **Modern Design**
- Dark theme with gradient accents
- Smooth scrolling navigation
- Responsive grid layouts
- Floating animations and transitions

🎨 **Customizable**
- Easy to update colors via CSS variables
- Modular sections (Hero, About, Projects, Skills, Contact)
- Font system using Google Fonts (Inter & Poppins)

📱 **Mobile Friendly**
- Fully responsive design
- Mobile hamburger menu
- Touch-optimized interactions

⚡ **Performance**
- Lightweight and fast
- Optimized animations
- Smooth scroll behavior

## Getting Started

### File Structure

```
portfolio/
├── index.html        # Main HTML file
├── styles.css        # All styling and animations
├── script.js         # Interactive features and animations
├── assets/
│   ├── images/       # Project screenshots and profile photo
│   └── videos/       # Project demo videos
└── resume.pdf        # (Optional) Your resume
```

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nehajatla9/neha-portfolio.git
   cd neha-portfolio
   ```

2. **Add your content**
   - Replace placeholder text with your information
   - Add project images to `assets/images/`
   - Add project videos to `assets/videos/`

3. **Update personal information**
   - Edit the "About Me" section
   - Update project descriptions
   - Add your social media links
   - Update contact information

### Deployment with GitHub Pages

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "initial portfolio"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/portfolio.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select "Deploy from a branch"
   - Choose branch: `main`, folder: `/` (root)
   - Click "Save"
   - Wait ~60 seconds
   - Your site will be live at: `https://YOUR_USERNAME.github.io/portfolio/`

## Customization

### Update Colors

Edit the CSS variables in `styles.css`:

```css
:root {
    --primary: #6366f1;        /* Main brand color */
    --secondary: #ec4899;      /* Accent color */
    --dark-bg: #0f172a;        /* Background */
    --text-primary: #f1f5f9;   /* Main text */
}
```

### Add Projects

Duplicate a `.project-card` div in `index.html` and update:
- Image path
- Title
- Description
- Technology tags
- Link

### Update Skills

Modify skill items in the Skills section:
- Change skill names
- Adjust progress percentages (0-100)
- Add/remove skill categories

## Available Sections

- **Hero**: Eye-catching introduction
- **About**: Your story and statistics
- **Projects**: Showcase your best work
- **Skills**: Technology proficiencies
- **Contact**: Multiple ways to reach you

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance Tips

1. **Optimize Images**: Compress images before adding to `assets/images/`
2. **Lazy Loading**: Images are optimized for performance
3. **CDN Fonts**: Google Fonts are served via CDN

## Future Enhancements

- [ ] Add blog section
- [ ] Integrate contact form
- [ ] Add dark/light mode toggle
- [ ] Add testimonials section
- [ ] Implement smooth scroll library

## License

This project is open source and available under the MIT License.

## Support

For questions or issues, please open a GitHub issue.

---

**Made with ❤️ by Neha Jatla**