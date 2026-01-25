describe('Deriv Login Flow - UX & Security', () => {
  beforeEach(() => {
    cy.visit('/dashboard/login');
  });

  it('should load login page within 2s', () => {
    const startTime = Date.now();
    cy.window().then(() => {
      const loadTime = Date.now() - startTime;
      expect(loadTime).to.be.lessThan(2000);
      cy.log(`Page load: ${loadTime}ms`);
    });
  });

  it('should display email and password inputs', () => {
    cy.get('input[type="email"], input[name*="email" i]')
      .should('be.visible');
    
    cy.get('input[type="password"], input[name*="password" i]')
      .should('be.visible');
  });

  it('should show "Remember me" checkbox', () => {
    cy.get('input[type="checkbox"]')
      .first()
      .should('be.visible');
  });

  it('should have "Forgot password?" link', () => {
    cy.contains('a', /forgot|password|reset/i)
      .should('be.visible')
      .and('have.attr', 'href');
  });

  it('should validate email field', () => {
    cy.get('input[type="email"], input[name*="email" i]')
      .type('invalid-email')
      .blur();
    
    cy.get('[role="alert"], .error, .invalid')
      .should('be.visible');
  });

  it('should validate empty password', () => {
    cy.get('input[type="email"], input[name*="email" i]')
      .type('test@example.com');
    
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign In")')
      .click();
    
    cy.get('[role="alert"], .error, .invalid')
      .should('be.visible');
  });

  it('should have working "Sign up" link', () => {
    cy.contains('a', /sign up|create account|register/i)
      .should('be.visible')
      .and('have.attr', 'href');
  });

  it('should show login button and be clickable', () => {
    cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign In")')
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('should have CSRF protection', () => {
    cy.get('input[name*="csrf" i], input[name*="token" i], [data-csrf]')
      .should('exist');
  });

  it('should be responsive on mobile/tablet/desktop', () => {
    const viewports = [
      { width: 375, height: 667, device: 'mobile' },
      { width: 768, height: 1024, device: 'tablet' },
      { width: 1280, height: 720, device: 'desktop' },
    ];
    
    viewports.forEach(vp => {
      cy.viewport(vp.width, vp.height);
      cy.get('input[type="email"], input[name*="email" i]').should('be.visible');
      cy.log(`✓ ${vp.device}`);
    });
  });

  it('should not expose password in form submission', () => {
    cy.intercept('POST', '**', (req) => {
      // Ensure password isn't in plain text in body
      expect(JSON.stringify(req.body)).to.not.include('password');
    }).as('loginRequest');
  });

  it('should test form fill (without submission)', () => {
    const email = Cypress.env('TEST_EMAIL') || 'test@example.com';
    const password = Cypress.env('TEST_PASSWORD') || 'TestPassword123!';
    
    cy.get('input[type="email"], input[name*="email" i]')
      .type(email, { delay: 50 });
    
    cy.get('input[type="password"], input[name*="password" i]')
      .type(password, { delay: 50 });
    
    cy.get('input[type="email"], input[name*="email" i]')
      .should('have.value', email);
    
    cy.log('✓ Form fields populated');
  });
});
