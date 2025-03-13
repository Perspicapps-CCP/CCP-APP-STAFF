import { LocalCurrencyPipe } from './local-currency.pipe';

describe('LocalCurrencyPipe', () => {
  it('create an instance', () => {
    const pipe = new LocalCurrencyPipe();
    expect(pipe).toBeTruthy();
  });
});
