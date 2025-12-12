/**
 * TDD Tests for Task 6: Image Export Functionality
 *
 * Tests verify:
 * - Canvas creation and drawing
 * - PNG image generation
 * - Download trigger
 * - Japanese font rendering
 * - Error handling
 */

// ==========================================
// Test Suite: ImageExporter Component (Task 6.1)
// ==========================================

function testImageExporterExists() {
  const exporter = new ImageExporter();
  if (!exporter) {
    throw new Error("ImageExporter should be instantiated");
  }

  if (typeof exporter.exportAsImage !== "function") {
    throw new Error("ImageExporter should have exportAsImage method");
  }

  console.log("✓ ImageExporter exists with exportAsImage method");
}

function testExportAsImageWithValidTeams() {
  const exporter = new ImageExporter();

  const teams = [
    {
      id: "1",
      name: "チーム1",
      members: [
        { id: "m1", name: "たなか", type: "hiragana" },
        { id: "m2", name: "サトウ", type: "katakana" },
      ],
    },
    {
      id: "2",
      name: "チーム2",
      members: [
        { id: "m3", name: "すずき", type: "hiragana" },
        { id: "m4", name: "ヤマダ", type: "katakana" },
      ],
    },
  ];

  const result = exporter.exportAsImage(teams);

  if (!result.ok) {
    throw new Error(`exportAsImage should succeed, got error: ${result.error}`);
  }

  console.log("✓ exportAsImage succeeds with valid teams");
}

function testExportAsImageWithEmptyTeams() {
  const exporter = new ImageExporter();

  const result = exporter.exportAsImage([]);

  if (result.ok) {
    throw new Error("exportAsImage should fail with empty teams");
  }

  if (!result.error || result.error.length === 0) {
    throw new Error("Error should contain message");
  }

  console.log("✓ exportAsImage fails gracefully with empty teams");
}

function testCanvasCreation() {
  const exporter = new ImageExporter();

  const teams = [
    {
      id: "1",
      name: "チーム1",
      members: [{ id: "m1", name: "たなか", type: "hiragana" }],
    },
  ];

  // Call private method through exportAsImage
  const canvas = exporter._createCanvas(teams);

  if (!canvas) {
    throw new Error("_createCanvas should return canvas element");
  }

  if (!(canvas instanceof HTMLCanvasElement)) {
    throw new Error("_createCanvas should return HTMLCanvasElement");
  }

  if (canvas.width <= 0 || canvas.height <= 0) {
    throw new Error("Canvas should have positive dimensions");
  }

  console.log("✓ Canvas is created with valid dimensions");
}

function testCanvasDimensions() {
  const exporter = new ImageExporter();

  const smallTeams = [
    {
      id: "1",
      name: "チーム1",
      members: [{ id: "m1", name: "たなか", type: "hiragana" }],
    },
  ];

  const largeTeams = [
    {
      id: "1",
      name: "チーム1",
      members: Array(10)
        .fill(null)
        .map((_, i) => ({
          id: `m${i}`,
          name: `メンバー${i}`,
          type: "hiragana",
        })),
    },
  ];

  const canvas1 = exporter._createCanvas(smallTeams);
  const canvas2 = exporter._createCanvas(largeTeams);

  // Canvas should adjust size based on content
  if (canvas2.height <= canvas1.height) {
    throw new Error("Canvas height should increase with more content");
  }

  console.log("✓ Canvas dimensions adjust to content");
}

function testDrawTeamsOnCanvas() {
  const exporter = new ImageExporter();

  const teams = [
    {
      id: "1",
      name: "チーム1",
      members: [
        { id: "m1", name: "たなか", type: "hiragana" },
        { id: "m2", name: "サトウ", type: "katakana" },
      ],
    },
  ];

  const canvas = exporter._createCanvas(teams);
  const ctx = canvas.getContext("2d");

  // Get image data before drawing
  const beforeData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  exporter._drawTeams(ctx, teams, canvas.width, canvas.height);

  // Get image data after drawing
  const afterData = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Check if canvas was modified
  let hasContent = false;
  for (let i = 0; i < afterData.data.length; i += 4) {
    const alpha = afterData.data[i + 3];
    if (alpha > 0) {
      hasContent = true;
      break;
    }
  }

  if (!hasContent) {
    throw new Error("_drawTeams should draw content on canvas");
  }

  console.log("✓ _drawTeams draws content on canvas");
}

function testCanvasToDataURL() {
  const exporter = new ImageExporter();

  const teams = [
    {
      id: "1",
      name: "チーム1",
      members: [{ id: "m1", name: "たなか", type: "hiragana" }],
    },
  ];

  const canvas = exporter._createCanvas(teams);
  const ctx = canvas.getContext("2d");
  exporter._drawTeams(ctx, teams, canvas.width, canvas.height);

  const dataURL = exporter._canvasToDataURL(canvas);

  if (!dataURL || typeof dataURL !== "string") {
    throw new Error("_canvasToDataURL should return string");
  }

  if (!dataURL.startsWith("data:image/png")) {
    throw new Error("Data URL should start with 'data:image/png'");
  }

  console.log("✓ _canvasToDataURL generates valid PNG data URL");
}

