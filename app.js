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
    // Will be implemented in subsequent tasks
    console.log("AppController initialized");
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
    // Will be implemented in task 2.1
    console.log("MemberManager initialized");
  }

  /**
   * Get all members
   * @returns {Array} Member array
   */
  getMembers() {
    // Will be implemented in task 2.1
    return this.members;
  }

  /**
   * Add a new member
   * @param {string} name - Member name
   * @param {string} type - Member type ('hiragana' or 'katakana')
   * @returns {Object} Result with member or error
   */
  addMember(name, type) {
    // Will be implemented in task 2.1
    return okResult({ id: "", name, type });
  }

  /**
   * Update a member
   * @param {string} id - Member ID
   * @param {string} name - New member name
   * @returns {Object} Result with member or error
   */
  updateMember(id, name) {
    // Will be implemented in task 2.1
    return okResult({ id, name, type: "hiragana" });
  }

  /**
   * Delete a member
   * @param {string} id - Member ID
   * @returns {Object} Result with success or error
   */
  deleteMember(id) {
    // Will be implemented in task 2.1
    return okResult(true);
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
