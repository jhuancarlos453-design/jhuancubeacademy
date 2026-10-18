import { expect, it } from 'vitest';
import { googleAccountSelection } from './auth-config';
it('requests explicit Google account selection rather than reusing a fixed account', () => {
  expect(googleAccountSelection.prompt).toBe('select_account');
});