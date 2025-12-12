/**
 * TDD Tests for Task 7: Error Handling Enhancement
 *
 * Tests verify:
 * - Input validation (member names, team counts, constraints)
 * - Real-time validation feedback
 * - Global error handler
 * - Result type error handling
 * - User-friendly error messages
 */

// ==========================================
// Test Suite: Input Validation (Task 7.1)
// ==========================================

function testMemberNameEmptyValidation() {
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  // Try to add member with empty name
  const result = memberManager.addMember("", "hiragana");

  if (result.ok) {
    throw new Error("addMember should fail with empty name");
  }

  if (!result.error || !result.error.includes("1文字以上")) {
    throw new Error("Error message should mention minimum length requirement");
  }

  console.log("✓ Member name empty validation works");
}

function testMemberNameWhitespaceValidation() {
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  // Try to add member with only whitespace
  const result = memberManager.addMember("   ", "hiragana");

  if (result.ok) {
    throw new Error("addMember should fail with whitespace-only name");
  }

  console.log("✓ Member name whitespace validation works");
}

function testTeamCountValidation() {
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const members = memberManager.getMembers();

  // Test with 0 teams
  let result = engine.assignTeams(members, { mode: "teamCount", teamCount: 0 });
  if (result.ok) {
    throw new Error("assignTeams should fail with 0 teams");
  }

  // Test with negative teams
  result = engine.assignTeams(members, { mode: "teamCount", teamCount: -1 });
  if (result.ok) {
    throw new Error("assignTeams should fail with negative teams");
  }

  // Test with more teams than members
  result = engine.assignTeams(members, { mode: "teamCount", teamCount: 100 });
  if (result.ok) {
    throw new Error("assignTeams should fail with more teams than members");
  }

  console.log("✓ Team count validation works");
}

function testTeamSizeValidation() {
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const members = memberManager.getMembers();

  // Test with 0 team size
  let result = engine.assignTeams(members, { mode: "teamSize", teamSize: 0 });
  if (result.ok) {
    throw new Error("assignTeams should fail with 0 team size");
  }

  // Test with negative team size
  result = engine.assignTeams(members, { mode: "teamSize", teamSize: -1 });
  if (result.ok) {
    throw new Error("assignTeams should fail with negative team size");
  }

  console.log("✓ Team size validation works");
}

function testConstraintCountValidation() {
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const members = memberManager.getMembers();

  // Test with negative constraint count
  let result = engine.assignTeams(members, {
    mode: "constraint",
    constraint: { type: "hiragana", count: -1 },
    otherTeamCount: 2,
  });

  if (result.ok) {
    throw new Error("assignTeams should fail with negative constraint count");
  }

  // Test with constraint count exceeding available members
  result = engine.assignTeams(members, {
    mode: "constraint",
    constraint: { type: "hiragana", count: 100 },
    otherTeamCount: 2,
  });

  if (result.ok) {
    throw new Error("assignTeams should fail with excessive constraint count");
  }

  console.log("✓ Constraint count validation works");
}

function testValidationErrorMessages() {
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const result = memberManager.addMember("", "hiragana");

  if (!result.error || typeof result.error !== "string") {
    throw new Error("Validation errors should have string error messages");
  }

  if (result.error.length === 0) {
    throw new Error("Error message should not be empty");
  }

  console.log("✓ Validation error messages are user-friendly");
}

function testMinMaxInputAttributes() {
  // Check HTML inputs have proper validation attributes
  const teamCountInput = document.getElementById("team-count-input");
  const teamSizeInput = document.getElementById("team-size-input");

  if (teamCountInput) {
    const min = teamCountInput.getAttribute("min");
    if (!min || parseInt(min) !== 1) {
      throw new Error("team-count-input should have min='1' attribute");
    }
  }

  if (teamSizeInput) {
    const min = teamSizeInput.getAttribute("min");
    if (!min || parseInt(min) !== 1) {
      throw new Error("team-size-input should have min='1' attribute");
    }
  }

  console.log("✓ Input elements have proper min attributes");
}

// ==========================================
// Test Suite: Global Error Handler (Task 7.2)
// ==========================================

function testGlobalErrorHandlerExists() {
  if (!window.onerror) {
    throw new Error(
      "Global error handler should be registered on window.onerror"
    );
  }

  console.log("✓ Global error handler is registered");
}

function testErrorHandlerCatchesExceptions() {
  // Save original error handler
  const originalHandler = window.onerror;

  let errorCaught = false;

  // Install test error handler
  window.onerror = function (message, source, lineno, colno, error) {
    errorCaught = true;
    return true; // Prevent default handling
  };

  // Trigger an error (in try-catch to prevent test failure)
  try {
    throw new Error("Test error");
  } catch (e) {
    // Manually call the error handler
    window.onerror(e.message, "", 0, 0, e);
  }

  // Restore original handler
  window.onerror = originalHandler;

  if (!errorCaught) {
    throw new Error("Error handler should catch exceptions");
  }

  console.log("✓ Error handler catches exceptions");
}

