# Deployment & CI Integration Guide

## GitHub Actions (Already Set Up)

Tests run automatically on every push to `master`, `main`, or `develop`:

```bash
git push origin master
```

Then check: **Actions tab** → select your workflow → view results

## Local Testing Before Push

```bash
# Install once
make install

# Run all tests (headless)
make test

# Or specific suites
make test-signup
make test-login
make test-perf
make test-a11y

# With test credentials
make test-signup TEST_EMAIL=habib+test@deriv.com TEST_PASSWORD=SecurePass123!

# Interactive mode (GUI opens in browser)
make test-open
make test-login-open
```

## Adding to Your CD Pipeline

### GitHub Actions (Current)

Already configured in `.github/workflows/test.yml`

- Runs on: push + pull_request
- Tests: Node 20.x and 22.x
- Artifacts: videos, screenshots, reports (7-14 days retention)

**To add test credentials to CI:**

1. Go to repo **Settings → Secrets and variables → Actions**
2. Add two secrets:
   - `TEST_EMAIL`: `habib+ci-test@deriv.com`
   - `TEST_PASSWORD`: (your secure password)
3. Update `.github/workflows/test.yml`:

```yaml
- name: Run Cypress tests
  run: npm run test:cypress:headless
  env:
    TEST_EMAIL: ${{ secrets.TEST_EMAIL }}
    TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

### GitLab CI

Create `.gitlab-ci.yml`:

```yaml
test:cypress:
  image: cypress/included:13.17.0
  script:
    - npm install
    - npm run test:cypress:headless
  artifacts:
    paths:
      - cypress/videos/
      - cypress/reports/
    reports:
      junit: cypress/reports/*.xml
  only:
    - master
    - main
    - develop
```

### Jenkins

Create `Jenkinsfile`:

```groovy
pipeline {
  agent any
  
  stages {
    stage('Install') {
      steps {
        sh 'npm install'
      }
    }
    
    stage('Test') {
      steps {
        sh 'npm run test:cypress:headless'
      }
    }
    
    stage('Report') {
      steps {
        publishHTML([
          reportDir: 'cypress/reports',
          reportFiles: 'index.html',
          reportName: 'Cypress Report'
        ])
      }
    }
  }
  
  post {
    always {
      junit 'cypress/reports/junit.xml'
      archiveArtifacts artifacts: 'cypress/videos/**,cypress/screenshots/**'
    }
  }
}
```

### Docker Deployment

Run tests in Docker (guaranteed to work):

```bash
# Build image with all deps
docker run -it \
  -v $(pwd):/workspace \
  -w /workspace \
  cypress/included:13.17.0 \
  npm run test:cypress:headless

# Or with env vars
docker run -it \
  -v $(pwd):/workspace \
  -w /workspace \
  -e TEST_EMAIL=$TEST_EMAIL \
  -e TEST_PASSWORD=$TEST_PASSWORD \
  cypress/included:13.17.0 \
  npm run test:cypress:headless
```

### GitHub Actions + Slack Notification

Update `.github/workflows/test.yml` to notify Slack on failure:

```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "Cypress tests failed",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn",
              "text": "❌ Tests failed on ${{ github.ref }}\n<${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}|View details>"
            }
          }
        ]
      }
```

## Pre-deployment Checklist

Before deploying to production:

```bash
# 1. Run full test suite locally
make test

# 2. Run with real test account credentials
make test TEST_EMAIL=your-test@deriv.com TEST_PASSWORD=...

# 3. Check for console errors
make test-perf

# 4. Verify accessibility
make test-a11y

# 5. Review HTML report
make test-report

# 6. Commit changes
git add .
git commit -m "Pre-deployment: all tests passing"

# 7. Push to trigger CI
git push origin master
```

## Monitoring Test Results

**GitHub Actions:**
- Go to repo → Actions → select workflow
- View logs, artifacts, test videos
- Download HTML report

**Artifacts Retention:**
- Videos: 7 days
- Screenshots: 7 days
- Reports: 14 days

## Troubleshooting

### Tests fail locally but pass in CI

- Check Node version: `node --version`
- Ensure dependencies installed: `npm install`
- Clear cache: `rm -rf node_modules && npm install`
- Check env vars: `echo $TEST_EMAIL`

### CI passes but tests fail on production

- Tests may be hitting staging URLs (check baseUrl in `cypress.config.js`)
- Real password may have special characters that need escaping
- Signup flow may create duplicate accounts (test email needs to be unique)

### Artifacts not uploading

- Check permissions in GitHub Actions settings
- Verify file paths in workflow (e.g., `cypress/videos/**`)
- Ensure tests actually run (check for exit code 0)

## Next Steps

1. **Add test credentials to GitHub Secrets** (recommended for CI)
2. **Push to GitHub** to test the CI pipeline
3. **Monitor first run** in Actions tab
4. **Download report artifact** to review results
5. **Add more test scenarios** as needed (e.g., post-signup dashboard)

## Script Reference

```bash
# Local development
npm test                  # All tests, headless
npm run test:cypress      # Open GUI
npm run test:signup       # Signup only
npm run test:login        # Login only
npm run test:password     # Password reset
npm run test:performance  # Performance & Core Web Vitals
npm run test:a11y         # Accessibility

# Make targets
make test                 # All tests
make test-open           # GUI
make test-signup         # Signup headless
make test-login-open     # Login GUI
make test-perf           # Performance headless
make test-a11y-open      # Accessibility GUI
make test-report         # Generate HTML report
make clean               # Clean artifacts
make ci                  # Full CI pipeline

# With credentials
make test-signup TEST_EMAIL=... TEST_PASSWORD=...
```

---

**Status:** ✓ Ready for deployment
