# 📸 Photo Compare

A modern web application for comparing and ranking photos using various comparison methods. Built with Next.js, React, and Tailwind CSS.

> 💡 **Inspiration**: This project was inspired by [Brad Wojcik](https://github.com/boldandbrad)'s amazing work on [Pub Meeple's Ranking Engine](https://www.pubmeeple.com/ranking-engine). We use his ranking engine almost daily to make decisions - from choosing dinner to planning our wedding! Thanks Brad for showing us how fun and useful ranking systems can be! 🎉

## ✨ Features

- **🖼️ Multiple Comparison Methods**:
  - Side-by-side comparison
  - Interactive slider comparison (powered by [JuxtaposeJS](https://github.com/NUKnightLab/juxtapose))
  - Real-time adjustments and controls
  - Aspect ratio validation

- **🎨 Modern UI/UX**:
  - Clean, intuitive interface
  - Responsive design
  - Dark/Light theme support
  - Smooth animations and transitions
  - Drag-and-drop image upload

- **🚀 Advanced Features**:
  - ELO rating system for photo ranking
  - Image compression and optimization
  - Detailed logging and debugging
  - Keyboard shortcuts for quick navigation
  - Progress tracking

## 🛠️ Tech Stack

- **🎭 Frontend**:
  - [Next.js](https://nextjs.org/) - React framework
  - [React](https://reactjs.org/) - UI library
  - [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
  - [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible components
  - [Framer Motion](https://www.framer.com/motion/) - Animation library

- **🔧 Development Tools**:
  - [TypeScript](https://www.typescriptlang.org/) - Type safety
  - [ESLint](https://eslint.org/) - Code linting
  - [Prettier](https://prettier.io/) - Code formatting
  - [Jest](https://jestjs.io/) - Testing framework

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js (version 18.2.0 or higher)
- npm or yarn package manager

### 💻 Installation

1. Clone the repository:
```bash
git clone https://github.com/rsgenack/photocompare.git
cd photocompare
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser 🌐

## 📁 Project Structure

```
photocompare/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── photo-compare/  # Photo comparison components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
├── styles/             # Global styles
└── utils/              # Helper utilities
```

## 👩‍💻 Development

### 📜 Available Scripts

- `npm run dev` - Start development server 🚀
- `npm run build` - Build for production 🏗️
- `npm run start` - Start production server 🏁
- `npm run lint` - Run ESLint 🔍
- `npm run format` - Format code with Prettier ✨

### 🔑 Key Components

- `photo-compare.jsx` - Main comparison component
- `juxtapose-comparison.jsx` - Slider comparison implementation
- `comparison-view.jsx` - Side-by-side comparison view
- `image-uploader.jsx` - Image upload and management

## 🤝 Contributing

1. Fork the repository 🍴
2. Create your feature branch (`git checkout -b feature/amazing-feature`) 🌿
3. Commit your changes (`git commit -m 'Add some amazing feature'`) 💾
4. Push to the branch (`git push origin feature/amazing-feature`) 🚀
5. Open a Pull Request 📬

## 🙏 Acknowledgments

This project builds upon and extends several amazing open-source projects:

- **[JuxtaposeJS](https://github.com/NUKnightLab/juxtapose)** by Northwestern University Knight Lab
  - Provides the core slider comparison functionality
  - Enables interactive before/after image comparisons
  - Used under the MIT License
  - Special thanks to the Knight Lab team for their excellent work

- **[Radix UI](https://www.radix-ui.com/)** by Modulz
  - Provides accessible, unstyled UI components
  - Enables consistent, accessible user interfaces
  - Used under the MIT License

- **[Tailwind CSS](https://tailwindcss.com/)** by Adam Wathan
  - Provides utility-first CSS framework
  - Enables rapid UI development
  - Used under the MIT License

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Deployment

The application is deployed on Vercel and can be accessed at [v0-photo-compare.vercel.app](https://v0-photo-compare.vercel.app/).

---

Made with ❤️ by the Photo Compare team 