/// <reference types="cypress" />
describe('draggable', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('Displays the example page and moves boxes around', () => {
    cy.get('#app').should('be.visible');
    cy.get('#app')
      .get('.box')
      .should('have.length.at.least', 26)
      .should('have.class', 'revue-draggable')
      .each((el) => {
        const originalPosition = el.position();
        const box = Cypress.$(el)[0];
        const coords = { x: 200, y: 300 };
        box.dispatchEvent(new MouseEvent('mousedown'));
        box.dispatchEvent(new MouseEvent('mousemove', { x: 10, y: 0 }));
        box.dispatchEvent(
          new MouseEvent('mousemove', {
            clientX: coords.x + 10,
            clientY: coords.y + 10
          })
        );
        expect(el.position()).exist;
        expect(originalPosition).not.eq(el.position());
        box.dispatchEvent(new MouseEvent('mouseup'));
      });
  });
});
