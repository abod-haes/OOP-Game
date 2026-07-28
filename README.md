# RoboRescue — Interactive Java OOP Learning Game

RoboRescue is a browser-based learning game that teaches Java object-oriented programming through rescue-themed coding challenges, progressive levels, instant validation, and animated feedback.

- **Live project:** [oop-game-beta.vercel.app](https://oop-game-beta.vercel.app/)
- **Frontend case study:** [RoboRescue — Abdulrahman Hares Portfolio](https://abdulrahman-hares.com/en/projects/roborescue)
- **Developer:** [Abdulrahman Hares](https://abdulrahman-hares.com)

## Learning topics

- Classes and objects
- Encapsulation
- Constructors and access modifiers
- Inheritance and method overriding
- Interfaces and abstraction
- Polymorphism

## Product highlights

- Progressive curriculum organised as data-driven sections and levels
- Monaco Editor coding workspace inside the browser
- Starter Java code and focused tasks for each mission
- Rule-based solution validation with actionable feedback
- Progress, challenge map, profile, and authentication flows
- Framer Motion feedback across guidance, loading, and success states

## Technology

- Next.js 14
- TypeScript
- Monaco Editor
- Java learning content
- Framer Motion
- Next.js API routes

## Environment setup

Create `.env.local` when Google authentication is enabled:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
