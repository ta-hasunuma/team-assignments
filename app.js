/**
 * Team Assignment Application
 * Main application file with component classes and initialization
 */

// ==========================================
// Result Type Helper Functions
// ==========================================

/**
 * Create a successful Result
 * @template T
 * @param {T} value - Success value
 * @returns {{ok: true, value: T}}
 */
function okResult(value) {
  return { ok: true, value };
}

/**
 * Create an error Result
 * @template E
 * @param {E} error - Error value
 * @returns {{ok: false, error: E}}
 */
function errorResult(error) {
  return { ok: false, error };
}

// ==========================================
// Component Classes
// ==========================================

/**
 * AppController - Main application controller
 * Coordinates UI operations and component interactions
 */
class AppController {
  constructor() {
    this.memberManager = null;
    this.teamAssignmentEngine = null;
    this.imageExporter = null;
    this.lastConfig = null; // Store last configuration for re-execution
  }

  /**
   * Initialize the application
   * - Get DOM element references
   * - Register event listeners
   * - Load initial members
   */
  init() {
    // Get DOM references
    this.memberListContainer = document.getElementById("member-list-container");
    this.addMemberBtn = document.getElementById("add-member-btn");

    // Register event listeners
    this.addMemberBtn.addEventListener("click", () =>
      this._showAddMemberForm()
    );

    // Render initial members
    this._renderMemberList();

    console.log("AppController initialized with member list UI");
  }

