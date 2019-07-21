import { getGreeting } from '../support/app.po';

describe('exceptionless', () => {
  beforeEach(() => cy.visit('/'));

  it('should display welcome message', () => {
    getGreeting().contains('Welcome to Exceptionless!');
  });
});
