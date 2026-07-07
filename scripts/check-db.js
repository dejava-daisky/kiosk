const { checkStudentTable, getDbConfig } = require("../db");

checkStudentTable()
  .then((result) => {
    const config = getDbConfig();
    console.log(`connected: ${config.host}:${config.port}/${config.database}`);
    console.log(`table student: ${result.tableExists ? "yes" : "no"}`);
    console.log(`rows: ${result.rowCount}`);
    console.log(JSON.stringify(result.sample, null, 2));
  })
  .catch((error) => {
    console.error("database check failed");
    console.error(error.message);
    process.exitCode = 1;
  });
