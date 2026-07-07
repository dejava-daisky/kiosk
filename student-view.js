function mapStudentRows(rows) {
  return rows.map((row) => ({
    id: String(row.id ?? ""),
    progress: String(row.progress ?? "")
  }));
}

module.exports = { mapStudentRows };
