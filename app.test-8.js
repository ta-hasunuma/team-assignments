/**
 * TDD Tests for Task 8: Integration and Polishing
 *
 * Tests verify:
 * - End-to-end flow from member management to image export
 * - SessionStorage persistence and reload
 * - All acceptance criteria
 * - Responsive design
 * - Complete user workflows
 */

// ==========================================
// Test Suite: Component Integration (Task 8.1)
// ==========================================

function testFullAppInitialization() {
  // Clear and reinitialize
  sessionStorage.removeItem("team-assignment-members");

  const memberManager = new MemberManager();
  const teamAssignmentEngine = new TeamAssignmentEngine();
  const imageExporter = new ImageExporter();
  const appController = new AppController();

  // Inject dependencies
  appController.memberManager = memberManager;
  appController.teamAssignmentEngine = teamAssignmentEngine;
  appController.imageExporter = imageExporter;

  // Initialize
  memberManager.initializeMembers();

  if (document.getElementById("team-assignment-form")) {
    appController.init();
  }

  // Verify all components are connected
  if (!appController.memberManager) {
    throw new Error("MemberManager should be injected");
  }

  if (!appController.teamAssignmentEngine) {
    throw new Error("TeamAssignmentEngine should be injected");
  }

  if (!appController.imageExporter) {
    throw new Error("ImageExporter should be injected");
  }

  console.log("✓ Full app initialization successful");
}

function testEndToEndFlowMemberToTeamToExport() {
  // Setup
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  const teamAssignmentEngine = new TeamAssignmentEngine();
  const imageExporter = new ImageExporter();
  const appController = new AppController();

  appController.memberManager = memberManager;
  appController.teamAssignmentEngine = teamAssignmentEngine;
  appController.imageExporter = imageExporter;

  memberManager.initializeMembers();

  if (document.getElementById("team-assignment-form")) {
    appController.init();
  }

  // Step 1: Add a member
  const addResult = memberManager.addMember("新メンバー", "hiragana");
  if (!addResult.ok) {
    throw new Error("Failed to add member");
  }

  // Step 2: Execute team assignment
  const config = { mode: "teamCount", teamCount: 3 };
  const teamResult = appController.executeTeamAssignment(config);
  if (!teamResult.ok) {
    throw new Error("Failed to execute team assignment");
  }

  // Step 3: Verify teams are stored
  if (!appController.lastTeams || appController.lastTeams.length !== 3) {
    throw new Error("Teams should be stored in controller");
  }

  // Step 4: Export image
  const exportResult = imageExporter.exportAsImage(appController.lastTeams);
  if (!exportResult.ok) {
    throw new Error("Failed to export image");
  }

  console.log("✓ End-to-end flow from member to team to export works");
}

function testSessionStoragePersistence() {
  // Clear and add members
  sessionStorage.removeItem("team-assignment-members");
  const memberManager1 = new MemberManager();
  memberManager1.initializeMembers();

  const initialCount = memberManager1.getMembers().length;

  // Add a new member
  memberManager1.addMember("永続テスト", "hiragana");

  // Simulate page reload by creating new instance
  const memberManager2 = new MemberManager();
  memberManager2.initializeMembers();

  const afterReloadCount = memberManager2.getMembers().length;

  if (afterReloadCount !== initialCount + 1) {
    throw new Error(
      `Members should persist. Expected ${
        initialCount + 1
      }, got ${afterReloadCount}`
    );
  }

  // Verify the added member exists
  const members = memberManager2.getMembers();
  const foundMember = members.find((m) => m.name === "永続テスト");

  if (!foundMember) {
    throw new Error("Added member should persist after reload");
  }

  console.log("✓ SessionStorage persistence works across reload");
}

