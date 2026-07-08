const {
  fetchProjects,
  updateProjectScreenshotPath
} = require("../db");
const { captureScreenshotsFromDatabase } = require("../screenshot-capture");

async function main() {
  const result = await captureScreenshotsFromDatabase({
    fetchProjects,
    updateProjectScreenshotPath
  });

  console.log(`screenshots captured=${result.captured}, skipped=${result.skipped}, failed=${result.failed}`);
  result.logs.forEach((log) => {
    if (log.status === "failed") {
      console.log(`failed project=${log.projectId}: ${log.reason}`);
      return;
    }

    console.log(`${log.status} project=${log.projectId}${log.screenshotPath ? ` path=${log.screenshotPath}` : ""}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
