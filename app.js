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
    this.lastTeams = null; // Store last team assignment results
  }

  /**
   * Initialize the application
   * - Get DOM element references
   * - Register event listeners
   * - Load initial members
   */
  init() {
    // Get DOM references - Member List
    this.memberListContainer = document.getElementById("member-list-container");
    this.addMemberBtn = document.getElementById("add-member-btn");

    // Get DOM references - Settings
    this.teamAssignmentForm = document.getElementById("team-assignment-form");
    this.modeRadios = document.querySelectorAll('input[name="mode"]');
    this.teamCountInput = document.getElementById("team-count-input");
    this.teamSizeInput = document.getElementById("team-size-input");
    this.constraintType = document.getElementById("constraint-type");
    this.constraintCount = document.getElementById("constraint-count");
    this.otherTeamCount = document.getElementById("other-team-count");

    // Get DOM references - Team Result
    this.teamResultSection = document.getElementById("team-result-section");
    this.teamResultContainer = document.getElementById("team-result-container");
    this.toggleViewBtn = document.getElementById("toggle-view-btn");
    this.reExecuteBtn = document.getElementById("re-execute-btn");
    this.exportImageBtn = document.getElementById("export-image-btn");

    // Register event listeners - Member List
    this.addMemberBtn.addEventListener("click", () =>
      this._showAddMemberForm()
    );

    // Register event listeners - Settings
    this.modeRadios.forEach((radio) => {
      radio.addEventListener("change", () => this._handleModeChange());
    });

    this.teamAssignmentForm.addEventListener("submit", (e) =>
      this._handleFormSubmit(e)
    );

    // Register event listeners - Team Result
    if (this.toggleViewBtn) {
      this.toggleViewBtn.addEventListener("click", () =>
        this._handleToggleView()
      );
    }

    if (this.reExecuteBtn) {
      this.reExecuteBtn.addEventListener("click", () =>
        this._handleReExecute()
      );
    }

    if (this.exportImageBtn) {
      this.exportImageBtn.addEventListener("click", () =>
        this._handleExportImage()
      );
    }

    // Initialize UI state
    this._handleModeChange();

    // Render initial members
    this._renderMemberList();

    console.log("AppController initialized with member list and settings UI");
  }

  /**
   * Handle mode change
   * @private
   */
  _handleModeChange() {
    const selectedMode = document.querySelector(
      'input[name="mode"]:checked'
    ).value;

    // Disable all inputs first
    this.teamCountInput.disabled = true;
    this.teamSizeInput.disabled = true;
    this.constraintType.disabled = true;
    this.constraintCount.disabled = true;
    this.otherTeamCount.disabled = true;

    // Enable inputs based on selected mode
    if (selectedMode === "teamCount") {
      this.teamCountInput.disabled = false;
    } else if (selectedMode === "teamSize") {
      this.teamSizeInput.disabled = false;
    } else if (selectedMode === "constraint") {
      this.constraintType.disabled = false;
      this.constraintCount.disabled = false;
      this.otherTeamCount.disabled = false;
    }
  }

  /**
   * Handle form submission
   * @private
   */
  _handleFormSubmit(event) {
    event.preventDefault();

    const selectedMode = document.querySelector(
      'input[name="mode"]:checked'
    ).value;

    let config;

    if (selectedMode === "teamCount") {
      const teamCount = parseInt(this.teamCountInput.value);
      if (!teamCount || teamCount < 1) {
        alert("チーム数を1以上で入力してください");
        return;
      }
      config = { mode: "teamCount", teamCount };
    } else if (selectedMode === "teamSize") {
      const teamSize = parseInt(this.teamSizeInput.value);
      if (!teamSize || teamSize < 1) {
        alert("1チームの人数を1以上で入力してください");
        return;
      }
      config = { mode: "teamSize", teamSize };
    } else if (selectedMode === "constraint") {
      const type = this.constraintType.value;
      const count = parseInt(this.constraintCount.value);
      const otherCount = parseInt(this.otherTeamCount.value);

      if (count < 0) {
        alert("制約メンバー数を0以上で入力してください");
        return;
      }
      if (!otherCount || otherCount < 1) {
        alert("残りのチーム数を1以上で入力してください");
        return;
      }

      config = {
        mode: "constraint",
        constraint: { type, count },
        otherTeamCount: otherCount,
      };
    }

    // Execute team assignment
    const result = this.executeTeamAssignment(config);

    if (!result.ok) {
      alert(result.error);
    }
  }

  /**
   * Handle toggle view button click
   * @private
   */
  _handleToggleView() {
    const container = this.teamResultContainer;

    // Toggle list-view class
    container.classList.toggle("list-view");

    // Update button text
    this._updateToggleButtonText();
  }

  /**
   * Update toggle button text based on current view mode
   * @private
   */
  _updateToggleButtonText() {
    if (!this.toggleViewBtn) return;

    const isListView = this.teamResultContainer.classList.contains("list-view");
    this.toggleViewBtn.textContent = isListView ? "カード表示" : "リスト表示";
  }

  /**
   * Handle re-execute button click
   * @private
   */
  _handleReExecute() {
    const result = this.reExecuteTeamAssignment();

    if (!result.ok) {
      alert(result.error);
    }
  }

  /**
   * Handle export image button click
   * @private
   */
  _handleExportImage() {
    // Use stored teams if available
    if (!this.lastTeams || this.lastTeams.length === 0) {
      alert("チーム分け結果がありません");
      return;
    }

    const result = this.imageExporter.exportAsImage(this.lastTeams);

    if (!result.ok) {
      alert(result.error);
    }
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
   * Display team assignment results in UI
   * @param {Array} teams - Array of team objects
   * @private
   */
  _showTeamResults(teams) {
    // Store teams for re-rendering
    this.lastTeams = teams;

    // Show result section
    this.teamResultSection.style.display = "block";

    // Clear previous results
    this.teamResultContainer.innerHTML = "";

    // Render each team
    teams.forEach((team, index) => {
      const teamCard = document.createElement("div");
      teamCard.className = "team-card";

      const teamHeader = document.createElement("h3");
      teamHeader.textContent = `チーム ${index + 1} (${team.members.length}人)`;

      const memberList = document.createElement("ul");
      memberList.className = "team-member-list";

      team.members.forEach((member) => {
        const li = document.createElement("li");
        li.textContent = member.name;
        memberList.appendChild(li);
      });

      teamCard.appendChild(teamHeader);
      teamCard.appendChild(memberList);
      this.teamResultContainer.appendChild(teamCard);
    });

    // Update toggle button text based on current view
    this._updateToggleButtonText();

    // Scroll to results
    this.teamResultSection.scrollIntoView({ behavior: "smooth" });
  }

  /**
   * Execute team assignment with configuration
   * @param {Object} config - Team assignment configuration
   * @returns {Object} Result with teams or error
   */
  executeTeamAssignment(config) {
    // Get current members
    const members = this.memberManager.getMembers();

    // Call team assignment engine
    const result = this.teamAssignmentEngine.assignTeams(members, config);

    // If assignment failed, return error
    if (!result.ok) {
      return result;
    }

    // Store config for re-execution
    this.lastConfig = config;

    // Display results in UI
    this._showTeamResults(result.value);

    return result;
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
      return errorResult("メンバー名は1文字以上で入力してください");
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

    try {
      this._saveToStorage();
    } catch (error) {
      // Rollback: remove the member we just added
      this.members.pop();
      return errorResult(error.message);
    }

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
      return errorResult("メンバー名は1文字以上で入力してください");
    }

    // Find member
    const memberIndex = this.members.findIndex((m) => m.id === id);
    if (memberIndex === -1) {
      return errorResult("指定されたメンバーが見つかりません");
    }

    // Update member
    const oldName = this.members[memberIndex].name;
    this.members[memberIndex].name = name.trim();

    try {
      this._saveToStorage();
    } catch (error) {
      // Rollback: restore old name
      this.members[memberIndex].name = oldName;
      return errorResult(error.message);
    }

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
    const deletedMember = this.members.splice(memberIndex, 1)[0];

    try {
      this._saveToStorage();
    } catch (error) {
      // Rollback: restore deleted member
      this.members.splice(memberIndex, 0, deletedMember);
      return errorResult(error.message);
    }

    return okResult(true);
  }

  /**
   * Save members to SessionStorage
   * @private
   * @throws {Error} If SessionStorage quota exceeded
   */
  _saveToStorage() {
    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(this.members));
    } catch (error) {
      console.error("SessionStorage保存に失敗しました:", error);
      throw new Error(
        "データの保存に失敗しました。ストレージの容量を確認してください。"
      );
    }
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
    // Validate inputs
    if (!members || members.length === 0) {
      return errorResult("メンバーが登録されていません");
    }

    // Route to appropriate distribution method
    if (config.mode === "teamCount") {
      return this._distributeByTeamCount(members, config.teamCount);
    } else if (config.mode === "teamSize") {
      return this._distributeByTeamSize(members, config.teamSize);
    } else if (config.mode === "constraint") {
      return this._assignWithConstraint(
        members,
        config.constraint,
        config.otherTeamCount
      );
    } else {
      return errorResult("無効なチーム分けモードです");
    }
  }

  /**
   * Fisher-Yates shuffle algorithm
   * @private
   * @param {Array} array - Array to shuffle
   * @returns {Array} New shuffled array
   */
  _shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  /**
   * Distribute by team count
   * @private
   * @param {Array} members - Member array
   * @param {number} teamCount - Number of teams
   * @returns {Object} Result with teams or error
   */
  _distributeByTeamCount(members, teamCount) {
    // Validate team count
    if (!teamCount || teamCount < 1) {
      return errorResult("チーム数は1以上である必要があります");
    }

    if (teamCount > members.length) {
      return errorResult("チーム数がメンバー数を超えています");
    }

    // Shuffle members
    const shuffled = this._shuffle(members);

    // Calculate base team size and remainder
    const baseSize = Math.floor(shuffled.length / teamCount);
    const remainder = shuffled.length % teamCount;

    // Distribute members to teams
    const teams = [];
    let memberIndex = 0;

    for (let i = 0; i < teamCount; i++) {
      const teamSize = baseSize + (i < remainder ? 1 : 0);
      const teamMembers = shuffled.slice(memberIndex, memberIndex + teamSize);
      memberIndex += teamSize;

      teams.push({
        id: this._generateUUID(),
        name: `チーム${i + 1}`,
        members: teamMembers,
      });
    }

    return okResult(teams);
  }

  /**
   * Distribute by team size
   * @private
   * @param {Array} members - Member array
   * @param {number} teamSize - Size of each team
   * @returns {Object} Result with teams or error
   */
  _distributeByTeamSize(members, teamSize) {
    // Validate team size
    if (!teamSize || teamSize < 1) {
      return errorResult("1チームの人数は1以上である必要があります");
    }

    // Shuffle members
    const shuffled = this._shuffle(members);

    // Distribute members to teams
    const teams = [];
    let memberIndex = 0;
    let teamNumber = 1;

    while (memberIndex < shuffled.length) {
      const teamMembers = shuffled.slice(memberIndex, memberIndex + teamSize);
      memberIndex += teamSize;

      teams.push({
        id: this._generateUUID(),
        name: `チーム${teamNumber}`,
        members: teamMembers,
      });

      teamNumber++;
    }

    return okResult(teams);
  }

  /**
   * Assign with constraint (hiragana or katakana only team)
   * @private
   * @param {Array} members - All members
   * @param {Object} constraint - Constraint configuration
   * @param {number} otherTeamCount - Number of teams for remaining members
   * @returns {Object} Result with teams or error
   */
  _assignWithConstraint(members, constraint, otherTeamCount) {
    // Validate constraint
    if (!constraint || !constraint.type || constraint.count === undefined) {
      return errorResult("制約条件が不正です");
    }

    if (constraint.count < 0) {
      return errorResult("制約メンバー数は0以上である必要があります");
    }

    if (!otherTeamCount || otherTeamCount < 1) {
      return errorResult("残りのチーム数は1以上である必要があります");
    }

    // Separate members by type
    const constraintMembers = members.filter((m) => m.type === constraint.type);
    const otherMembers = members.filter((m) => m.type !== constraint.type);

    // Validate constraint count
    if (constraint.count > constraintMembers.length) {
      return errorResult(
        `${constraint.type}メンバーが不足しています（指定: ${constraint.count}人, 実際: ${constraintMembers.length}人）`
      );
    }

    const teams = [];

    // Create constraint team if count > 0
    if (constraint.count > 0) {
      const shuffledConstraint = this._shuffle(constraintMembers);
      const constraintTeamMembers = shuffledConstraint.slice(
        0,
        constraint.count
      );

      teams.push({
        id: this._generateUUID(),
        name: "チーム1",
        members: constraintTeamMembers,
      });

      // Add unused constraint members to other members
      const unusedConstraint = shuffledConstraint.slice(constraint.count);
      otherMembers.push(...unusedConstraint);
    }

    // Distribute remaining members
    if (otherMembers.length > 0) {
      const shuffledOthers = this._shuffle(otherMembers);
      const baseSize = Math.floor(shuffledOthers.length / otherTeamCount);
      const remainder = shuffledOthers.length % otherTeamCount;

      let memberIndex = 0;
      const startTeamNumber = teams.length + 1;

      for (let i = 0; i < otherTeamCount; i++) {
        const teamSize = baseSize + (i < remainder ? 1 : 0);
        const teamMembers = shuffledOthers.slice(
          memberIndex,
          memberIndex + teamSize
        );
        memberIndex += teamSize;

        if (teamMembers.length > 0) {
          teams.push({
            id: this._generateUUID(),
            name: `チーム${startTeamNumber + i}`,
            members: teamMembers,
          });
        }
      }
    }

    return okResult(teams);
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
    try {
      // Validate input
      if (!teams || teams.length === 0) {
        return errorResult("チーム結果がありません");
      }

      // Create canvas and draw teams
      const canvas = this._createCanvas(teams);
      const ctx = canvas.getContext("2d");
      this._drawTeams(ctx, teams, canvas.width, canvas.height);

      // Convert to data URL
      const dataURL = this._canvasToDataURL(canvas);

      // Generate filename and trigger download
      const filename = this._generateFilename();
      this._triggerDownload(dataURL, filename);

      return okResult(undefined);
    } catch (error) {
      return errorResult(`画像の生成に失敗しました: ${error.message}`);
    }
  }

  /**
   * Create canvas element with appropriate dimensions
   * @private
   * @param {Array} teams - Team array
   * @returns {HTMLCanvasElement} Canvas element
   */
  _createCanvas(teams) {
    const canvas = document.createElement("canvas");

    // Calculate dimensions based on content
    const padding = 40;
    const teamSpacing = 30;
    const lineHeight = 30;
    const headerHeight = 50;

    // Calculate max members in any team
    const maxMembers = Math.max(...teams.map((t) => t.members.length));

    // Width: enough for team cards side by side (up to 3 columns)
    const cardWidth = 250;
    const columns = Math.min(teams.length, 3);
    canvas.width =
      padding * 2 + cardWidth * columns + teamSpacing * (columns - 1);

    // Height: based on number of rows needed
    const rows = Math.ceil(teams.length / columns);
    const cardHeight = headerHeight + maxMembers * lineHeight + padding;
    canvas.height = padding * 2 + cardHeight * rows + teamSpacing * (rows - 1);

    return canvas;
  }

  /**
   * Draw teams on canvas
   * @private
   * @param {CanvasRenderingContext2D} ctx - Canvas 2D context
   * @param {Array} teams - Team array
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   */
  _drawTeams(ctx, teams, width, height) {
    // Fill background
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, width, height);

    // Set font for Japanese text
    ctx.font = "16px sans-serif";
    ctx.textBaseline = "top";

    const padding = 40;
    const teamSpacing = 30;
    const cardWidth = 250;
    const lineHeight = 30;
    const headerHeight = 50;
    const columns = Math.min(teams.length, 3);

    teams.forEach((team, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);

      const x = padding + col * (cardWidth + teamSpacing);
      const y =
        padding +
        row *
          (headerHeight +
            team.members.length * lineHeight +
            padding +
            teamSpacing);

      // Draw card background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(
        x,
        y,
        cardWidth,
        headerHeight + team.members.length * lineHeight + 20
      );

      // Draw card border
      ctx.strokeStyle = "#e0e0e0";
      ctx.lineWidth = 2;
      ctx.strokeRect(
        x,
        y,
        cardWidth,
        headerHeight + team.members.length * lineHeight + 20
      );

      // Draw team header
      ctx.fillStyle = "#2196f3";
      ctx.fillRect(x, y, cardWidth, headerHeight);

      // Draw team name
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 18px sans-serif";
      ctx.fillText(
        `${team.name || `チーム${index + 1}`} (${team.members.length}人)`,
        x + 10,
        y + 15
      );

      // Draw members
      ctx.fillStyle = "#212121";
      ctx.font = "16px sans-serif";
      team.members.forEach((member, memberIndex) => {
        const memberY = y + headerHeight + 10 + memberIndex * lineHeight;
        ctx.fillText(`• ${member.name}`, x + 10, memberY);
      });
    });
  }

  /**
   * Convert canvas to PNG data URL
   * @private
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @returns {string} Data URL
   */
  _canvasToDataURL(canvas) {
    return canvas.toDataURL("image/png");
  }

  /**
   * Generate timestamped filename
   * @private
   * @returns {string} Filename in format teams-YYYYMMDD-HHMMSS.png
   */
  _generateFilename() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");

    return `teams-${year}${month}${day}-${hours}${minutes}${seconds}.png`;
  }

  /**
   * Trigger download of data URL
   * @private
   * @param {string} dataURL - Data URL
   * @param {string} filename - Filename
   */
  _triggerDownload(dataURL, filename) {
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  // Register global error handler
  window.onerror = function (message, source, lineno, colno, error) {
    console.error("Global error caught:", {
      message,
      source,
      lineno,
      colno,
      error,
    });

    // Show user-friendly error message
    const errorMsg =
      "予期しないエラーが発生しました。ページを再読み込みしてください。";

    // Only show alert if not already showing one (prevent cascade)
    if (!window._errorAlertShowing) {
      window._errorAlertShowing = true;
      alert(errorMsg);
      window._errorAlertShowing = false;
    }

    // Return true to prevent default error handling
    return true;
  };
}
