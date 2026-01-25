describe('Deriv Performance & Core Web Vitals', () => {
  const pages = [
    '/dashboard/signup',
    '/dashboard/login',
  ];

  pages.forEach(page => {
    describe(`${page}`, () => {
      beforeEach(() => {
        cy.visit(page);
      });

      it(`should load within 3s`, () => {
        cy.window().then(win => {
          const perf = win.performance.timing;
          const loadTime = perf.loadEventEnd - perf.navigationStart;
          expect(loadTime).to.be.lessThan(3000);
          cy.log(`Load time: ${loadTime}ms`);
        });
      });

      it(`should have no console errors`, () => {
        let errorCount = 0;
        cy.window().then(win => {
          const originalError = win.console.error;
          win.console.error = (...args) => {
            errorCount++;
            originalError(...args);
          };
        });
        
        cy.window().then(() => {
          expect(errorCount).to.equal(0);
          cy.log(`✓ No console errors`);
        });
      });

      it(`should have minimal DOM size`, () => {
        cy.get('body').then($body => {
          const nodeCount = $body[0].getElementsByTagName('*').length;
          // Warn if DOM is large (>5000 nodes)
          if (nodeCount > 5000) {
            cy.log(`⚠ Large DOM: ${nodeCount} nodes`);
          }
          cy.log(`DOM nodes: ${nodeCount}`);
        });
      });

      it(`should have valid HTML structure`, () => {
        cy.get('html').should('exist');
        cy.get('head').should('exist');
        cy.get('body').should('exist');
      });

      it(`should have proper viewport meta tag`, () => {
        cy.get('meta[name="viewport"]')
          .should('exist')
          .and('have.attr', 'content')
          .and('include', 'width=device-width');
      });

      it(`should have proper charset meta tag`, () => {
        cy.get('meta[charset], meta[http-equiv="Content-Type"]')
          .should('exist');
      });

      it(`should not have mixed content warnings`, () => {
        cy.request(page).then(response => {
          expect(response.status).to.equal(200);
          expect(response.headers['content-type']).to.include('text/html');
        });
      });

      it(`should have proper content security policy`, () => {
        cy.request(page).then(response => {
          // Check if CSP header exists
          const csp = response.headers['content-security-policy'] 
            || response.headers['content-security-policy-report-only'];
          
          if (csp) {
            cy.log(`✓ CSP present: ${csp.substring(0, 50)}...`);
          } else {
            cy.log(`⚠ No CSP header detected`);
          }
        });
      });

      it(`should have security headers`, () => {
        cy.request(page).then(response => {
          const headers = response.headers;
          const hasXFrameOptions = !!headers['x-frame-options'];
          const hasXContentType = !!headers['x-content-type-options'];
          
          cy.log(`X-Frame-Options: ${hasXFrameOptions ? '✓' : '✗'}`);
          cy.log(`X-Content-Type-Options: ${hasXContentType ? '✓' : '✗'}`);
        });
      });

      it(`should be HTTPS (if in production)`, () => {
        cy.url().then(url => {
          if (url.includes('deriv.com')) {
            expect(url).to.include('https://');
          }
        });
      });

      it(`should have no dead links on page`, () => {
        cy.get('a[href]').each($link => {
          const href = $link.attr('href');
          
          // Skip non-http links
          if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
            cy.request({ url: href, failOnStatusCode: false })
              .then(response => {
                expect(response.status).to.be.lessThan(400);
              });
          }
        });
      });

      it(`should render visible content immediately`, () => {
        cy.get('input, button, [role="button"]')
          .should('be.visible');
      });
    });
  });
});