function testGenerateTimestampFilename() {
  const exporter = new ImageExporter();

  const filename = exporter._generateFilename();

  if (!filename || typeof filename !== "string") {
    throw new Error("_generateFilename should return string");
  }

  if (!filename.startsWith("teams-")) {
    throw new Error("Filename should start with 'teams-'");
  }

  if (!filename.endsWith(".png")) {
    throw new Error("Filename should end with '.png'");
  }

  // Check format: teams-YYYYMMDD-HHMMSS.png
  const pattern = /^teams-\d{8}-\d{6}\.png$/;
  if (!pattern.test(filename)) {
    throw new Error(
      `Filename should match pattern teams-YYYYMMDD-HHMMSS.png, got: ${filename}`
    );
  }

  console.log("✓ _generateFilename creates timestamped filename");
}

function testTriggerDownload() {
  const exporter = new ImageExporter();

  // Create a simple data URL
  const dataURL =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const filename = "test-teams.png";

  // This will trigger download but we can't easily test in automated environment
  // Just verify it doesn't throw error
  try {
    exporter._triggerDownload(dataURL, filename);
    console.log("✓ _triggerDownload executes without error");
  } catch (error) {
    throw new Error(
      `_triggerDownload should not throw error: ${error.message}`
    );
  }
}

// ==========================================
// Test Suite: Export Button UI (Task 6.2)
// ==========================================

function testExportButtonExists() {
  const button = document.getElementById("export-image-btn");
  if (!button) {
    throw new Error("Export image button should exist in DOM");
  }

  console.log("✓ Export image button exists in DOM");
}

function testExportButtonCallsExportImage() {
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const exporter = new ImageExporter();
  const controller = new AppController();

  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;
  controller.imageExporter = exporter;

  if (document.getElementById("team-assignment-form")) {
    controller.init();
  }

  // Execute team assignment first
  const config = { mode: "teamCount", teamCount: 2 };
  controller.executeTeamAssignment(config);

  // Mock exportAsImage to verify it's called
  let exportCalled = false;
  const originalExport = exporter.exportAsImage;
  exporter.exportAsImage = function (teams) {
    exportCalled = true;
    return okResult(undefined);
  };

  // Trigger export
  controller._handleExportImage();

  // Restore original method
  exporter.exportAsImage = originalExport;

  if (!exportCalled) {
    throw new Error("Export button should call exportAsImage");
  }

  console.log("✓ Export button triggers exportAsImage");
}

function testExportWithoutResultsShowsError() {
  const controller = new AppController();
  controller.memberManager = new MemberManager();
  controller.teamAssignmentEngine = new TeamAssignmentEngine();
  controller.imageExporter = new ImageExporter();

  if (document.getElementById("team-assignment-form")) {
    controller.init();
  }

  // Clear lastTeams
  controller.lastTeams = null;

  // This should show error (we can't easily test alert in automated test)
  // Just verify it doesn't crash
  try {
    controller._handleExportImage();
    console.log("✓ Export without results handles error gracefully");
  } catch (error) {
    throw new Error(`Export should handle missing results: ${error.message}`);
  }
}

function testExportPassesTeamsToExporter() {
  sessionStorage.removeItem("team-assignment-members");
  const memberManager = new MemberManager();
  memberManager.initializeMembers();

  const engine = new TeamAssignmentEngine();
  const exporter = new ImageExporter();
  const controller = new AppController();

  controller.memberManager = memberManager;
  controller.teamAssignmentEngine = engine;
  controller.imageExporter = exporter;

  if (document.getElementById("team-assignment-form")) {
    controller.init();
  }

  const config = { mode: "teamCount", teamCount: 2 };
  controller.executeTeamAssignment(config);

  // Mock exportAsImage to capture teams parameter
  let capturedTeams = null;
  const originalExport = exporter.exportAsImage;
  exporter.exportAsImage = function (teams) {
    capturedTeams = teams;
    return okResult(undefined);
  };

  controller._handleExportImage();

  exporter.exportAsImage = originalExport;

  if (!capturedTeams) {
    throw new Error("Export should pass teams to exporter");
  }

  if (!Array.isArray(capturedTeams)) {
    throw new Error("Exported teams should be an array");
  }

  if (capturedTeams.length !== 2) {
    throw new Error(
      `Expected 2 teams to be exported, got ${capturedTeams.length}`
    );
  }

  console.log("✓ Export passes correct teams to exporter");
}

// ==========================================
// Test Runner
// ==========================================

function runTask6Tests() {
  console.log("=== Running TDD Tests for Task 6: Image Export ===\n");

  try {
    console.log("Testing ImageExporter Component (6.1):");
    testImageExporterExists();
    testExportAsImageWithValidTeams();
    testExportAsImageWithEmptyTeams();
    testCanvasCreation();
    testCanvasDimensions();
    testDrawTeamsOnCanvas();
    testCanvasToDataURL();
    testGenerateTimestampFilename();
    testTriggerDownload();
    console.log("");

    console.log("Testing Export Button UI (6.2):");
    testExportButtonExists();
    testExportButtonCallsExportImage();
    testExportWithoutResultsShowsError();
    testExportPassesTeamsToExporter();
    console.log("");

    console.log("=== All Task 6 Tests Passed! ===");
    return true;
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    console.error(error.stack);
    return false;
  }
}
