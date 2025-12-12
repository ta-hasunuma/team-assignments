/**
 * TDD Tests for Task 3.1: TeamAssignmentEngine Component
 *
 * Tests verify:
 * - Fisher-Yates shuffle algorithm
 * - Team count distribution mode
 * - Team size distribution mode
 * - Constraint-based assignment
 * - Input validation
 */

// ==========================================
// Test Suite: Fisher-Yates Shuffle
// ==========================================

function testShuffleCreatesNewArray() {
  const engine = new TeamAssignmentEngine();
  const original = [1, 2, 3, 4, 5];
  const shuffled = engine._shuffle([...original]);

  if (shuffled === original) {
    throw new Error("Shuffle should create a new array, not modify original");
  }

  if (shuffled.length !== original.length) {
    throw new Error(
      `Shuffled array should have same length: expected ${original.length}, got ${shuffled.length}`
    );
  }

  console.log("✓ Shuffle creates new array with same length");
}

function testShuffleContainsSameElements() {
  const engine = new TeamAssignmentEngine();
  const original = ["a", "b", "c", "d", "e"];
  const shuffled = engine._shuffle([...original]);

  // Check all original elements are present
  for (const item of original) {
    if (!shuffled.includes(item)) {
      throw new Error(`Shuffled array missing element: ${item}`);
    }
  }

  console.log("✓ Shuffle contains all original elements");
}

function testShuffleProducesRandomness() {
  const engine = new TeamAssignmentEngine();
  const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Run shuffle multiple times and check if we get different results
  const results = [];
  for (let i = 0; i < 5; i++) {
    results.push(JSON.stringify(engine._shuffle([...original])));
  }

  const uniqueResults = new Set(results);
  if (uniqueResults.size < 2) {
    throw new Error(
      "Shuffle should produce different results across multiple runs"
    );
  }

  console.log("✓ Shuffle produces random results");
}

// ==========================================
// Test Suite: Distribute by Team Count
// ==========================================

function testDistributeByTeamCountEvenSplit() {
  const engine = new TeamAssignmentEngine();
  const members = [
    { id: "1", name: "あ", type: "hiragana" },
    { id: "2", name: "い", type: "hiragana" },
    { id: "3", name: "う", type: "hiragana" },
    { id: "4", name: "え", type: "hiragana" },
    { id: "5", name: "お", type: "hiragana" },
    { id: "6", name: "か", type: "hiragana" },
  ];

  const config = { mode: "teamCount", teamCount: 3 };
  const result = engine.assignTeams(members, config);

  if (!result.ok) {
    throw new Error(`assignTeams failed: ${result.error}`);
  }

  const teams = result.value;

  if (teams.length !== 3) {
    throw new Error(`Expected 3 teams, got ${teams.length}`);
  }

  // Each team should have 2 members
  for (const team of teams) {
    if (team.members.length !== 2) {
      throw new Error(
        `Expected 2 members per team, got ${team.members.length}`
      );
    }
  }

  console.log("✓ Distribute by team count with even split works");
}

function testDistributeByTeamCountWithRemainder() {
  const engine = new TeamAssignmentEngine();
  const members = [
    { id: "1", name: "あ", type: "hiragana" },
    { id: "2", name: "い", type: "hiragana" },
    { id: "3", name: "う", type: "hiragana" },
    { id: "4", name: "え", type: "hiragana" },
    { id: "5", name: "お", type: "hiragana" },
  ];

  const config = { mode: "teamCount", teamCount: 2 };
  const result = engine.assignTeams(members, config);

  if (!result.ok) {
    throw new Error(`assignTeams failed: ${result.error}`);
  }

  const teams = result.value;

  if (teams.length !== 2) {
    throw new Error(`Expected 2 teams, got ${teams.length}`);
  }

  // Total members should be preserved
  const totalMembers = teams.reduce(
    (sum, team) => sum + team.members.length,
    0
  );
  if (totalMembers !== 5) {
    throw new Error(`Expected 5 total members, got ${totalMembers}`);
  }

  // One team should have 3, another 2 (or vice versa)
  const sizes = teams.map((t) => t.members.length).sort();
  if (JSON.stringify(sizes) !== JSON.stringify([2, 3])) {
    throw new Error(`Expected team sizes [2, 3], got [${sizes}]`);
  }

  console.log("✓ Distribute by team count with remainder works");
}

// ==========================================
// Test Suite: Distribute by Team Size
// ==========================================

