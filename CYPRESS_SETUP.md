# Cypress Setup for Deriv Signup Testing

## Install
```bash
npm install --save-dev cypress
```

## Run Tests

### Interactive Mode (GUI)
```bash
npx cypress open
```
Then click "E2E Testing" → select Chrome → click "signup.cy.js"

### Headless Mode (CI/Automation)
```bash
npx cypress run --spec cypress/e2e/signup.cy.js
```

### With Environment Variables
```bash
npx cypress run \
  --spec cypress/e2e/signup.cy.js \
  --env TEST_EMAIL=habib+test@deriv.com,TEST_PASSWORD=YourPassword123!
```

### Generate HTML Report
```bash
npx cypress run --spec cypress/e2e/signup.cy.js --reporter html
# Report: cypress/reports/index.html
```

## What Tests Do

| Test | What It Checks | Why It Matters |
|------|----------------|----------------|
| Page load | Loads in <3s | User experience |
| Form visibility | Email/password inputs visible | Core UX |
| Accessibility | Labels + ARIA present | Compliance |
| Email validation | Error on invalid email | Data quality |
| Password validation | Error on weak password | Security |
| Submit button | Present and clickable | User can proceed |
| Full flow | Fill all fields | Happy path works |
| CSRF protection | Token in form | Security |
| Responsive | Works on mobile/tablet/desktop | Device coverage |
| Network security | No credentials in requests | Secret safety |

## Important Notes

1. **Credentials Safe:** Tests use environment variables. They never print passwords.
2. **Stop Before Submit:** Test fills form but stops before actual account creation.
3. **No Account Created:** Safe to run repeatedly without spam.
4. **Network Logs:** Cypress captures requests/responses → review reports before sharing.

## Output Files

- `cypress/videos/` - Screen recordings of test runs
- `cypress/screenshots/` - Failed test screenshots
- `cypress/reports/index.html` - HTML report with details

## Next Steps

1. Create actual test account email (habib+cypress-test@deriv.com)
2. Set a secure test password
3. Run: `npx cypress run --env TEST_EMAIL=... --spec cypress/e2e/signup.cy.js`
4. Review the HTML report
5. Report findings back for UX improvements

## Integrating into CI

Add to GitHub Actions / GitLab CI:

```yaml
- name: Run Cypress Tests
  run: |
    npm install
    npx cypress run \
      --spec cypress/e2e/signup.cy.js \
      --env TEST_EMAIL=${{ secrets.TEST_EMAIL }} \
      --env TEST_PASSWORD=${{ secrets.TEST_PASSWORD }}
```

Store `TEST_EMAIL` and `TEST_PASSWORD` as repo secrets (not in code).
