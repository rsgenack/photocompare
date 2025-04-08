# Photo Compare 📸

A modern web application for comparing and ranking photos using various comparison methods. Built with Next.js and React.

## ✨ Features

### Multiple Comparison Methods
- **Side-by-Side Comparison** 🔄
- **Interactive Slider** (powered by [JuxtaposeJS](https://github.com/NUKnightLab/juxtapose)) 🎚️
- **Ranking Engine** (inspired by [Pub Meeple's Ranking Engine](https://pubmeeple.com/ranking-engine/)) 🏆

### Modern UI/UX
- Beautiful, responsive interface built with Radix UI components 🎨
- Dark/Light theme support 🌓
- Drag-and-drop interface for easy photo uploads 📤
- Real-time photo comparison and adjustments ⚡

### Advanced Features
- Automatic aspect ratio detection and warnings ⚠️
- Zoom and pan controls for detailed comparison 🔍
- Progress tracking and confidence scoring 📊
- Exportable results and rankings 📤

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) - React framework
- [React](https://reactjs.org/) - UI library
- [Radix UI](https://www.radix-ui.com/) - UI component library
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## 📦 Project Structure

```
photocompare/
├── app/                 # Next.js app directory
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── ...            # Feature-specific components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static assets
├── styles/             # Global styles
└── ...                # Configuration files
```

## 🚀 Development

### Prerequisites
- Node.js (version 18.2.0 or higher)
- npm or yarn package manager

### Installation
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

3. Run the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

### JuxtaposeJS
- **Project**: [JuxtaposeJS](https://github.com/NUKnightLab/juxtapose)
- **Organization**: [Northwestern University Knight Lab](https://knightlab.northwestern.edu/)
- **License**: [MPL 2.0](https://www.mozilla.org/en-US/MPL/2.0/)
- **Contribution**: Core comparison functionality and slider implementation

### Radix UI
- **Project**: [Radix UI](https://www.radix-ui.com/)
- **Organization**: [Modulz](https://www.modulz.app/)
- **License**: [MIT](https://github.com/radix-ui/primitives/blob/main/LICENSE)
- **Contribution**: Accessible UI components and design system

### Tailwind CSS
- **Project**: [Tailwind CSS](https://tailwindcss.com/)
- **Organization**: [Tailwind Labs](https://tailwindcss.com/about)
- **License**: [MIT](https://github.com/tailwindlabs/tailwindcss/blob/master/LICENSE)
- **Contribution**: Utility-first CSS framework

## 💡 Inspiration

This project was inspired by [Brad Wojcik](https://github.com/bradwoj)'s work on [Pub Meeple's Ranking Engine](https://pubmeeple.com/ranking-engine/). The ranking engine's elegant approach to pairwise comparisons and its practical applications in decision-making (from dinner orders to wedding invitations) served as a foundation for this project's comparison and ranking features.

Special thanks to the Knight Lab team for their work on JuxtaposeJS, which powers our interactive comparison features.

---

Made with ❤️ by [rsgenack](https://github.com/rsgenack) 