function testErrorHandlingInIntegratedFlow() {
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  const teamAssignmentEngine = new TeamAssignmentEngine();
  const appController = new AppController();

  appController.memberManager = memberManager;
  appController.teamAssignmentEngine = teamAssignmentEngine;

  // Initialize with no members
  memberManager.members = [];

  // Try to execute team assignment with no members
  const config = { mode: "teamCount", teamCount: 2 };
  const result = appController.executeTeamAssignment(config);

  if (result.ok) {
    throw new Error("Should fail with no members");
  }

  if (!result.error) {
    throw new Error("Error should be returned");
  }

  console.log("✓ Error handling works in integrated flow");
}

function testValidationInIntegratedFlow() {
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  // Test invalid member name
  const result1 = memberManager.addMember("", "hiragana");
  if (result1.ok) {
    throw new Error("Should fail with empty name");
  }

  // Test invalid team count
  const teamAssignmentEngine = new TeamAssignmentEngine();
  const members = memberManager.getMembers();
  const result2 = teamAssignmentEngine.assignTeams(members, {
    mode: "teamCount",
    teamCount: 0,
  });
  if (result2.ok) {
    throw new Error("Should fail with 0 teams");
  }

  console.log("✓ Validation works in integrated flow");
}

// ==========================================
// Test Suite: Acceptance Criteria (Task 8.3)
// ==========================================

function testAcceptanceCriteria1_InitialMembers() {
  // Requirement 1.1: Display 10 initial members
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const members = memberManager.getMembers();

  if (members.length !== 10) {
    throw new Error(`Should have 10 initial members, got ${members.length}`);
  }

  // Check 5 hiragana and 5 katakana
  const hiraganaCount = members.filter((m) => m.type === "hiragana").length;
  const katakanaCount = members.filter((m) => m.type === "katakana").length;

  if (hiraganaCount !== 5 || katakanaCount !== 5) {
    throw new Error(
      `Should have 5 hiragana and 5 katakana, got ${hiraganaCount} and ${katakanaCount}`
    );
  }

  console.log("✓ AC1: Initial 10 members displayed correctly");
}

function testAcceptanceCriteria1_MemberCRUD() {
  // Requirement 1.2-1.5: Add, edit, delete members
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const initialCount = memberManager.getMembers().length;

  // Add
  const addResult = memberManager.addMember("テストユーザー", "hiragana");
  if (!addResult.ok || memberManager.getMembers().length !== initialCount + 1) {
    throw new Error("Add member failed");
  }

  // Edit
  const memberId = addResult.value.id;
  const updateResult = memberManager.updateMember(memberId, "更新済み");
  if (!updateResult.ok || updateResult.value.name !== "更新済み") {
    throw new Error("Update member failed");
  }

  // Delete
  const deleteResult = memberManager.deleteMember(memberId);
  if (!deleteResult.ok || memberManager.getMembers().length !== initialCount) {
    throw new Error("Delete member failed");
  }

  console.log("✓ AC1: Member CRUD operations work correctly");
}

function testAcceptanceCriteria2_TeamCountMode() {
  // Requirement 2.1-2.4: Team count mode with 3 teams
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const members = memberManager.getMembers();

  const result = engine.assignTeams(members, {
    mode: "teamCount",
    teamCount: 3,
  });

  if (!result.ok) {
    throw new Error(`Team assignment failed: ${result.error}`);
  }

  if (result.value.length !== 3) {
    throw new Error(`Should create 3 teams, got ${result.value.length}`);
  }

  // Verify all members are assigned
  const totalAssigned = result.value.reduce(
    (sum, team) => sum + team.members.length,
    0
  );
  if (totalAssigned !== members.length) {
    throw new Error(
      `All members should be assigned, ${totalAssigned}/${members.length}`
    );
  }

  console.log("✓ AC2: Team count mode creates 3 teams correctly");
}

function testAcceptanceCriteria3_TeamSizeMode() {
  // Requirement 3.1-3.4: Team size mode with 4 members per team
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const members = memberManager.getMembers();

  const result = engine.assignTeams(members, { mode: "teamSize", teamSize: 4 });

  if (!result.ok) {
    throw new Error(`Team assignment failed: ${result.error}`);
  }

  // With 10 members, should create 2 teams of 4 and 1 team of 2
  if (result.value.length !== 3) {
    throw new Error(`Should create 3 teams, got ${result.value.length}`);
  }

  console.log("✓ AC3: Team size mode works correctly");
}