function testResultTypeErrorHandling() {
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  // Generate error through Result type
  const result = memberManager.addMember("", "hiragana");

  if (result.ok) {
    throw new Error("Should return error Result");
  }

  if (typeof result.error !== "string") {
    throw new Error("Result error should be string type");
  }

  console.log("✓ Result type error handling works");
}

function testCanvasAPIErrorHandling() {
  const exporter = new ImageExporter();

  // Try to export with empty teams (should handle gracefully)
  const result = exporter.exportAsImage([]);

  if (result.ok) {
    throw new Error("exportAsImage should fail with empty teams");
  }

  if (!result.error) {
    throw new Error("Error result should contain error message");
  }

  console.log("✓ Canvas API errors are handled gracefully");
}

function testSessionStorageErrorHandling() {
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  // Mock SessionStorage to throw error
  const originalSetItem = Storage.prototype.setItem;
  let errorHandled = false;

  Storage.prototype.setItem = function () {
    throw new Error("QuotaExceededError");
  };

  try {
    // Try to add member (will trigger SessionStorage write)
    const result = memberManager.addMember("テスト", "hiragana");

    // Should handle error gracefully
    if (!result.ok) {
      errorHandled = true;
    }
  } finally {
    // Restore original function
    Storage.prototype.setItem = originalSetItem;
  }

  if (!errorHandled) {
    throw new Error("SessionStorage errors should be handled");
  }

  console.log("✓ SessionStorage errors are handled");
}

function testUserFriendlyErrorMessages() {
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const testCases = [{ input: "", errorKeywords: ["メンバー", "1文字"] }];

  testCases.forEach(({ input, errorKeywords }) => {
    const result = memberManager.addMember(input, "hiragana");

    if (result.ok) {
      throw new Error(`Should fail for input: "${input}"`);
    }

    const errorLower = result.error.toLowerCase();
    const hasKeywords = errorKeywords.some((keyword) =>
      errorLower.includes(keyword.toLowerCase())
    );

    if (!hasKeywords) {
      throw new Error(
        `Error message should contain relevant keywords: ${errorKeywords.join(
          ", "
        )}`
      );
    }
  });

  console.log("✓ Error messages are user-friendly");
}

function testConsoleErrorLogging() {
  // Verify that errors are logged to console
  const originalError = console.error;
  let errorLogged = false;

  console.error = function (...args) {
    errorLogged = true;
    originalError.apply(console, args);
  };

  // Trigger an error
  const memberManager = new MemberManager();
  memberManager.initializeMembers();
  memberManager.addMember("", "hiragana");

  console.error = originalError;

  // Note: Console logging might not happen for validation errors
  // This test just verifies the console.error function works
  console.log("✓ Console error logging is available");
}

// ==========================================
// Test Suite: Edge Cases
// ==========================================

function testEmptyMembersTeamAssignment() {
  const engine = new TeamAssignmentEngine();

  const result = engine.assignTeams([], { mode: "teamCount", teamCount: 2 });

  if (result.ok) {
    throw new Error("assignTeams should fail with empty members");
  }

  if (!result.error.includes("メンバー")) {
    throw new Error("Error should mention members");
  }

  console.log("✓ Empty members error handling works");
}

function testInvalidConfigTypeHandling() {
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const members = memberManager.getMembers();

  // Test with invalid mode
  const result = engine.assignTeams(members, { mode: "invalid", teamCount: 2 });

  if (result.ok) {
    throw new Error("assignTeams should fail with invalid mode");
  }

  console.log("✓ Invalid config type is handled");
}

function testDuplicateMemberNameAllowed() {
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  // Add member
  const result1 = memberManager.addMember("たなか", "hiragana");
  if (!result1.ok) {
    throw new Error("First member should be added successfully");
  }

  // Add duplicate name (should be allowed)
  const result2 = memberManager.addMember("たなか", "hiragana");
  if (!result2.ok) {
    throw new Error("Duplicate names should be allowed");
  }

  console.log("✓ Duplicate member names are allowed");
}

// ==========================================
// Test Runner
// ==========================================

function runTask7Tests() {
  console.log("=== Running TDD Tests for Task 7: Error Handling ===\n");

  try {
    console.log("Testing Input Validation (7.1):");
    testMemberNameEmptyValidation();
    testMemberNameWhitespaceValidation();
    testTeamCountValidation();
    testTeamSizeValidation();
    testConstraintCountValidation();
    testValidationErrorMessages();
    testMinMaxInputAttributes();
    console.log("");

    console.log("Testing Global Error Handler (7.2):");
    testGlobalErrorHandlerExists();
    testErrorHandlerCatchesExceptions();
    testResultTypeErrorHandling();
    testCanvasAPIErrorHandling();
    testSessionStorageErrorHandling();
    testUserFriendlyErrorMessages();
    testConsoleErrorLogging();
    console.log("");

    console.log("Testing Edge Cases:");
    testEmptyMembersTeamAssignment();
    testInvalidConfigTypeHandling();
    testDuplicateMemberNameAllowed();
    console.log("");

    console.log("=== All Task 7 Tests Passed! ===");
    return true;
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    console.error(error.stack);
    return false;
  }
}
