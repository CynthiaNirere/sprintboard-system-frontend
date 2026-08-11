import { test, expect } from '@playwright/test';

// SEED DATA THIS SUITE DEPENDS ON — confirm these exist in whatever DB this
// runs against:
//   - A ticket titled exactly "Demo Ticket for Automation" in the backlog (Test 2)
//   - A user matching "me myself" as an assignable option (Test 5)
//   - A user with email "me@gmail.com" to add to a project (Test 5)

test.describe('SprintBoard E2E Tests', () => {
  // Test 1: User Login and View StoryBoard
  test('User can successfully login in and view the dashboard', async({ page }) => {

    // Navigate to app
    await page.goto('/');

    // Fill in credentials for Test User
    const emailField = await page.getByPlaceholder('jane.doe@gmail.com');
    await emailField.fill('test.user@example.com');

    const passwordField = await page.getByPlaceholder('abc123');
    await passwordField.fill('Test1234!');

    // Click login
    await page.getByRole('button', { name: "Log In" }).click();

    // Verify we are redirected to the storyboard
    await expect(page).toHaveURL(/.*storyboard/);
    await expect(page.getByText('SprintBoard')).toBeVisible();

    // Logout
    await page.getByRole('button', { name: "Log Out" }).click();
  });

  // Test 2: Add a Comment to a Ticket
  test('User can add a comment to a ticket in the backlog', async ({ page }) => {
    // Login with Admin credentials
    await page.goto('/');
    await login(page);

    // Navigate to the Backlog
    await page.getByRole('link', { name: 'Backlog' }).click();

    // Click on an existing ticket to open the modal
    // Here we are using a seeded ticket expected to exist in Sprint 1, the expected ticket title should still
    // be visible even when navigating to the backlog
    await page.getByText('Demo Ticket for Automation').click();
    
    // Click the Comments tab
    await page.getByText("Comments").click();

    // Grab the comment description field and fill it with some text
    const commentDescriptionField = await page.getByPlaceholder("Add a comment. Use @Name to mention someone.");
    await commentDescriptionField.fill('This is an automated E2E test comment!');

    // Submit comment
    await page.getByRole('button', { name: "Comment" }).click();

    // Expect comment to be visible
    await expect(page.locator('text=This is an automated E2E test comment!').first()).toBeVisible();
  });

  // Test 3: Add a recurring sprint
  test('User can add a recurring sprint', async ({ page }) => {
    // Login with admin credentials
    await login(page);

    // Navigate to sprints
    await page.getByRole('link', { name: 'Sprints' }).click();

    // Add new sprint
    await page.getByRole('button', { name: "New Sprint" }).click();
    await page.getByPlaceholder("e.g. Internal Analytics Portal").fill("Automated E2E Sprint Recurrence");
    await page.locator('input[type="date"]').fill('2026-10-10');
    await page.locator('input[type="number"]').first().fill('14');
    await page.locator('input[type="number"]').nth(1).fill('4');

    // Submit recurring sprint
    await page.getByRole('button', { name: "Create Sprint" }).click();

    // Verify new sprints appear on the page
    await expect(page.getByText("Automated E2E Sprint Recurrence 1")).toBeVisible();
    await expect(page.getByText("Automated E2E Sprint Recurrence 2")).toBeVisible();
    await expect(page.getByText("Automated E2E Sprint Recurrence 3")).toBeVisible();
    await expect(page.getByText("Automated E2E Sprint Recurrence 4")).toBeVisible();

    // Logout
    await page.getByRole('button', { name: "Log Out" }).click();
  });

  // Test 4: Verify sprints cannot overlap
  test('User cannot add an overlapping sprint', async ({ page }) => {
    // Login with admin credentials
    await login(page);

    // Navigate to sprints
    await page.getByRole('link', { name: 'Sprints' }).click();

    // Add new sprint
    await page.getByRole('button', { name: "New Sprint" }).click();
    await page.getByPlaceholder("e.g. Internal Analytics Portal").fill("Automated E2E Sprint");
    await page.locator('input[type="date"]').fill('2026-10-10');
    await page.locator('input[type="number"]').first().fill('14');
    await page.locator('input[type="number"]').nth(1).fill('1');

    // Attempt to submit overlapping sprint
    await page.getByRole('button', { name: "Create Sprint" }).click();

    // The modal should still be visible because the sprint did not get created
    await expect(page.getByRole('button', { name: "Create Sprint" })).toBeVisible();
  
    await expect(page.getByText(/sprint for this project already exists during this time/i)).toBeVisible();
  });

  // Test 5: Verify project admin workflow for adding a new project works
  test('Admin new project workflow', async ({ page }) => {
    // Login with admin credentials
    await login(page);

    // Navigate to Projects
    await page.getByRole('link', { name: 'Projects' }).click();

    // Add new project
    await page.getByRole('button', { name: "New Project" }).click();
    await page.getByPlaceholder("e.g. Internal Analytics Portal").fill("Automated E2E Project");
    await page.getByPlaceholder("What is this project for?").fill("Test project for the automation worker to handle.");
    await page.getByRole('button', { name: "Create Project" }).click();

    // Add 3 new board statuses to new project
    const newProjectCard = await page.locator('div.v-card').filter({ hasText: "Automated E2E Project" });
    await newProjectCard.getByRole('button', { name: "Open" }).click();
    await page.getByRole('link', { name: 'Board Statuses' }).click();
    
    const newStatusNameField = await page.getByPlaceholder("New status name");
    const addButton = await page.getByRole('button', { name: "Add" });

    await newStatusNameField.fill("In Progress");
    await addButton.click();
    await newStatusNameField.fill("In Test");
    await addButton.click();
    await newStatusNameField.fill("Completed");
    await addButton.click();

    // Add a team member to the project
    await page.getByRole('link', { name: 'Team Management' }).click();
    const addMemberSearchField = await page.getByPlaceholder("Search users by name or email to add...");
    const addToProjectButton = await page.getByRole('button', { name: "Add to project" });
    await addMemberSearchField.fill("me@gmail.com");
    await addToProjectButton.click();
    
    // Add a ticket to the backlog
    await page.getByRole('link', { name: 'Backlog' }).click();
    await page.getByRole('button', { name: "Add to backlog" }).click();
    await page.getByPlaceholder("Title of ticket").fill("Automated E2E Ticket");
    await page.locator('div:nth-child(2) > .v-input > .v-input__control > .v-field > .v-field__field > .v-field__input').first().click();
    await page.getByText('Feature').click();
    await page.locator('.d-flex.justify-space-between.ga-8.mt-2 > div > .v-input > .v-input__control > .v-field > .v-field__field > .v-field__input').first().click();
    await page.getByText('Low').click();
    await page.locator('div:nth-child(3) > div > .v-input > .v-input__control > .v-field > .v-field__field > .v-field__input').first().click();
    await page.getByRole('option', { name: 'me myself' }).click();
    await page.getByLabel('Description').fill('This ticket was generated automatically by our Playwright E2E suite!');

    // Scroll down and click Submit
    const submitButton = page.getByRole('button', { name: 'Submit' });
  
    // Add a safeguard to explicitly force it to scroll into view before clicking if needed
    await submitButton.scrollIntoViewIfNeeded(); 
    await submitButton.click();
    await expect(page.getByText("Automated E2E Ticket").first()).toBeVisible();

    // Add a new sprint
    await page.getByRole('link', { name: 'Sprints' }).click();
    await page.getByRole('button', { name: "New Sprint" }).click();
    await page.getByPlaceholder("e.g. Internal Analytics Portal").fill("Automated E2E Sprint");
    await page.locator('input[type="date"]').fill('2026-11-11');
    await page.locator('input[type="number"]').first().fill('7');
    await page.getByRole('button', { name: "Create Sprint" }).click();

    // Navigate to Storyboard and add a new ticket
    await page.getByRole('link', { name: 'Overview' }).click();
    await page.locator('div.v-card').filter({ hasText: "In Progress"}).getByRole('button', { name: "Add Ticket" }).click();
    await page.getByPlaceholder("Title of ticket").fill("Automated E2E Ticket within Storyboard");
    await page.locator('div:nth-child(2) > .v-input > .v-input__control > .v-field > .v-field__field > .v-field__input').first().click();
    await page.getByText('Bug').click();
    await page.locator('.d-flex.justify-space-between.ga-8.mt-2 > div > .v-input > .v-input__control > .v-field > .v-field__field > .v-field__input').first().click();
    await page.getByText('High').click();
    await page.locator('div:nth-child(3) > div > .v-input > .v-input__control > .v-field > .v-field__field > .v-field__input').first().click();
    await page.getByRole('option', { name: 'me myself' }).click();
    await page.getByLabel('Description').fill('This ticket was generated automatically by our Playwright E2E suite!');

    await submitButton.scrollIntoViewIfNeeded(); 
    await submitButton.click();

    await expect(page.getByText("Automated E2E Ticket within Storyboard").first()).toBeVisible();

    // Add a test to the new ticket
    await page.getByText("Automated E2E Ticket within Storyboard", { exact: true}).click();
    await page.getByText("Tests").click();
    await page.getByRole('button', { name: "Add Test" }).click();
    await page.getByPlaceholder("e.g. User can reset password via email").fill('My E2E Test Title');
    await page.getByPlaceholder('Flexible — write in in Given/When/Then style').fill('Given I am a user...');
    await page.locator('.v-card > .v-input.v-input--horizontal.v-input--center-affix.v-input--density-compact.v-theme--OCTheme.v-locale--is-ltr.v-text-field.v-select > .v-input__control > .v-field > .v-field__field > .v-field__input').click();
    await page.getByRole('option').first().click();
    await page.getByRole('button', { name: 'Submit' }).click();

    await expect(page.getByText("My E2E Test Title").first()).toBeVisible();
  });
})

// This function uses the admin credentials to login into the application
async function login(page) {
  await page.goto('http://localhost:8081/');

  const emailField = await page.getByPlaceholder('jane.doe@gmail.com');
  await emailField.fill('test.admin@example.com');

  const passwordField = await page.getByPlaceholder('abc123');
  await passwordField.fill('Test1234!');

  await page.getByRole('button', { name: "Log In" }).click();
}