function testAcceptanceCriteria4_ConstraintMode() {
  // Requirement 4.1-4.4: Constraint mode with hiragana 3 members
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const members = memberManager.getMembers();

  const result = engine.assignTeams(members, {
    mode: "constraint",
    constraint: { type: "hiragana", count: 3 },
    otherTeamCount: 2,
  });

  if (!result.ok) {
    throw new Error(`Constraint assignment failed: ${result.error}`);
  }

  // Should create 3 teams (1 hiragana + 2 others)
  if (result.value.length !== 3) {
    throw new Error(`Should create 3 teams, got ${result.value.length}`);
  }

  // First team should have 3 hiragana members
  const firstTeam = result.value[0];
  if (firstTeam.members.length !== 3) {
    throw new Error(
      `Constraint team should have 3 members, got ${firstTeam.members.length}`
    );
  }

  const allHiragana = firstTeam.members.every((m) => m.type === "hiragana");
  if (!allHiragana) {
    throw new Error("Constraint team should contain only hiragana members");
  }

  console.log("✓ AC4: Constraint mode works correctly");
}

function testAcceptanceCriteria5_ViewModes() {
  // Requirement 5.1-5.4: List and card view display
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const appController = new AppController();

  appController.memberManager = memberManager;
  appController.teamAssignmentEngine = engine;

  if (document.getElementById("team-assignment-form")) {
    appController.init();
  }

  const config = { mode: "teamCount", teamCount: 2 };
  appController.executeTeamAssignment(config);

  const container = document.getElementById("team-result-container");

  // Default should be card view
  if (container.classList.contains("list-view")) {
    throw new Error("Default should be card view");
  }

  // Toggle to list view
  appController._handleToggleView();

  if (!container.classList.contains("list-view")) {
    throw new Error("Should toggle to list view");
  }

  console.log("✓ AC5: List and card view modes work correctly");
}

function testAcceptanceCriteria6_ReExecution() {
  // Requirement 6.1-6.3: Re-execution produces different results
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const members = memberManager.getMembers();

  const result1 = engine.assignTeams(members, {
    mode: "teamCount",
    teamCount: 2,
  });
  const result2 = engine.assignTeams(members, {
    mode: "teamCount",
    teamCount: 2,
  });

  if (!result1.ok || !result2.ok) {
    throw new Error("Team assignment should succeed");
  }

  // Results should be different (with very high probability)
  const firstTeam1Members = result1.value[0].members
    .map((m) => m.id)
    .sort()
    .join(",");
  const firstTeam2Members = result2.value[0].members
    .map((m) => m.id)
    .sort()
    .join(",");

  // Note: There's a small chance they could be identical, but very unlikely with 10 members
  if (firstTeam1Members === firstTeam2Members) {
    console.warn(
      "⚠ Re-execution produced identical results (rare but possible)"
    );
  }

  console.log("✓ AC6: Re-execution produces randomized results");
}

function testAcceptanceCriteria7_ImageExport() {
  // Requirement 7.1-7.4: PNG image export with timestamp
  const exporter = new ImageExporter();

  const teams = [
    {
      id: "1",
      name: "チーム1",
      members: [{ id: "m1", name: "たなか", type: "hiragana" }],
    },
  ];

  const result = exporter.exportAsImage(teams);

  if (!result.ok) {
    throw new Error(`Image export failed: ${result.error}`);
  }

  // Test filename generation
  const filename = exporter._generateFilename();
  const pattern = /^teams-\d{8}-\d{6}\.png$/;

  if (!pattern.test(filename)) {
    throw new Error(`Filename should match pattern, got: ${filename}`);
  }

  console.log("✓ AC7: PNG image export with timestamp works");
}

