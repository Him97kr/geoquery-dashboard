# 🖥️ GeoQuery Frontend

> React + Redux + D3.js dashboard that visualises country intelligence data via the [GeoQuery GraphQL API](https://github.com/Him97kr/geoquery).

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![Redux](https://img.shields.io/badge/Redux_Toolkit-2.0-764ABC?logo=redux)](https://redux-toolkit.js.org)
[![Apollo](https://img.shields.io/badge/Apollo_Client-3.9-311C87?logo=apollographql)](https://apollographql.com)
[![D3](https://img.shields.io/badge/D3.js-7.0-F9A03C?logo=d3dotjs)](https://d3js.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38BDF8?logo=tailwindcss)](https://tailwindcss.com)

## 🌐 Live Demo
https://Him97kr.github.io/geoquery-dashboard

---

## ✨ Features

- **Home** — global stats dashboard with world choropleth map
- **Explorer** — searchable, filterable, sortable country grid
- **Rankings** — bar charts, bubble charts, line charts via D3.js
- **Outbreaks** — WHO disease alert map and alert cards
- **Country Detail** — full demographics, COVID stats, WHO alerts per country
- **Redux Toolkit** — global state for filters, UI, and country data
- **Apollo Client** — GraphQL queries with fragment reuse and cache-first policy
- **D3.js** — bar, line, bubble, choropleth charts all animated

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- [GeoQuery API](https://github.com/Him97kr/geoquery) running on `geoquery-production.up.railway.app`

```bash
# Clone
git clone https://github.com/Him97kr/geoquery-dashboard.git
cd geoquery-dashboard

# Install
npm install

# Set environment
cp .env.example .env.local
# Edit .env.local if your API runs on a different port

# Start dev server
npm run dev
```

Open `http://localhost:3000`

---

## 🏗️ Architecture

```
Redux Store
├── countries  — fetched data (list, selected, globalStats, rankings)
├── filters    — search, region, sort, population range
└── ui         — chart type, map metric, toasts

Apollo Client
└── Queries    — country, countries, search, globalStats, top10, outbreaks
    └── Synced into Redux via custom hooks (useCountryData.js)

Pages
├── Home          → useGlobalStats + ChoroplethMap
├── Explorer      → useCountries + CountryCard grid
├── Rankings      → useTopByPopulation + useTopByCovid + D3 charts
├── Outbreaks     → useCountriesWithOutbreaks + ChoroplethMap
└── CountryDetail → GET_COUNTRY query → StatCards + outbreak list
```

---

## 📦 Stack

| Library | Purpose |
|---|---|
| React 18 | UI framework |
| Redux Toolkit | Global state management |
| Apollo Client | GraphQL data fetching + caching |
| D3.js v7 | Bar, line, bubble, choropleth charts |
| React Router v6 | Client-side routing |
| Tailwind CSS v3 | Utility-first styling |
| Vite | Build tool |

---

## 🔗 Related Projects

| Project | Description |
|---|---|
| [GeoQuery](https://github.com/Him97kr/geoquery) | Go GraphQL API that powers this frontend |
| [GeoVitals](https://github.com/Him97kr/chrome-extension-geovitals) | Chrome extension exploring similar country data |
| [World Population Dashboard](https://github.com/Him97kr/world-population-dashboard) | D3.js population visualisation |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
