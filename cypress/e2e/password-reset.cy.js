describe('Deriv Password Reset Flow', () => {
  beforeEach(() => {
    cy.visit('/dashboard/login');
  });

  it('should have accessible forgot password link', () => {
    cy.contains('a', /forgot|password|reset/i)
      .should('be.visible')
      .and('have.attr', 'href')
      .then(href => {
        expect(href).to.match(/forgot|reset|password/i);
      });
  });

  it('should navigate to password reset page', () => {
    cy.contains('a', /forgot|password|reset/i)
      .click();
    
    cy.url().should('include', /forgot|reset|password/i);
    cy.get('h1, h2, [role="heading"]').should('contain.text', /reset|forgot/i);
  });

  it('should display email input on reset page', () => {
    cy.contains('a', /forgot|password|reset/i)
      .click();
    
    cy.get('input[type="email"], input[name*="email" i]')
      .should('be.visible');
  });

  it('should validate email format', () => {
    cy.contains('a', /forgot|password|reset/i)
      .click();
    
    cy.get('input[type="email"], input[name*="email" i]')
      .type('invalid-email')
      .blur();
    
    cy.get('[role="alert"], .error, .invalid')
      .should('be.visible');
  });

  it('should have submit button for reset', () => {
    cy.contains('a', /forgot|password|reset/i)
      .click();
    
    cy.get('button[type="submit"], button:contains("Send"), button:contains("Reset"), button:contains("Submit")')
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('should have back to login link', () => {
    cy.contains('a', /forgot|password|reset/i)
      .click();
    
    cy.contains('a', /back|login|sign in/i)
      .should('be.visible');
  });

  it('should not submit empty email', () => {
    cy.contains('a', /forgot|password|reset/i)
      .click();
    
    cy.get('button[type="submit"], button:contains("Send"), button:contains("Reset"), button:contains("Submit")')
      .click();
    
    cy.get('[role="alert"], .error, .invalid')
      .should('be.visible');
  });

  it('should be responsive', () => {
    cy.contains('a', /forgot|password|reset/i)
      .click();
    
    [
      { width: 375, height: 667 },
      { width: 768, height: 1024 },
      { width: 1280, height: 720 },
    ].forEach(vp => {
      cy.viewport(vp.width, vp.height);
      cy.get('input[type="email"], input[name*="email" i]').should('be.visible');
    });
  });

  it('should have CSRF protection on reset form', () => {
    cy.contains('a', /forgot|password|reset/i)
      .click();
    
    cy.get('input[name*="csrf" i], input[name*="token" i], [data-csrf]')
      .should('exist');
  });
});