  /**
   * Render member list to DOM
   * @private
   */
  _renderMemberList() {
    const members = this.memberManager.getMembers();

    this.memberListContainer.innerHTML = members
      .map(
        (member) => `
      <div class="member-item" data-member-id="${member.id}">
        <span class="member-name">${member.name}</span>
        <span class="member-type">(${
          member.type === "hiragana" ? "ひらがな" : "カタカナ"
        })</span>
        <button class="edit-member-btn btn btn-secondary">編集</button>
        <button class="delete-member-btn btn btn-secondary">削除</button>
      </div>
    `
      )
      .join("");

    // Attach event listeners to all buttons
    this.memberListContainer
      .querySelectorAll(".edit-member-btn")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => this._handleEditMember(e));
      });

    this.memberListContainer
      .querySelectorAll(".delete-member-btn")
      .forEach((btn) => {
        btn.addEventListener("click", (e) => this._handleDeleteMember(e));
      });
  }

  /**
   * Show add member form
   * @private
   */
  _showAddMemberForm() {
    // Check if form already exists
    let form = document.querySelector(".add-member-form");

    if (!form) {
      // Create form
      form = document.createElement("div");
      form.className = "add-member-form";
      form.innerHTML = `
        <div class="form-group">
          <input type="text" name="member-name" placeholder="メンバー名" class="member-name-input">
          <select name="member-type" class="member-type-select">
            <option value="hiragana">ひらがな</option>
            <option value="katakana">カタカナ</option>
          </select>
          <button class="submit-add-btn btn btn-primary">追加</button>
          <button class="cancel-add-btn btn btn-secondary">キャンセル</button>
        </div>
      `;

      // Insert form after add button
      this.addMemberBtn.parentElement.appendChild(form);

      // Attach event listeners
      form
        .querySelector(".submit-add-btn")
        .addEventListener("click", () => this._handleAddMember());
      form
        .querySelector(".cancel-add-btn")
        .addEventListener("click", () => this._hideAddMemberForm());
    }

    form.style.display = "block";
  }

  /**
   * Hide add member form
   * @private
   */
  _hideAddMemberForm() {
    const form = document.querySelector(".add-member-form");
    if (form) {
      form.style.display = "none";
      form.querySelector('input[name="member-name"]').value = "";
    }
  }

  /**
   * Handle add member submission
   * @private
   */
  _handleAddMember() {
    const form = document.querySelector(".add-member-form");
    const nameInput = form.querySelector('input[name="member-name"]');
    const typeSelect = form.querySelector('select[name="member-type"]');

    const result = this.memberManager.addMember(
      nameInput.value,
      typeSelect.value
    );

    if (result.ok) {
      this._renderMemberList();
      this._hideAddMemberForm();
    } else {
      alert(result.error);
    }
  }

  /**
   * Handle edit member click
   * @private
   */
  _handleEditMember(event) {
    const memberItem = event.target.closest(".member-item");
    const memberId = memberItem.dataset.memberId;
    const nameSpan = memberItem.querySelector(".member-name");
    const currentName = nameSpan.textContent;

    // Replace name span with input
    nameSpan.style.display = "none";

    let editInput = memberItem.querySelector(".member-name-input");
    if (!editInput) {
      editInput = document.createElement("input");
      editInput.type = "text";
      editInput.className = "member-name-input";
      editInput.value = currentName;
      nameSpan.parentElement.insertBefore(editInput, nameSpan);

      // Change edit button to save button
      const editBtn = memberItem.querySelector(".edit-member-btn");
      editBtn.textContent = "保存";
      editBtn.className = "save-edit-btn btn btn-primary";
      editBtn.onclick = () => this._handleSaveEdit(memberId);
    }
  }

  /**
   * Handle save edit
   * @private
   */
  _handleSaveEdit(memberId) {
    const memberItem = document.querySelector(`[data-member-id="${memberId}"]`);
    const editInput = memberItem.querySelector(".member-name-input");

    const result = this.memberManager.updateMember(memberId, editInput.value);

    if (result.ok) {
      this._renderMemberList();
    } else {
      alert(result.error);
    }
  }

  /**
   * Handle delete member click
   * @private
   */
  _handleDeleteMember(event) {
    const memberItem = event.target.closest(".member-item");
    const memberId = memberItem.dataset.memberId;

    if (confirm("このメンバーを削除しますか?")) {
      const result = this.memberManager.deleteMember(memberId);

      if (result.ok) {
        this._renderMemberList();
      } else {
        alert(result.error);
      }
    }
  }

  /**
   * Execute team assignment
   * @param {Object} config - Team assignment configuration
   * @returns {Object} Result with teams or error
   */
  executeTeamAssignment(config) {
    // Will be implemented in subsequent tasks
    this.lastConfig = config;
    return okResult([]);
  }

  /**
   * Re-execute team assignment with last configuration
   * @returns {Object} Result with teams or error
   */
  reExecuteTeamAssignment() {
    if (!this.lastConfig) {
      return errorResult("前回の設定がありません");
    }
    return this.executeTeamAssignment(this.lastConfig);
  }

  /**
   * Export teams as image
   * @param {Array} teams - Team array
   * @returns {Object} Result with success or error
   */
  exportImage(teams) {
    // Will be implemented in subsequent tasks
    return okResult(undefined);
  }
}

/**
 * MemberManager - Member CRUD management
 * Manages member data with SessionStorage persistence
 */
class MemberManager {
  constructor() {
    this.storageKey = "team-assignment-members";
    this.members = [];
  }

  /**
   * Initialize members (load from SessionStorage or create defaults)
   */
  initializeMembers() {
    const stored = sessionStorage.getItem(this.storageKey);

    if (stored) {
      // Load existing members from SessionStorage
      this.members = JSON.parse(stored);
    } else {
      // Create default members (5 hiragana + 5 katakana)
      this.members = [
        { id: this._generateUUID(), name: "あ", type: "hiragana" },
        { id: this._generateUUID(), name: "い", type: "hiragana" },
        { id: this._generateUUID(), name: "う", type: "hiragana" },
        { id: this._generateUUID(), name: "え", type: "hiragana" },
        { id: this._generateUUID(), name: "お", type: "hiragana" },
        { id: this._generateUUID(), name: "ア", type: "katakana" },
        { id: this._generateUUID(), name: "イ", type: "katakana" },
        { id: this._generateUUID(), name: "ウ", type: "katakana" },
        { id: this._generateUUID(), name: "エ", type: "katakana" },
        { id: this._generateUUID(), name: "オ", type: "katakana" },
      ];

      this._saveToStorage();
    }

    console.log(
      "MemberManager initialized with",
      this.members.length,
      "members"
    );
  }

