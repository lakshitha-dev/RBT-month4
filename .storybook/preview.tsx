import type { Preview } from '@storybook/react-vite';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    layout: 'padded',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    // Fail the a11y panel (and test runs) on WCAG violations instead of only reporting them.
    a11y: { test: 'error', options: { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } },
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: 'Colour theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  decorators: [
    (Story, context) => {
      const dark = context.globals.theme === 'dark';
      document.documentElement.classList.toggle('dark', dark);
      return (
        <div className="bg-surface p-4 text-ink">
          <Story />
        </div>
      );
    },
  ],
  tags: ['autodocs'],
};

export default preview;
