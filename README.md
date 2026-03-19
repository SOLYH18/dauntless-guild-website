# Dauntless Guild Website

🐉 **Emerald Wind Dragon Theme** - Official website for the Dauntless guild in Flyff Universe.

## 🌟 Features

- **Emerald Dragon Theme** - Dark forest aesthetic with emerald accents
- **Live Raid Tracker** - Shows active lineups (connects to bot API)
- **Guild Statistics** - Top raiders, MVP standings, raid breakdown
- **Player Profiles** - Individual stats and achievements
- **Recruitment Portal** - Apply to join the guild
- **Mobile Responsive** - Works on all devices

## 🎨 Design

**Color Palette:**
- Deep Forest Green (`#0a1f15`) - Background
- Emerald (`#50c878`) - Primary accent
- Gold (`#ffd700`) - Secondary accent
- Wind Blue (`#4ecdc4`) - Highlights

## 🚀 Deployment

### Option 1: GitHub Pages (Free)

1. Push this repo to GitHub
2. Go to Settings > Pages
3. Select "Deploy from a branch" > "main" > "/ (root)"
4. Your site will be at: `https://yourusername.github.io/dauntless-website`

### Option 2: Netlify (Free)

1. Drag and drop this folder to Netlify
2. Get instant deployment with custom domain support

### Option 3: Custom Domain

1. Buy domain (e.g., dauntlessguild.com ~$12/year)
2. Point DNS to GitHub Pages or Netlify
3. Configure in hosting settings

## 🔌 Connecting to Bot Data

To make the website show **live data** from your Discord bot:

1. **Export data from bot** - Create an API endpoint or scheduled data export
2. **Update JavaScript** - Replace placeholder data with fetch calls to your API
3. **CORS setup** - Allow website domain to access bot data

Example API endpoints to create:
- `/api/active-raids` - Current lineups
- `/api/stats` - Guild statistics
- `/api/leaderboard` - Top raiders

## 📝 Customization

Edit these files to customize:
- `index.html` - Content, text, links
- `style.css` - Colors, fonts, spacing
- `script.js` - Interactivity, API calls

## 🎯 Future Features

- [ ] Real-time raid updates via WebSocket
- [ ] Player profile pages
- [ ] Guild event calendar
- [ ] Application form with Discord integration
- [ ] Live stream embed

---

**Dauntless Guild** - "Where legends are forged"