  /**
   * Get all members
   * @returns {Array} Member array
   */
  getMembers() {
    return this.members;
  }

  /**
   * Add a new member
   * @param {string} name - Member name
   * @param {string} type - Member type ('hiragana' or 'katakana')
   * @returns {Object} Result with member or error
   */
  addMember(name, type) {
    // Validate name
    if (!name || name.trim().length === 0) {
      return errorResult("メンバー名を入力してください");
    }

    // Validate type
    if (type !== "hiragana" && type !== "katakana") {
      return errorResult(
        "メンバー種別は'hiragana'または'katakana'である必要があります"
      );
    }

    const newMember = {
      id: this._generateUUID(),
      name: name.trim(),
      type: type,
    };

    this.members.push(newMember);
    this._saveToStorage();

    return okResult(newMember);
  }

  /**
   * Update a member
   * @param {string} id - Member ID
   * @param {string} name - New member name
   * @returns {Object} Result with member or error
   */
  updateMember(id, name) {
    // Validate name
    if (!name || name.trim().length === 0) {
      return errorResult("メンバー名を入力してください");
    }

    // Find member
    const memberIndex = this.members.findIndex((m) => m.id === id);
    if (memberIndex === -1) {
      return errorResult("指定されたメンバーが見つかりません");
    }

    // Update member
    this.members[memberIndex].name = name.trim();
    this._saveToStorage();

    return okResult(this.members[memberIndex]);
  }

  /**
   * Delete a member
   * @param {string} id - Member ID
   * @returns {Object} Result with success or error
   */
  deleteMember(id) {
    // Find member
    const memberIndex = this.members.findIndex((m) => m.id === id);
    if (memberIndex === -1) {
      return errorResult("指定されたメンバーが見つかりません");
    }

    // Remove member
    this.members.splice(memberIndex, 1);
    this._saveToStorage();

    return okResult(true);
  }

  /**
   * Save members to SessionStorage
   * @private
   */
  _saveToStorage() {
    sessionStorage.setItem(this.storageKey, JSON.stringify(this.members));
  }

  /**
   * Generate a simple UUID (v4-like)
   * @private
   * @returns {string} UUID string
   */
  _generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }
}

/**
 * TeamAssignmentEngine - Team assignment logic
 * Implements Fisher-Yates shuffle and various assignment modes
 */
class TeamAssignmentEngine {
  constructor() {
    // No state needed for pure logic component
  }

  /**
   * Execute team assignment
   * @param {Array} members - Member array
   * @param {Object} config - Assignment configuration
   * @returns {Object} Result with teams or error
   */
  assignTeams(members, config) {
    // Will be implemented in task 3.1
    return okResult([]);
  }
}

/**
 * ImageExporter - Image generation and export
 * Uses Canvas API to generate team result images
 */
class ImageExporter {
  constructor() {
    // Canvas will be created dynamically when needed
    this.canvas = null;
  }

  /**
   * Export teams as image
   * @param {Array} teams - Team array
   * @param {string} format - Image format ('png' or 'jpeg')
   * @returns {Object} Result with success or error
   */
  exportAsImage(teams, format = "png") {
    // Will be implemented in task 6.1
    return okResult(undefined);
  }
}

// ==========================================
// Application Initialization
// ==========================================

/**
 * Initialize the application
 * Called when DOM is ready
 */
function initApp() {
  console.log("Initializing Team Assignment App...");

  // Create component instances
  const memberManager = new MemberManager();
  const teamAssignmentEngine = new TeamAssignmentEngine();
  const imageExporter = new ImageExporter();
  const appController = new AppController();

  // Inject dependencies
  appController.memberManager = memberManager;
  appController.teamAssignmentEngine = teamAssignmentEngine;
  appController.imageExporter = imageExporter;

  // Initialize components
  memberManager.initializeMembers();
  appController.init();

  console.log("App initialization complete");
}

// Register DOMContentLoaded event listener
if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", initApp);
}
