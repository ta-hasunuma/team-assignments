/**
 * TDD Tests for Task 2.1: MemberManager Component Implementation
 *
 * Tests verify:
 * - Initial members (5 hiragana + 5 katakana)
 * - CRUD operations (Create, Read, Update, Delete)
 * - SessionStorage persistence
 * - Input validation
 */

// ==========================================
// Test Suite: Initial Members
// ==========================================

function testInitializeMembersCreatesDefaults() {
  // Clear SessionStorage before test
  sessionStorage.removeItem("team-assignment-members");

  const manager = new MemberManager();
  manager.initializeMembers();

  const members = manager.getMembers();

  if (members.length !== 10) {
    throw new Error(`Expected 10 initial members, got ${members.length}`);
  }

  // Check hiragana members
  const hiraganaMembers = members.filter((m) => m.type === "hiragana");
  if (hiraganaMembers.length !== 5) {
    throw new Error(
      `Expected 5 hiragana members, got ${hiraganaMembers.length}`
    );
  }

  const hiraganaNames = hiraganaMembers.map((m) => m.name).sort();
  const expectedHiragana = ["あ", "い", "う", "え", "お"];
  if (JSON.stringify(hiraganaNames) !== JSON.stringify(expectedHiragana)) {
    throw new Error(
      `Expected hiragana names ${expectedHiragana}, got ${hiraganaNames}`
    );
  }

  // Check katakana members
  const katakanaMembers = members.filter((m) => m.type === "katakana");
  if (katakanaMembers.length !== 5) {
    throw new Error(
      `Expected 5 katakana members, got ${katakanaMembers.length}`
    );
  }

  const katakanaNames = katakanaMembers.map((m) => m.name).sort();
  const expectedKatakana = ["ア", "イ", "ウ", "エ", "オ"];
  if (JSON.stringify(katakanaNames) !== JSON.stringify(expectedKatakana)) {
    throw new Error(
      `Expected katakana names ${expectedKatakana}, got ${katakanaNames}`
    );
  }

  console.log(
    "✓ initializeMembers creates 10 default members (5 hiragana + 5 katakana)"
  );
}

function testInitializeMembersLoadsFromSessionStorage() {
  // Set up existing data in SessionStorage
  const existingMembers = [
    { id: "test-1", name: "テスト1", type: "katakana" },
    { id: "test-2", name: "てすと2", type: "hiragana" },
  ];
  sessionStorage.setItem(
    "team-assignment-members",
    JSON.stringify(existingMembers)
  );

  const manager = new MemberManager();
  manager.initializeMembers();

  const members = manager.getMembers();

  if (members.length !== 2) {
    throw new Error(`Expected 2 members from storage, got ${members.length}`);
  }

  if (members[0].name !== "テスト1" || members[1].name !== "てすと2") {
    throw new Error("Failed to load members from SessionStorage");
  }

  console.log("✓ initializeMembers loads existing members from SessionStorage");

  // Clean up
  sessionStorage.removeItem("team-assignment-members");
}

// ==========================================
// Test Suite: Add Member
// ==========================================

function testAddMemberSuccess() {
  sessionStorage.removeItem("team-assignment-members");

  const manager = new MemberManager();
  manager.initializeMembers();

  const result = manager.addMember("新メンバー", "hiragana");

  if (!result.ok) {
    throw new Error(`addMember failed: ${result.error}`);
  }

  if (!result.value.id || result.value.id.length === 0) {
    throw new Error("Added member should have a valid UUID");
  }

  if (result.value.name !== "新メンバー") {
    throw new Error(`Expected name '新メンバー', got '${result.value.name}'`);
  }

  if (result.value.type !== "hiragana") {
    throw new Error(`Expected type 'hiragana', got '${result.value.type}'`);
  }

  const members = manager.getMembers();
  if (members.length !== 11) {
    throw new Error(`Expected 11 members after add, got ${members.length}`);
  }

  console.log("✓ addMember adds member successfully with UUID");
}

function testAddMemberValidatesEmptyName() {
  sessionStorage.removeItem("team-assignment-members");

  const manager = new MemberManager();
  manager.initializeMembers();

  const result = manager.addMember("", "hiragana");

  if (result.ok) {
    throw new Error("addMember should reject empty name");
  }

  if (!result.error || result.error.length === 0) {
    throw new Error("addMember should return error message for empty name");
  }

  console.log("✓ addMember validates empty name input");
}

function testAddMemberPersistsToSessionStorage() {
  sessionStorage.removeItem("team-assignment-members");

  const manager = new MemberManager();
  manager.initializeMembers();

  manager.addMember("永続化テスト", "katakana");

  const stored = JSON.parse(sessionStorage.getItem("team-assignment-members"));
  const found = stored.find((m) => m.name === "永続化テスト");

  if (!found) {
    throw new Error("Added member not found in SessionStorage");
  }

  console.log("✓ addMember persists to SessionStorage");
}

