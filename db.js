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

async function ensureStudentColumn(connection, columnName, columnDefinition) {
  const [databaseRows] = await connection.query("SELECT DATABASE() AS database_name");
  const databaseName = databaseRows[0].database_name;
  const [columnRows] = await connection.execute(
    `SELECT COLUMN_NAME
       FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = ?
        AND TABLE_NAME = 'student'
        AND COLUMN_NAME = ?`,
    [databaseName, columnName]
  );

  if (columnRows.length === 0) {
    await connection.query(`ALTER TABLE student ADD COLUMN ${columnDefinition}`);
  }
}

async function ensureProjectTables(connection) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS student_project (
      id INT AUTO_INCREMENT PRIMARY KEY,
      student_id VARCHAR(50) NOT NULL,
      project_name VARCHAR(255) NOT NULL,
      progress VARCHAR(100) NOT NULL,
      professor_feedback TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_student_project (student_id, project_name)
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS project_comment (
      id INT AUTO_INCREMENT PRIMARY KEY,
      project_id INT NOT NULL,
      comment_text TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_project_comment_project
        FOREIGN KEY (project_id) REFERENCES student_project(id)
        ON DELETE CASCADE
    )
  `);
}

function mapProjectRows(rows) {
  return rows.map((row) => ({
    id: Number(row.id),
    studentId: String(row.student_id ?? ""),
    projectName: String(row.project_name ?? ""),
    progress: String(row.progress ?? ""),
    professorFeedback: String(row.professor_feedback ?? ""),
    latestComment: String(row.latest_comment ?? ""),
    commentCount: Number(row.comment_count ?? 0)
  }));
}

async function fetchProjectRows(connection) {
  const [rows] = await connection.query(`
    SELECT
      p.id,
      p.student_id,
      p.project_name,
      p.progress,
      p.professor_feedback,
      (
        SELECT c.comment_text
        FROM project_comment c
        WHERE c.project_id = p.id
        ORDER BY c.created_at DESC, c.id DESC
        LIMIT 1
      ) AS latest_comment,
      (
        SELECT COUNT(*)
        FROM project_comment c
        WHERE c.project_id = p.id
      ) AS comment_count
    FROM student_project p
    ORDER BY p.student_id, p.project_name
  `);

  return mapProjectRows(rows);
}

async function fetchProjects() {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    return await fetchProjectRows(connection);
  } finally {
    await connection.end();
  }
}

async function fetchProjectById(projectId) {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    const [rows] = await connection.execute(
      `
        SELECT id, student_id, project_name, progress, professor_feedback
        FROM student_project
        WHERE id = ?
      `,
      [projectId]
    );

    if (rows.length === 0) {
      return null;
    }

    const [comments] = await connection.execute(
      `
        SELECT id, comment_text, created_at
        FROM project_comment
        WHERE project_id = ?
        ORDER BY created_at ASC, id ASC
      `,
      [projectId]
    );

    return {
      id: Number(rows[0].id),
      studentId: String(rows[0].student_id ?? ""),
      projectName: String(rows[0].project_name ?? ""),
      progress: String(rows[0].progress ?? ""),
      professorFeedback: String(rows[0].professor_feedback ?? ""),
      comments: comments.map((comment) => ({
        id: Number(comment.id),
        comment: String(comment.comment_text ?? ""),
        createdAt: new Date(comment.created_at).toISOString()
      }))
    };
  } finally {
    await connection.end();
  }
}

async function saveProject(project) {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    await connection.execute(
      `
        INSERT INTO student_project (student_id, project_name, progress, professor_feedback)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          progress = VALUES(progress),
          professor_feedback = VALUES(professor_feedback)
      `,
      [project.studentId, project.projectName, project.progress, project.professorFeedback]
    );

    const [rows] = await connection.execute(
      `
        SELECT id, student_id, project_name, progress, professor_feedback
        FROM student_project
        WHERE student_id = ? AND project_name = ?
      `,
      [project.studentId, project.projectName]
    );

    return {
      id: Number(rows[0].id),
      studentId: String(rows[0].student_id ?? ""),
      projectName: String(rows[0].project_name ?? ""),
      progress: String(rows[0].progress ?? ""),
      professorFeedback: String(rows[0].professor_feedback ?? "")
    };
  } finally {
    await connection.end();
  }
}

async function updateProjectById(projectId, project) {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    const [result] = await connection.execute(
      `
        UPDATE student_project
        SET student_id = ?, project_name = ?, progress = ?, professor_feedback = ?
        WHERE id = ?
      `,
      [project.studentId, project.projectName, project.progress, project.professorFeedback, projectId]
    );

    if (result.affectedRows === 0) {
      return null;
    }

    return fetchProjectById(projectId);
  } finally {
    await connection.end();
  }
}

async function deleteProjectById(projectId) {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    const [result] = await connection.execute("DELETE FROM student_project WHERE id = ?", [projectId]);
    return { id: projectId, deleted: result.affectedRows > 0 };
  } finally {
    await connection.end();
  }
}

async function addProjectComment(projectId, comment) {
  const connection = await createConnection();
  try {
    await ensureProjectTables(connection);
    const [result] = await connection.execute(
      "INSERT INTO project_comment (project_id, comment_text) VALUES (?, ?)",
      [projectId, comment]
    );

    const [rows] = await connection.execute(
      "SELECT id, comment_text, created_at FROM project_comment WHERE id = ?",
      [result.insertId]
    );

    return {
      id: Number(rows[0].id),
      comment: String(rows[0].comment_text ?? ""),
      createdAt: new Date(rows[0].created_at).toISOString()
    };
  } finally {
    await connection.end();
  }
}

async function fetchStudents() {
  const connection = await createConnection();
  try {
    await ensureStudentColumn(connection, "comment", "comment TEXT NULL");
    const [rows] = await connection.query("SELECT id, progress, comment FROM student ORDER BY id LIMIT 30");
    return mapStudentRows(rows);
  } finally {
    await connection.end();
  }
}

async function saveStudentProgress(student) {
  const connection = await createConnection();
  try {
    await connection.execute(
      `INSERT INTO student (id, progress)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE progress = VALUES(progress)`,
      [student.id, student.progress]
    );
    return student;
  } finally {
    await connection.end();
  }
}

async function saveStudentComment(id, comment) {
  const connection = await createConnection();
  try {
    await ensureStudentColumn(connection, "comment", "comment TEXT NULL");
    const [result] = await connection.execute(
      "UPDATE student SET comment = ? WHERE id = ?",
      [comment, id]
    );

    return { id, comment, updated: result.affectedRows > 0 };
  } finally {
    await connection.end();
  }
}

async function deleteStudentById(id) {
  const connection = await createConnection();
  try {
    const [result] = await connection.execute("DELETE FROM student WHERE id = ?", [id]);
    return { id, deleted: result.affectedRows > 0 };
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

module.exports = {
  fetchProjects,
  fetchProjectById,
  saveProject,
  updateProjectById,
  deleteProjectById,
  addProjectComment,
  fetchStudents,
  saveStudentProgress,
  saveStudentComment,
  deleteStudentById,
  checkStudentTable,
  getDbConfig
};
