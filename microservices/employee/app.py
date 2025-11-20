from flask import Flask, jsonify, request, abort
from flask_cors import CORS
import mysql.connector
import os

# ---------------------------------------------------------
# Create Flask app
# ---------------------------------------------------------
app = Flask(__name__)
CORS(app)

# ---------------------------------------------------------
# Database configuration
# ---------------------------------------------------------
DB_HOST = os.getenv("MYSQL_HOST", "mysql-employee")
DB_NAME = os.getenv("MYSQL_DB", "employees_db")
DB_USER = os.getenv("MYSQL_USER", "root")
DB_PASS = os.getenv("MYSQL_PASSWORD", "root")

def get_conn():
    """Create database connection"""
    return mysql.connector.connect(
        host=DB_HOST,
        user=DB_USER,
        password=DB_PASS,
        database=DB_NAME
    )

# ---------------------------------------------------------
# Health check
# ---------------------------------------------------------
@app.get("/healthz")
def health():
    try:
        conn = get_conn()
        conn.close()
        return {"status": "ok", "service": "employee", "db": "up"}, 200
    except Exception as e:
        return {"status": "down", "error": str(e)}, 500

# ---------------------------------------------------------
# Get all employees
# ---------------------------------------------------------
@app.get("/employees")
def list_employees():
    dept = request.args.get("dept_id")
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    try:
        if dept:
            try:
                dept_id = int(dept)
            except:
                abort(400, "dept_id must be integer")

            cur.execute("SELECT * FROM employees WHERE dept_id=%s", (dept_id,))
        else:
            cur.execute("SELECT * FROM employees")

        rows = cur.fetchall()
        return jsonify(rows), 200

    finally:
        cur.close()
        conn.close()

# ---------------------------------------------------------
# Get single employee
# ---------------------------------------------------------
@app.get("/employees/<int:eid>")
def get_employee(eid):
    conn = get_conn()
    cur = conn.cursor(dictionary=True)

    try:
        cur.execute("SELECT * FROM employees WHERE id=%s", (eid,))
        row = cur.fetchone()
        if not row:
            abort(404, "employee not found")
        return jsonify(row), 200

    finally:
        cur.close()
        conn.close()

# ---------------------------------------------------------
# Create employee
# ---------------------------------------------------------
@app.post("/employees")
def create_employee():
    p = request.get_json(silent=True) or {}

    required_fields = ["first_name", "last_name", "age", "dept_id", "base_salary"]
    for field in required_fields:
        if field not in p:
            abort(400, f"Missing field: {field}")

    try:
        age = int(p["age"])
        dept_id = int(p["dept_id"])
        salary = int(p["base_salary"])
    except:
        abort(400, "age, dept_id, base_salary must be integers")

    hire_date = p.get("hire_date")  # Optional YYYY-MM-DD

    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute("""
            INSERT INTO employees(first_name,last_name,age,dept_id,base_salary,hire_date)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (p["first_name"], p["last_name"], age, dept_id, salary, hire_date))

        conn.commit()
        return jsonify({"id": cur.lastrowid}), 201

    finally:
        cur.close()
        conn.close()

# ---------------------------------------------------------
# Update employee
# ---------------------------------------------------------
@app.put("/employees/<int:eid>")
def update_employee(eid):
    p = request.get_json(silent=True) or {}

    allowed = ["first_name", "last_name", "age", "dept_id", "base_salary", "hire_date"]
    sets = []
    vals = []

    for k, v in p.items():
        if k not in allowed:
            continue

        if k in ["age", "dept_id", "base_salary"]:
            try:
                v = int(v)
            except:
                abort(400, f"{k} must be integer")

        sets.append(f"{k}=%s")
        vals.append(v)

    if not sets:
        abort(400, "no valid fields to update")

    vals.append(eid)

    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute(f"UPDATE employees SET {', '.join(sets)} WHERE id=%s", tuple(vals))
        conn.commit()

        if cur.rowcount == 0:
            abort(404, "employee not found")

        return jsonify({"updated": eid}), 200

    finally:
        cur.close()
        conn.close()

# ---------------------------------------------------------
# Delete employee
# ---------------------------------------------------------
@app.delete("/employees/<int:eid>")
def delete_employee(eid):
    conn = get_conn()
    cur = conn.cursor()

    try:
        cur.execute("DELETE FROM employees WHERE id=%s", (eid,))
        conn.commit()

        if cur.rowcount == 0:
            abort(404, "employee not found")

        return jsonify({"deleted": eid}), 200

    finally:
        cur.close()
        conn.close()

# ---------------------------------------------------------
# Run locally
# ---------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