// ==========================================
// Test Suite: Update Member
// ==========================================

function testUpdateMemberSuccess() {
  sessionStorage.removeItem("team-assignment-members");

  const manager = new MemberManager();
  manager.initializeMembers();

  const members = manager.getMembers();
  const firstMemberId = members[0].id;

  const result = manager.updateMember(firstMemberId, "更新後の名前");

  if (!result.ok) {
    throw new Error(`updateMember failed: ${result.error}`);
  }

  if (result.value.name !== "更新後の名前") {
    throw new Error(
      `Expected updated name '更新後の名前', got '${result.value.name}'`
    );
  }

  const updatedMembers = manager.getMembers();
  const updatedMember = updatedMembers.find((m) => m.id === firstMemberId);

  if (updatedMember.name !== "更新後の名前") {
    throw new Error("Member name not updated in member list");
  }

  console.log("✓ updateMember updates member name successfully");
}

function testUpdateMemberValidatesEmptyName() {
  sessionStorage.removeItem("team-assignment-members");

  const manager = new MemberManager();
  manager.initializeMembers();

  const members = manager.getMembers();
  const firstMemberId = members[0].id;

  const result = manager.updateMember(firstMemberId, "");

  if (result.ok) {
    throw new Error("updateMember should reject empty name");
  }

  console.log("✓ updateMember validates empty name input");
}

function testUpdateMemberValidatesNonExistentId() {
  sessionStorage.removeItem("team-assignment-members");

  const manager = new MemberManager();
  manager.initializeMembers();

  const result = manager.updateMember("non-existent-id", "テスト");

  if (result.ok) {
    throw new Error("updateMember should reject non-existent ID");
  }

  console.log("✓ updateMember validates non-existent ID");
}

// ==========================================
// Test Suite: Delete Member
// ==========================================

function testDeleteMemberSuccess() {
  sessionStorage.removeItem("team-assignment-members");

  const manager = new MemberManager();
  manager.initializeMembers();

  const members = manager.getMembers();
  const initialCount = members.length;
  const firstMemberId = members[0].id;

  const result = manager.deleteMember(firstMemberId);

  if (!result.ok) {
    throw new Error(`deleteMember failed: ${result.error}`);
  }

  const updatedMembers = manager.getMembers();
  if (updatedMembers.length !== initialCount - 1) {
    throw new Error(
      `Expected ${initialCount - 1} members after delete, got ${
        updatedMembers.length
      }`
    );
  }

  const deleted = updatedMembers.find((m) => m.id === firstMemberId);
  if (deleted) {
    throw new Error("Deleted member still exists in list");
  }

  console.log("✓ deleteMember removes member successfully");
}

function testDeleteMemberValidatesNonExistentId() {
  sessionStorage.removeItem("team-assignment-members");

  const manager = new MemberManager();
  manager.initializeMembers();

  const result = manager.deleteMember("non-existent-id");

  if (result.ok) {
    throw new Error("deleteMember should reject non-existent ID");
  }

  console.log("✓ deleteMember validates non-existent ID");
}

function testDeleteMemberPersistsToSessionStorage() {
  sessionStorage.removeItem("team-assignment-members");

  const manager = new MemberManager();
  manager.initializeMembers();

  const members = manager.getMembers();
  const firstMemberId = members[0].id;

  manager.deleteMember(firstMemberId);

  const stored = JSON.parse(sessionStorage.getItem("team-assignment-members"));
  const found = stored.find((m) => m.id === firstMemberId);

  if (found) {
    throw new Error("Deleted member still exists in SessionStorage");
  }

  console.log("✓ deleteMember persists to SessionStorage");
}

// ==========================================
// Test Runner
// ==========================================

function runTask21Tests() {
  console.log("=== Running TDD Tests for Task 2.1: MemberManager ===\n");

  try {
    console.log("Testing Initialize Members:");
    testInitializeMembersCreatesDefaults();
    testInitializeMembersLoadsFromSessionStorage();
    console.log("");

    console.log("Testing Add Member:");
    testAddMemberSuccess();
    testAddMemberValidatesEmptyName();
    testAddMemberPersistsToSessionStorage();
    console.log("");

    console.log("Testing Update Member:");
    testUpdateMemberSuccess();
    testUpdateMemberValidatesEmptyName();
    testUpdateMemberValidatesNonExistentId();
    console.log("");

    console.log("Testing Delete Member:");
    testDeleteMemberSuccess();
    testDeleteMemberValidatesNonExistentId();
    testDeleteMemberPersistsToSessionStorage();
    console.log("");

    console.log("=== All Task 2.1 Tests Passed! ===");
    return true;
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    console.error(error.stack);
    return false;
  }
}