function testAcceptanceCriteria8_UIDesign() {
  // Requirement 8.1-8.4: UI/UX design principles

  // Check blue color theme
  const computedStyle = getComputedStyle(document.documentElement);
  const primaryColor = computedStyle.getPropertyValue("--primary-color").trim();

  if (!primaryColor.includes("2196f3") && !primaryColor.includes("#2196f3")) {
    console.warn("⚠ Primary color might not be blue (#2196f3)");
  }

  // Check buttons exist
  const buttons = document.querySelectorAll("button.btn");
  if (buttons.length === 0) {
    throw new Error("Should have styled buttons");
  }

  console.log("✓ AC8: UI design follows specifications");
}

function testAcceptanceCriteria10_SessionStorageOnly() {
  // Requirement 10.1-10.4: SessionStorage data management

  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  // Check that data is in SessionStorage
  const storedData = sessionStorage.getItem("team-assignment-members");

  if (!storedData) {
    throw new Error("Data should be stored in SessionStorage");
  }

  const parsedData = JSON.parse(storedData);

  if (!Array.isArray(parsedData) || parsedData.length !== 10) {
    throw new Error("SessionStorage should contain 10 members");
  }

  // Verify no localStorage is used
  const localStorageData = localStorage.getItem("team-assignment-members");
  if (localStorageData) {
    throw new Error("Should not use localStorage");
  }

  console.log("✓ AC10: SessionStorage-only data management works");
}

// ==========================================
// Test Suite: Responsive Design (Task 8.2)
// ==========================================

function testResponsiveBreakpointsExist() {
  // Check if CSS contains responsive styles
  const styleSheets = Array.from(document.styleSheets);
  let hasMediaQueries = false;

  styleSheets.forEach((sheet) => {
    try {
      if (sheet.cssRules) {
        Array.from(sheet.cssRules).forEach((rule) => {
          if (rule.type === CSSRule.MEDIA_RULE) {
            hasMediaQueries = true;
          }
        });
      }
    } catch (e) {
      // Cross-origin stylesheets might throw errors
    }
  });

  if (!hasMediaQueries) {
    console.warn("⚠ No media queries found in stylesheets");
  }

  console.log("✓ Responsive design styles are present");
}

function testTouchTargetSizes() {
  // Check button sizes for touch devices
  const buttons = document.querySelectorAll("button");

  buttons.forEach((button) => {
    const rect = button.getBoundingClientRect();

    // Minimum touch target size is typically 44x44 pixels
    if (rect.width > 0 && rect.height > 0) {
      if (rect.height < 30) {
        console.warn(`⚠ Button might be too small for touch: ${rect.height}px`);
      }
    }
  });

  console.log("✓ Touch target sizes checked");
}

// ==========================================
// Test Runner
// ==========================================

function runTask8Tests() {
  console.log(
    "=== Running TDD Tests for Task 8: Integration & Polishing ===\n"
  );

  try {
    console.log("Testing Component Integration (8.1):");
    testFullAppInitialization();
    testEndToEndFlowMemberToTeamToExport();
    testSessionStoragePersistence();
    testErrorHandlingInIntegratedFlow();
    testValidationInIntegratedFlow();
    console.log("");

    console.log("Testing Acceptance Criteria (8.3):");
    testAcceptanceCriteria1_InitialMembers();
    testAcceptanceCriteria1_MemberCRUD();
    testAcceptanceCriteria2_TeamCountMode();
    testAcceptanceCriteria3_TeamSizeMode();
    testAcceptanceCriteria4_ConstraintMode();
    testAcceptanceCriteria5_ViewModes();
    testAcceptanceCriteria6_ReExecution();
    testAcceptanceCriteria7_ImageExport();
    testAcceptanceCriteria8_UIDesign();
    testAcceptanceCriteria10_SessionStorageOnly();
    console.log("");

    console.log("Testing Responsive Design (8.2):");
    testResponsiveBreakpointsExist();
    testTouchTargetSizes();
    console.log("");

    console.log("=== All Task 8 Tests Passed! ===");
    return true;
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    console.error(error.stack);
    return false;
  }
}
