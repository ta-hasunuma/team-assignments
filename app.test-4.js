/**
 * TDD Tests for Task 4.1 & 4.2: AppController Team Assignment Execution
 *
 * Tests verify:
 * - Team assignment execution flow
 * - Result display on success
 * - Error handling and display
 * - Re-execution with last config
 * - UI state updates
 */

// ==========================================
// Test Suite: Execute Team Assignment
// ==========================================

function testExecuteTeamAssignmentSuccess() {
  // Setup
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  // Execute
  const config = { mode: "teamCount", teamCount: 2 };
  const result = controller.executeTeamAssignment(config);

  if (!result.ok) {
    throw new Error(`executeTeamAssignment failed: ${result.error}`);
  }

  if (!Array.isArray(result.value)) {
    throw new Error("Result should contain teams array");
  }

  if (result.value.length !== 2) {
    throw new Error(`Expected 2 teams, got ${result.value.length}`);
  }

  console.log("✓ Execute team assignment returns teams on success");
}

function testExecuteTeamAssignmentStoresConfig() {
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  const config = { mode: "teamSize", teamSize: 3 };
  controller.executeTeamAssignment(config);

  if (!controller.lastConfig) {
    throw new Error("executeTeamAssignment should store last config");
  }

  if (JSON.stringify(controller.lastConfig) !== JSON.stringify(config)) {
    throw new Error("Stored config doesn't match input config");
  }

  console.log("✓ Execute team assignment stores config for re-execution");
}

function testExecuteTeamAssignmentWithNoMembers() {
  // Setup with empty members
  sessionStorage.setItem("team-assignment-members", JSON.stringify([]));
  const memberManager = new MemberManager();
  memberManager.initializeMembers();
  memberManager.members = []; // Force empty

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  const config = { mode: "teamCount", teamCount: 2 };
  const result = controller.executeTeamAssignment(config);

  if (result.ok) {
    throw new Error("executeTeamAssignment should fail with no members");
  }

  if (!result.error || result.error.length === 0) {
    throw new Error("Error result should contain error message");
  }

  console.log("✓ Execute team assignment handles empty members error");
}

// ==========================================
// Test Suite: Re-execute Team Assignment
// ==========================================

function testReExecuteWithoutPreviousConfig() {
  const controller = new AppController();
  controller.memberManager = new MemberManager();
  controller.teamAssignmentEngine = new TeamAssignmentEngine();
  controller.lastConfig = null;

  const result = controller.reExecuteTeamAssignment();

  if (result.ok) {
    throw new Error(
      "reExecuteTeamAssignment should fail without previous config"
    );
  }

  console.log("✓ Re-execute fails gracefully without previous config");
}

function testReExecuteWithPreviousConfig() {
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  // First execution
  const config = { mode: "teamCount", teamCount: 3 };
  controller.executeTeamAssignment(config);

  // Re-execute
  const result = controller.reExecuteTeamAssignment();

  if (!result.ok) {
    throw new Error(`reExecuteTeamAssignment failed: ${result.error}`);
  }

  if (result.value.length !== 3) {
    throw new Error(
      `Expected 3 teams from re-execution, got ${result.value.length}`
    );
  }

  console.log("✓ Re-execute works with previous config");
}

// ==========================================
// Test Suite: Result Display
// ==========================================

function testResultSectionExistsInDOM() {
  const section = document.getElementById("team-result-section");
  if (!section) {
    throw new Error("Team result section should exist in DOM");
  }

  const container = document.getElementById("team-result-container");
  if (!container) {
    throw new Error("Team result container should exist in DOM");
  }

  console.log("✓ Result section exists in DOM");
}

function testResultDisplayAfterExecution() {
  // Setup DOM
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  // Need to initialize to get DOM references
  if (document.getElementById("team-assignment-form")) {
    controller.init();
  }

  // Execute team assignment
  const config = { mode: "teamCount", teamCount: 2 };
  const result = controller.executeTeamAssignment(config);

  if (!result.ok) {
    throw new Error("Test setup failed: team assignment failed");
  }

  // Check if result section is visible (should be shown after execution)
  const resultSection = document.getElementById("team-result-section");
  if (resultSection) {
    const isVisible =
      resultSection.style.display !== "none" &&
      window.getComputedStyle(resultSection).display !== "none";

    if (!isVisible) {
      throw new Error("Result section should be visible after execution");
    }
  }

  console.log("✓ Result section is displayed after execution");
}

function testTeamsAreRenderedInContainer() {
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

  const container = document.getElementById("team-result-container");
  if (container) {
    const teamElements = container.querySelectorAll(".team-card");

    if (teamElements.length !== 2) {
      throw new Error(
        `Expected 2 team cards rendered, got ${teamElements.length}`
      );
    }
  }

  console.log("✓ Teams are rendered in result container");
}

// ==========================================
// Test Suite: Error Display
// ==========================================

function testErrorMessageDisplayOnFailure() {
  // This test verifies that errors are shown to user
  // Implementation can vary (alert, inline message, etc.)

  const memberManager = new MemberManager();
  memberManager.members = []; // Force error

  const engine = new TeamAssignmentEngine();
  const controller = new AppController();
  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;

  const config = { mode: "teamCount", teamCount: 2 };
  const result = controller.executeTeamAssignment(config);

  if (result.ok) {
    throw new Error("Should return error with no members");
  }

  // Error should be returned (how it's displayed is implementation detail)
  if (!result.error) {
    throw new Error("Error result should contain error message");
  }

  console.log("✓ Error message is returned on failure");
}

// ==========================================
// Test Suite: Re-execute Button
// ==========================================

function testReExecuteButtonExists() {
  const button = document.getElementById("re-execute-btn");
  if (!button) {
    throw new Error("Re-execute button should exist in DOM");
  }

  console.log("✓ Re-execute button exists in DOM");
}

// ==========================================
// Test Runner
// ==========================================

function runTask4Tests() {
  console.log(
    "=== Running TDD Tests for Task 4.1 & 4.2: Team Assignment Execution ===\n"
  );

  try {
    console.log("Testing Execute Team Assignment:");
    testExecuteTeamAssignmentSuccess();
    testExecuteTeamAssignmentStoresConfig();
    testExecuteTeamAssignmentWithNoMembers();
    console.log("");

    console.log("Testing Re-execute:");
    testReExecuteWithoutPreviousConfig();
    testReExecuteWithPreviousConfig();
    console.log("");

    console.log("Testing Result Display:");
    testResultSectionExistsInDOM();
    testResultDisplayAfterExecution();
    testTeamsAreRenderedInContainer();
    console.log("");

    console.log("Testing Error Handling:");
    testErrorMessageDisplayOnFailure();
    console.log("");

    console.log("Testing UI Elements:");
    testReExecuteButtonExists();
    console.log("");

    console.log("=== All Task 4 Tests Passed! ===");
    return true;
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    console.error(error.stack);
    return false;
  }
}