function testDistributeByTeamSizeEvenSplit() {
  const engine = new TeamAssignmentEngine();
  const members = [
    { id: "1", name: "あ", type: "hiragana" },
    { id: "2", name: "い", type: "hiragana" },
    { id: "3", name: "う", type: "hiragana" },
    { id: "4", name: "え", type: "hiragana" },
    { id: "5", name: "お", type: "hiragana" },
    { id: "6", name: "か", type: "hiragana" },
  ];

  const config = { mode: "teamSize", teamSize: 2 };
  const result = engine.assignTeams(members, config);

  if (!result.ok) {
    throw new Error(`assignTeams failed: ${result.error}`);
  }

  const teams = result.value;

  if (teams.length !== 3) {
    throw new Error(`Expected 3 teams, got ${teams.length}`);
  }

  // Each team should have exactly 2 members
  for (const team of teams) {
    if (team.members.length !== 2) {
      throw new Error(
        `Expected 2 members per team, got ${team.members.length}`
      );
    }
  }

  console.log("✓ Distribute by team size with even split works");
}

function testDistributeByTeamSizeWithRemainder() {
  const engine = new TeamAssignmentEngine();
  const members = [
    { id: "1", name: "あ", type: "hiragana" },
    { id: "2", name: "い", type: "hiragana" },
    { id: "3", name: "う", type: "hiragana" },
    { id: "4", name: "え", type: "hiragana" },
    { id: "5", name: "お", type: "hiragana" },
  ];

  const config = { mode: "teamSize", teamSize: 2 };
  const result = engine.assignTeams(members, config);

  if (!result.ok) {
    throw new Error(`assignTeams failed: ${result.error}`);
  }

  const teams = result.value;

  if (teams.length !== 3) {
    throw new Error(`Expected 3 teams (2+2+1), got ${teams.length}`);
  }

  // Total members should be preserved
  const totalMembers = teams.reduce(
    (sum, team) => sum + team.members.length,
    0
  );
  if (totalMembers !== 5) {
    throw new Error(`Expected 5 total members, got ${totalMembers}`);
  }

  // Two teams with 2 members, one team with 1 member
  const sizes = teams.map((t) => t.members.length).sort();
  if (JSON.stringify(sizes) !== JSON.stringify([1, 2, 2])) {
    throw new Error(`Expected team sizes [1, 2, 2], got [${sizes}]`);
  }

  console.log("✓ Distribute by team size with remainder works");
}

// ==========================================
// Test Suite: Constraint-based Assignment
// ==========================================

function testAssignWithConstraintHiraganaOnly() {
  const engine = new TeamAssignmentEngine();
  const members = [
    { id: "1", name: "あ", type: "hiragana" },
    { id: "2", name: "い", type: "hiragana" },
    { id: "3", name: "う", type: "hiragana" },
    { id: "4", name: "ア", type: "katakana" },
    { id: "5", name: "イ", type: "katakana" },
    { id: "6", name: "ウ", type: "katakana" },
  ];

  const config = {
    mode: "constraint",
    constraint: { type: "hiragana", count: 3 },
    otherTeamCount: 1,
  };

  const result = engine.assignTeams(members, config);

  if (!result.ok) {
    throw new Error(`assignTeams failed: ${result.error}`);
  }

  const teams = result.value;

  if (teams.length !== 2) {
    throw new Error(`Expected 2 teams, got ${teams.length}`);
  }

  // First team should have only hiragana members
  const constraintTeam = teams[0];
  if (constraintTeam.members.length !== 3) {
    throw new Error(
      `Expected constraint team to have 3 members, got ${constraintTeam.members.length}`
    );
  }

  for (const member of constraintTeam.members) {
    if (member.type !== "hiragana") {
      throw new Error(
        `Constraint team should only have hiragana members, found ${member.type}`
      );
    }
  }

  console.log("✓ Assign with hiragana constraint works");
}

function testAssignWithConstraintKatakanaOnly() {
  const engine = new TeamAssignmentEngine();
  const members = [
    { id: "1", name: "あ", type: "hiragana" },
    { id: "2", name: "い", type: "hiragana" },
    { id: "3", name: "ア", type: "katakana" },
    { id: "4", name: "イ", type: "katakana" },
    { id: "5", name: "ウ", type: "katakana" },
  ];

  const config = {
    mode: "constraint",
    constraint: { type: "katakana", count: 2 },
    otherTeamCount: 2,
  };

  const result = engine.assignTeams(members, config);

  if (!result.ok) {
    throw new Error(`assignTeams failed: ${result.error}`);
  }

  const teams = result.value;

  // Should have constraint team + other teams
  if (teams.length < 2) {
    throw new Error(`Expected at least 2 teams, got ${teams.length}`);
  }

  // First team should have only katakana members
  const constraintTeam = teams[0];
  for (const member of constraintTeam.members) {
    if (member.type !== "katakana") {
      throw new Error(
        `Constraint team should only have katakana members, found ${member.type}`
      );
    }
  }

  console.log("✓ Assign with katakana constraint works");
}

