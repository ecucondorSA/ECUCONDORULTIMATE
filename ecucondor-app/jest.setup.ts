// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    };
  },
  usePathname() {
    return '/';
  },
  useSearchParams() {
    return new URLSearchParams();
  },
}));

// Mock Framer Motion to avoid animation issues in tests
jest.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: {
      div: React.forwardRef(function MotionDiv({ children, ...props }: React.HTMLAttributes<HTMLDivElement>, ref: React.ForwardedRef<HTMLDivElement>) { return 
        React.createElement('div', { ...props, ref }, children);
      }),
      section: React.forwardRef(function MotionSection({ children, ...props }: React.HTMLAttributes<HTMLElement>, ref: React.ForwardedRef<HTMLElement>) {
        return React.createElement('section', { ...props, ref }, children);
      }),
      button: React.forwardRef(function MotionButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>, ref: React.ForwardedRef<HTMLButtonElement>) {
        return React.createElement('button', { ...props, ref }, children);
      }),
      span: React.forwardRef(function MotionSpan({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>, ref: React.ForwardedRef<HTMLSpanElement>) {
        return React.createElement('span', { ...props, ref }, children);
      }),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useInView: () => true,
  };
});

// Suppress console errors during tests unless explicitly needed
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});