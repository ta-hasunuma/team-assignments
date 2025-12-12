/**
 * TDD Tests for Task 2.2: Member List UI Component
 *
 * Tests verify:
 * - Initial member display (DOM rendering)
 * - Add member form and functionality
 * - Edit member inline functionality
 * - Delete member functionality
 * - Event integration with MemberManager
 */

// ==========================================
// Test Suite: DOM Structure
// ==========================================

function testMemberListSectionExists() {
  const section = document.getElementById("member-list-section");
  if (!section) {
    throw new Error("Member list section should exist");
  }

  const container = document.getElementById("member-list-container");
  if (!container) {
    throw new Error("Member list container should exist");
  }

  console.log("✓ Member list section and container exist in DOM");
}

function testAddMemberButtonExists() {
  const button = document.getElementById("add-member-btn");
  if (!button) {
    throw new Error("Add member button should exist");
  }

  console.log("✓ Add member button exists in DOM");
}

// ==========================================
// Test Suite: Initial Member Display
// ==========================================

function testInitialMembersRendered() {
  const container = document.getElementById("member-list-container");
  const memberItems = container.querySelectorAll(".member-item");

  if (memberItems.length !== 10) {
    throw new Error(
      `Expected 10 member items rendered, got ${memberItems.length}`
    );
  }

  // Check that member names are displayed
  const firstMemberName = memberItems[0].querySelector(".member-name");
  if (!firstMemberName || !firstMemberName.textContent) {
    throw new Error("Member items should display member names");
  }

  console.log("✓ Initial 10 members are rendered in DOM");
}

function testMemberItemsHaveEditButton() {
  const container = document.getElementById("member-list-container");
  const memberItems = container.querySelectorAll(".member-item");

  if (memberItems.length === 0) {
    throw new Error("No member items found for testing");
  }

  const firstItem = memberItems[0];
  const editBtn = firstItem.querySelector(".edit-member-btn");

  if (!editBtn) {
    throw new Error("Member items should have edit button");
  }

  console.log("✓ Member items have edit buttons");
}

function testMemberItemsHaveDeleteButton() {
  const container = document.getElementById("member-list-container");
  const memberItems = container.querySelectorAll(".member-item");

  if (memberItems.length === 0) {
    throw new Error("No member items found for testing");
  }

  const firstItem = memberItems[0];
  const deleteBtn = firstItem.querySelector(".delete-member-btn");

  if (!deleteBtn) {
    throw new Error("Member items should have delete button");
  }

  console.log("✓ Member items have delete buttons");
}

// ==========================================
// Test Suite: Add Member Form
// ==========================================

function testAddMemberFormAppears() {
  const addBtn = document.getElementById("add-member-btn");

  // Click add button
  addBtn.click();

  // Check if form appears
  const form = document.querySelector(".add-member-form");
  if (!form || form.style.display === "none") {
    throw new Error("Add member form should appear after clicking add button");
  }

  // Check form inputs
  const nameInput = form.querySelector('input[name="member-name"]');
  const typeSelect = form.querySelector('select[name="member-type"]');

  if (!nameInput) {
    throw new Error("Add member form should have name input");
  }

  if (!typeSelect) {
    throw new Error("Add member form should have type select");
  }

  console.log("✓ Add member form appears with name input and type select");

  // Clean up - close form
  const cancelBtn = form.querySelector(".cancel-add-btn");
  if (cancelBtn) cancelBtn.click();
}

function testAddMemberFormSubmission() {
  const addBtn = document.getElementById("add-member-btn");
  addBtn.click();

  const form = document.querySelector(".add-member-form");
  const nameInput = form.querySelector('input[name="member-name"]');
  const typeSelect = form.querySelector('select[name="member-type"]');
  const submitBtn = form.querySelector(".submit-add-btn");

  // Fill form
  nameInput.value = "テスト太郎";
  typeSelect.value = "hiragana";

  // Submit
  submitBtn.click();

  // Check if new member appears in list
  const container = document.getElementById("member-list-container");
  const memberItems = container.querySelectorAll(".member-item");

  const newMember = Array.from(memberItems).find((item) => {
    const nameEl = item.querySelector(".member-name");
    return nameEl && nameEl.textContent.includes("テスト太郎");
  });

  if (!newMember) {
    throw new Error("New member should appear in member list after submission");
  }

  console.log("✓ Add member form submission adds member to list");
}

// ==========================================
// Test Suite: Edit Member
// ==========================================

function testEditMemberInline() {
  const container = document.getElementById("member-list-container");
  const memberItems = container.querySelectorAll(".member-item");

  if (memberItems.length === 0) {
    throw new Error("No member items found for testing");
  }

  const firstItem = memberItems[0];
  const editBtn = firstItem.querySelector(".edit-member-btn");
  const nameDisplay = firstItem.querySelector(".member-name");
  const originalName = nameDisplay.textContent;

  // Click edit button
  editBtn.click();

  // Check if input field appears
  const editInput = firstItem.querySelector(".member-name-input");
  if (!editInput) {
    throw new Error("Edit input should appear after clicking edit button");
  }

  // Change name
  editInput.value = "編集後の名前";

  // Find and click save button
  const saveBtn = firstItem.querySelector(".save-edit-btn");
  if (!saveBtn) {
    throw new Error("Save button should appear in edit mode");
  }

  saveBtn.click();

  // Check if name is updated
  const updatedName = nameDisplay.textContent;
  if (updatedName === originalName) {
    throw new Error("Member name should be updated after save");
  }

  console.log("✓ Edit member inline functionality works");
}

// ==========================================
// Test Suite: Delete Member
// ==========================================

function testDeleteMember() {
  const container = document.getElementById("member-list-container");
  const initialCount = container.querySelectorAll(".member-item").length;

  const memberItems = container.querySelectorAll(".member-item");
  if (memberItems.length === 0) {
    throw new Error("No member items found for testing");
  }

  const lastItem = memberItems[memberItems.length - 1];
  const deleteBtn = lastItem.querySelector(".delete-member-btn");

  // Click delete button
  deleteBtn.click();

  // Check if member is removed
  const updatedCount = container.querySelectorAll(".member-item").length;
  if (updatedCount !== initialCount - 1) {
    throw new Error(
      `Expected ${initialCount - 1} members after delete, got ${updatedCount}`
    );
  }

  console.log("✓ Delete member functionality works");
}

// ==========================================
// Test Runner
// ==========================================

function runTask22Tests() {
  console.log("=== Running TDD Tests for Task 2.2: Member List UI ===\n");

  try {
    console.log("Testing DOM Structure:");
    testMemberListSectionExists();
    testAddMemberButtonExists();
    console.log("");

    console.log("Testing Initial Member Display:");
    testInitialMembersRendered();
    testMemberItemsHaveEditButton();
    testMemberItemsHaveDeleteButton();
    console.log("");

    console.log("Testing Add Member Form:");
    testAddMemberFormAppears();
    testAddMemberFormSubmission();
    console.log("");

    console.log("Testing Edit Member:");
    testEditMemberInline();
    console.log("");

    console.log("Testing Delete Member:");
    testDeleteMember();
    console.log("");

    console.log("=== All Task 2.2 Tests Passed! ===");
    return true;
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    console.error(error.stack);
    return false;
  }
}