// ==========================================
// Test Suite: Input Validation
// ==========================================

function testValidateEmptyMembers() {
  const engine = new TeamAssignmentEngine();
  const members = [];
  const config = { mode: "teamCount", teamCount: 2 };

  const result = engine.assignTeams(members, config);

  if (result.ok) {
    throw new Error("assignTeams should reject empty members array");
  }

  console.log("✓ Validates empty members array");
}

function testValidateInvalidTeamCount() {
  const engine = new TeamAssignmentEngine();
  const members = [
    { id: "1", name: "あ", type: "hiragana" },
    { id: "2", name: "い", type: "hiragana" },
  ];

  const config = { mode: "teamCount", teamCount: 0 };
  const result = engine.assignTeams(members, config);

  if (result.ok) {
    throw new Error("assignTeams should reject teamCount of 0");
  }

  console.log("✓ Validates invalid team count");
}

function testValidateInvalidTeamSize() {
  const engine = new TeamAssignmentEngine();
  const members = [
    { id: "1", name: "あ", type: "hiragana" },
    { id: "2", name: "い", type: "hiragana" },
  ];

  const config = { mode: "teamSize", teamSize: -1 };
  const result = engine.assignTeams(members, config);

  if (result.ok) {
    throw new Error("assignTeams should reject negative team size");
  }

  console.log("✓ Validates invalid team size");
}

// ==========================================
// Test Suite: Team Object Generation
// ==========================================

function testTeamObjectStructure() {
  const engine = new TeamAssignmentEngine();
  const members = [
    { id: "1", name: "あ", type: "hiragana" },
    { id: "2", name: "い", type: "hiragana" },
  ];

  const config = { mode: "teamCount", teamCount: 1 };
  const result = engine.assignTeams(members, config);

  if (!result.ok) {
    throw new Error(`assignTeams failed: ${result.error}`);
  }

  const team = result.value[0];

  if (!team.id || typeof team.id !== "string") {
    throw new Error("Team should have string ID");
  }

  if (!team.name || typeof team.name !== "string") {
    throw new Error("Team should have string name");
  }

  if (!Array.isArray(team.members)) {
    throw new Error("Team should have members array");
  }

  console.log("✓ Team object has correct structure");
}

function testTeamNamesAreSequential() {
  const engine = new TeamAssignmentEngine();
  const members = [
    { id: "1", name: "あ", type: "hiragana" },
    { id: "2", name: "い", type: "hiragana" },
    { id: "3", name: "う", type: "hiragana" },
    { id: "4", name: "え", type: "hiragana" },
  ];

  const config = { mode: "teamCount", teamCount: 2 };
  const result = engine.assignTeams(members, config);

  if (!result.ok) {
    throw new Error(`assignTeams failed: ${result.error}`);
  }

  const teams = result.value;

  if (teams[0].name !== "チーム1") {
    throw new Error(
      `Expected first team name 'チーム1', got '${teams[0].name}'`
    );
  }

  if (teams[1].name !== "チーム2") {
    throw new Error(
      `Expected second team name 'チーム2', got '${teams[1].name}'`
    );
  }

  console.log("✓ Team names are sequential");
}

// ==========================================
// Test Runner
// ==========================================

function runTask31Tests() {
  console.log("=== Running TDD Tests for Task 3.1: TeamAssignmentEngine ===\n");

  try {
    console.log("Testing Fisher-Yates Shuffle:");
    testShuffleCreatesNewArray();
    testShuffleContainsSameElements();
    testShuffleProducesRandomness();
    console.log("");

    console.log("Testing Distribute by Team Count:");
    testDistributeByTeamCountEvenSplit();
    testDistributeByTeamCountWithRemainder();
    console.log("");

    console.log("Testing Distribute by Team Size:");
    testDistributeByTeamSizeEvenSplit();
    testDistributeByTeamSizeWithRemainder();
    console.log("");

    console.log("Testing Constraint-based Assignment:");
    testAssignWithConstraintHiraganaOnly();
    testAssignWithConstraintKatakanaOnly();
    console.log("");

    console.log("Testing Input Validation:");
    testValidateEmptyMembers();
    testValidateInvalidTeamCount();
    testValidateInvalidTeamSize();
    console.log("");

    console.log("Testing Team Object Generation:");
    testTeamObjectStructure();
    testTeamNamesAreSequential();
    console.log("");

    console.log("=== All Task 3.1 Tests Passed! ===");
    return true;
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    console.error(error.stack);
    return false;
  }
}
