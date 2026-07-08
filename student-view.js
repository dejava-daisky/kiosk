function mapStudentRows(rows) {
  return rows.map((row) => {
    const student = {
      id: String(row.id ?? ""),
      progress: String(row.progress ?? "")
    };

    if (Object.prototype.hasOwnProperty.call(row, "comment")) {
      student.comment = String(row.comment ?? "");
    }

    return student;
  });
}

module.exports = { mapStudentRows };
