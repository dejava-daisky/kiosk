const mysql = require("mysql2/promise");
const { mapStudentRows } = require("./student-view");

function getDbConfig() {
  return {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "kiosk"
  };
}

async function createConnection() {
  return mysql.createConnection(getDbConfig());
}

async function fetchStudents() {
  const connection = await createConnection();
  try {
    const [rows] = await connection.query("SELECT id, progress FROM student ORDER BY id LIMIT 30");
    return mapStudentRows(rows);
  } finally {
    await connection.end();
  }
}

async function saveStudentProgress(student) {
  const connection = await createConnection();
  try {
    await connection.execute(
      "INSERT INTO student (id, progress) VALUES (?, ?) ON DUPLICATE KEY UPDATE progress = VALUES(progress)",
      [student.id, student.progress]
    );
    return student;
  } finally {
    await connection.end();
  }
}

async function checkStudentTable() {
  const connection = await createConnection();
  try {
    const [databaseRows] = await connection.query("SELECT DATABASE() AS database_name");
    const [tableRows] = await connection.query("SHOW TABLES LIKE 'student'");
    const [countRows] = await connection.query("SELECT COUNT(*) AS row_count FROM student");
    const [sampleRows] = await connection.query("SELECT * FROM student LIMIT 3");

    return {
      database: databaseRows[0].database_name,
      tableExists: tableRows.length > 0,
      rowCount: Number(countRows[0].row_count),
      sample: mapStudentRows(sampleRows)
    };
  } finally {
    await connection.end();
  }
}

module.exports = { fetchStudents, saveStudentProgress, checkStudentTable, getDbConfig };
