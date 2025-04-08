# HelpConnect - Community Support Network

HelpConnect is a modern web application that connects people in need with those who can offer assistance. Built with Next.js 15 and powered by Supabase, it enables community members to post requests for help and offer support to others in their area.

> **⚠️ Development Status:** This application is currently under active development. While we strive to provide a stable experience, you may encounter bugs or incomplete features. We appreciate your patience and welcome any feedback or bug reports.

![HelpConnect Screenshot](public/hero-image.jpg)

## Features

- 🤝 **Community Support System**

  - Post help requests with detailed descriptions
  - Browse and respond to community requests
  - Real-time updates for new requests and offers
  - Location-based request filtering

- 👥 **User Profiles**

  - Secure authentication via Supabase
  - Reputation system with ratings and reviews
  - Skill tags and verification badges
  - Profile customization options

- 💬 **Interactive Communication**

  - Real-time messaging between users
  - Comment system on help requests
  - Notification system for updates
  - Private messaging capabilities

- 🛡️ **Safety Features**

  - User verification system
  - Report/flag inappropriate content
  - Optional location masking
  - Secure data handling

- 🎨 **Modern UI/UX**
  - Responsive design for all devices
  - Dark mode support
  - Smooth animations and transitions
  - Accessible interface (WCAG compliant)

## Tech Stack

- **Frontend:**

  - Next.js 15 (App Router)
  - TypeScript
  - Tailwind CSS
  - Framer Motion
  - ShadCN UI

- **Backend:**

  - Supabase (Database & Authentication)
  - PostgreSQL
  - Real-time subscriptions
  - Storage for user content

- **Development:**
  - Bun package manager
  - ESLint
  - TypeScript
  - Git version control

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (Package Manager)
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)
- [Supabase Account](https://supabase.com)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/helpconnect.git
   cd helpconnect
   ```

2. Install dependencies:

   ```bash
   bun install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:

   ```bash
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Setup

1. Create a new Supabase project
2. Set up the following tables:
   - `profiles` (extends auth.users)
   - `help_requests`
   - `offers`
   - `messages`
3. Enable Row Level Security (RLS)
4. Configure storage buckets for user uploads

## Project Structure

```
helpconnect/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (main)/            # Protected routes
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   ├── requests/         # Request-related components
│   └── ui/              # UI components
├── lib/                  # Utility functions
│   ├── supabase/        # Supabase client
│   └── types/           # TypeScript types
├── public/              # Static assets
└── styles/             # Global styles
```

## Development

### Code Style

- Follow TypeScript best practices
- Use ESLint for code linting
- Follow component-based architecture
- Implement proper error handling
- Write JSDoc comments for functions

### Testing

```bash
bun test        # Run tests
bun test:watch  # Watch mode
```

### Building for Production

```bash
bun run build   # Create production build
bun start       # Start production server
```

## Deployment

The application is deployed on Vercel. The production version is available at:
[https://help-connect-amber.vercel.app](https://help-connect-amber.vercel.app)

### Deployment Steps

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy with production settings
4. Monitor performance and logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the excellent framework
- Supabase team for the backend infrastructure
- Vercel for hosting and deployment
- All contributors and community members

## Support

For support, please:

- Open an issue on GitHub
- Join our community Discord
- Contact us through the website

---

Built with ❤️ by the HelpConnect Team
