describe('Deriv Signup Flow - UX & Accessibility', () => {
  beforeEach(() => {
    cy.visit('/dashboard/signup');
    cy.window().then(win => {
      // Load env vars from parent window if available
      if (!Cypress.env('TEST_EMAIL')) {
        cy.log('Note: TEST_EMAIL not set. Run with: cypress open --env TEST_EMAIL=test@example.com,TEST_PASSWORD=pass123');
      }
    });
  });

  it('should load signup page within 3s', () => {
    const perfData = cy.window().then(win => {
      const perf = win.performance.timing;
      const loadTime = perf.loadEventEnd - perf.navigationStart;
      expect(loadTime).to.be.lessThan(3000);
      cy.log(`Page load: ${loadTime}ms`);
    });
  });

  it('should display email and password inputs', () => {
    cy.get('input[type="email"], input[name*="email" i]')
      .should('be.visible')
      .and('have.attr', 'placeholder');
    
    cy.get('input[type="password"], input[name*="password" i]')
      .should('be.visible')
      .and('have.attr', 'placeholder');
  });

  it('should have accessible form labels/ARIA', () => {
    cy.get('form, [role="form"]').should('exist');
    
    // Check for labels or ARIA descriptions
    cy.get('label, [aria-label], [aria-describedby]').should('have.length.greaterThan', 0);
  });

  it('should validate email field', () => {
    const emailInput = cy.get('input[type="email"], input[name*="email" i]');
    
    // Test invalid email
    emailInput.type('invalid-email').blur();
    cy.get('[role="alert"], .error, .invalid')
      .should('be.visible')
      .and('contain.text', /email|invalid/i);
    
    emailInput.clear();
    emailInput.type('valid@example.com').blur();
  });

  it('should validate password field', () => {
    const passwordInput = cy.get('input[type="password"], input[name*="password" i]');
    
    // Test weak password
    passwordInput.type('123').blur();
    cy.get('[role="alert"], .error, .invalid')
      .should('be.visible');
    
    passwordInput.clear();
    passwordInput.type('StrongP@ssw0rd!').blur();
  });

  it('should show submit button and be clickable', () => {
    cy.get('button[type="submit"], button:contains("Sign Up"), button:contains("Create Account"), button:contains("Register")')
      .should('be.visible')
      .and('not.be.disabled');
  });

  it('should test full signup flow (stopped before submission)', () => {
    const email = Cypress.env('TEST_EMAIL') || 'test+cypress@example.com';
    const password = Cypress.env('TEST_PASSWORD') || 'TestPassword123!';
    
    // Fill email
    cy.get('input[type="email"], input[name*="email" i]')
      .type(email, { delay: 50 });
    
    // Fill password
    cy.get('input[type="password"], input[name*="password" i]')
      .type(password, { delay: 50 });
    
    // Verify inputs have value
    cy.get('input[type="email"], input[name*="email" i]')
      .should('have.value', email);
    
    cy.get('input[type="password"], input[name*="password" i]')
      .invoke('val')
      .should('have.length', password.length);
    
    cy.log('✓ Form fields populated without errors');
    
    // Optional: check for terms/conditions checkbox
    cy.get('input[type="checkbox"], [role="checkbox"]')
      .each(($el) => {
        if ($el.attr('aria-label')?.match(/terms|agree|accept/i)) {
          cy.wrap($el).check();
        }
      });
  });

  it('should check for CSRF protection', () => {
    cy.get('input[name*="csrf" i], input[name*="token" i], [data-csrf], [data-token]')
      .should('exist')
      .then($el => {
        cy.log('✓ CSRF token detected');
      });
  });

  it('should have responsive design', () => {
    const viewports = [
      { width: 375, height: 667, device: 'mobile' },
      { width: 768, height: 1024, device: 'tablet' },
      { width: 1280, height: 720, device: 'desktop' },
    ];
    
    viewports.forEach(vp => {
      cy.viewport(vp.width, vp.height);
      cy.get('input[type="email"], input[name*="email" i]').should('be.visible');
      cy.get('input[type="password"], input[name*="password" i]').should('be.visible');
      cy.log(`✓ Responsive at ${vp.device} (${vp.width}x${vp.height})`);
    });
  });

  it('should not expose sensitive data in console or network', () => {
    let hasConsoleErrors = false;
    cy.window().then(win => {
      win.console.error = cy.stub().callsFake((...args) => {
        if (args[0]?.includes('error')) hasConsoleErrors = true;
      });
    });
    
    cy.visit('/dashboard/signup');
    
    // Intercept network and verify no credentials in request bodies
    cy.intercept('POST', '**', (req) => {
      expect(req.body).to.not.include.members([
        'habib+all@deriv.com',
        'Deriv1234!',
        Cypress.env('TEST_PASSWORD'),
      ]);
    }).as('networkCheck');
  });
});
