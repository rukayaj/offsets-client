import { OffsetsPage } from './app.po';

describe('offsets App', () => {
  let page: OffsetsPage;

  beforeEach(() => {
    page = new OffsetsPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!!');
  });
});
