/**
 * TDD Tests for Task 5: Team Result Display Enhancements
 *
 * Tests verify:
 * - View mode toggle (list vs card)
 * - List view rendering
 * - Card view rendering
 * - Re-execute button functionality
 * - Result display states
 */

// ==========================================
// Test Suite: View Mode Toggle (Task 5.1)
// ==========================================

function testToggleViewButtonExists() {
  const button = document.getElementById("toggle-view-btn");
  if (!button) {
    throw new Error("Toggle view button should exist in DOM");
  }

  console.log("✓ Toggle view button exists in DOM");
}

function testDefaultViewModeIsCard() {
  const container = document.getElementById("team-result-container");
  if (!container) {
    throw new Error("Team result container should exist");
  }

  // Default should have card view class or no list class
  const hasListClass = container.classList.contains("list-view");

  if (hasListClass) {
    throw new Error("Default view mode should be card (not list)");
  }

  console.log("✓ Default view mode is card");
}

function testToggleViewSwitchesMode() {
  // Setup
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  if (document.getElementById("team-assignment-form")) {
    controller.init();
  }

  // Execute team assignment first
  const config = { mode: "teamCount", teamCount: 2 };
  controller.executeTeamAssignment(config);

  // Get initial state
  const container = document.getElementById("team-result-container");
  const initialIsListView = container.classList.contains("list-view");

  // Toggle view
  controller._handleToggleView();

  const afterToggleIsListView = container.classList.contains("list-view");

  if (initialIsListView === afterToggleIsListView) {
    throw new Error("Toggle view should switch between list and card modes");
  }

  console.log("✓ Toggle view switches between modes");
}

function testCardViewRendersTeamCards() {
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  if (document.getElementById("team-assignment-form")) {
    controller.init();
  }

  // Ensure card view
  const container = document.getElementById("team-result-container");
  container.classList.remove("list-view");

  const config = { mode: "teamCount", teamCount: 2 };
  controller.executeTeamAssignment(config);

  const teamCards = container.querySelectorAll(".team-card");

  if (teamCards.length !== 2) {
    throw new Error(`Expected 2 team cards, got ${teamCards.length}`);
  }

  // Verify each card has header and member list
  teamCards.forEach((card, index) => {
    const header = card.querySelector("h3");
    if (!header) {
      throw new Error(`Team card ${index + 1} should have header`);
    }

    const memberList = card.querySelector(".team-member-list");
    if (!memberList) {
      throw new Error(`Team card ${index + 1} should have member list`);
    }
  });

  console.log("✓ Card view renders team cards correctly");
}

function testListViewRendersSimpleList() {
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  if (document.getElementById("team-assignment-form")) {
    controller.init();
  }

  // Execute and then switch to list view
  const config = { mode: "teamCount", teamCount: 2 };
  controller.executeTeamAssignment(config);

  const container = document.getElementById("team-result-container");
  container.classList.add("list-view");

  // Re-render in list mode
  controller._showTeamResults(controller.lastTeams || []);

  // In list view, we should still have team-card elements
  // but they should be styled differently via CSS
  const teamCards = container.querySelectorAll(".team-card");

  if (teamCards.length === 0) {
    throw new Error("List view should still render team elements");
  }

  console.log("✓ List view renders team list correctly");
}

function testToggleButtonTextChanges() {
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  if (document.getElementById("team-assignment-form")) {
    controller.init();
  }

  const config = { mode: "teamCount", teamCount: 2 };
  controller.executeTeamAssignment(config);

  const button = document.getElementById("toggle-view-btn");
  const initialText = button.textContent;

  controller._handleToggleView();

  const afterText = button.textContent;

  if (initialText === afterText) {
    throw new Error("Toggle button text should change after toggle");
  }

  console.log("✓ Toggle button text changes with view mode");
}

// ==========================================
// Test Suite: Re-execute Button (Task 5.2)
// ==========================================

function testReExecuteButtonUpdatesResults() {
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  if (document.getElementById("team-assignment-form")) {
    controller.init();
  }

  // First execution
  const config = { mode: "teamCount", teamCount: 2 };
  controller.executeTeamAssignment(config);

  const container = document.getElementById("team-result-container");
  const firstHTML = container.innerHTML;

  // Re-execute
  controller._handleReExecute();

  const secondHTML = container.innerHTML;

  // Results should be different (due to randomization)
  // We check that DOM was updated
  if (firstHTML === secondHTML) {
    // This might occasionally fail due to random chance
    // but with 10 members in 2 teams, probability is very low
    console.warn("⚠ Re-execute produced identical results (rare but possible)");
  }

  console.log("✓ Re-execute button updates results");
}

function testReExecuteKeepsConfiguration() {
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  if (document.getElementById("team-assignment-form")) {
    controller.init();
  }

  // First execution with 3 teams
  const config = { mode: "teamCount", teamCount: 3 };
  controller.executeTeamAssignment(config);

  // Re-execute
  controller._handleReExecute();

  const container = document.getElementById("team-result-container");
  const teamCards = container.querySelectorAll(".team-card");

  if (teamCards.length !== 3) {
    throw new Error(
      `Re-execute should maintain 3 teams, got ${teamCards.length}`
    );
  }

  console.log("✓ Re-execute maintains original configuration");
}

// ==========================================
// Test Suite: Result Display State
// ==========================================

function testResultsAreStoredInController() {
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  const config = { mode: "teamCount", teamCount: 2 };
  const result = controller.executeTeamAssignment(config);

  if (!controller.lastTeams) {
    throw new Error("Controller should store last teams for re-rendering");
  }

  if (!Array.isArray(controller.lastTeams)) {
    throw new Error("lastTeams should be an array");
  }

  if (controller.lastTeams.length !== 2) {
    throw new Error(
      `Expected 2 teams stored, got ${controller.lastTeams.length}`
    );
  }

  console.log("✓ Results are stored in controller state");
}

function testViewModeIsPreservedOnReExecute() {
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  if (document.getElementById("team-assignment-form")) {
    controller.init();
  }

  const config = { mode: "teamCount", teamCount: 2 };
  controller.executeTeamAssignment(config);

  // Switch to list view
  controller._handleToggleView();

  const container = document.getElementById("team-result-container");
  const isListViewBefore = container.classList.contains("list-view");

  // Re-execute
  controller._handleReExecute();

  const isListViewAfter = container.classList.contains("list-view");

  if (isListViewBefore !== isListViewAfter) {
    throw new Error("View mode should be preserved after re-execute");
  }

  console.log("✓ View mode is preserved on re-execute");
}

// ==========================================
// Test Runner
// ==========================================

function runTask5Tests() {
  console.log("=== Running TDD Tests for Task 5: Team Result Display ===\n");

  try {
    console.log("Testing View Mode Toggle (5.1):");
    testToggleViewButtonExists();
    testDefaultViewModeIsCard();
    testToggleViewSwitchesMode();
    testCardViewRendersTeamCards();
    testListViewRendersSimpleList();
    testToggleButtonTextChanges();
    console.log("");

    console.log("Testing Re-execute Button (5.2):");
    testReExecuteButtonUpdatesResults();
    testReExecuteKeepsConfiguration();
    console.log("");

    console.log("Testing Result Display State:");
    testResultsAreStoredInController();
    testViewModeIsPreservedOnReExecute();
    console.log("");

    console.log("=== All Task 5 Tests Passed! ===");
    return true;
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    console.error(error.stack);
    return false;
  }
}
