import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn } from 'storybook/test';
import { Pagination } from './Pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  args: { page: 1, pageCount: 13, pageSize: 10, total: 124, onPageChange: fn() },
  parameters: {
    docs: {
      description: {
        component:
          'Labelled `<nav>` with previous/next buttons, a windowed page list and `aria-current="page"` on the current page.',
      },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Interactive: Story = {
  render: (args) => {
    function Demo() {
      const [page, setPage] = useState(args.page);
      return (
        <Pagination
          {...args}
          page={page}
          onPageChange={(p) => {
            args.onPageChange(p);
            setPage(p);
          }}
        />
      );
    }
    return <Demo />;
  },
  play: async ({ canvas, userEvent, args }) => {
    await expect(canvas.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(args.onPageChange).toHaveBeenCalledWith(2);
    await expect(canvas.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  },
};

export const MiddlePage: Story = { args: { page: 7 } };

export const FewPages: Story = { args: { page: 2, pageCount: 3, total: 25 } };
