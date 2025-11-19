from flask import Flask, jsonify, request, abort
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__)
CORS(app)

DB_HOST = os.getenv("MYSQL_HOST", "mysql-employee")
DB_NAME = os.getenv("MYSQL_DB",   "employees_db")
DB_USER = os.getenv("MYSQL_USER", "root")
DB_PASS = os.getenv("MYSQL_PASSWORD", "root")

def get_conn():
    return mysql.connector.connect(
        host=DB_HOST, user=DB_USER, password=DB_PASS, database=DB_NAME
    )

@app.get("/healthz")
def health():
    try:
        conn = get_conn()
        conn.close()
        return {"status": "ok", "service": "employee", "db": "up"}, 200
    except Exception as e:
        return {"status": "down", "error": str(e)}, 500

@app.get("/employees")
def list_employees():
    dept = request.args.get("dept_id")
    conn = get_conn(); cur = conn.cursor(dictionary=True)
    try:
        if dept:
            try: dept_id = int(dept)
            except: abort(400, "dept_id must be integer")
            cur.execute("SELECT * FROM employees WHERE dept_id=%s", (dept_id,))
        else:
            cur.execute("SELECT * FROM employees")
        rows = cur.fetchall()
        return jsonify(rows), 200
    finally:
        cur.close(); conn.close()

@app.get("/employees/<int:eid>")
def get_employee(eid):
    conn = get_conn(); cur = conn.cursor(dictionary=True)
    try:
        cur.execute("SELECT * FROM employees WHERE id=%s", (eid,))
        row = cur.fetchone()
        if not row: abort(404, "employee not found")
        return jsonify(row), 200
    finally:
        cur.close(); conn.close()

@app.post("/employees")
def create_employee():
    p = request.get_json(silent=True) or {}
    for k in ["first_name","last_name","age","dept_id","base_salary"]:
        if k not in p: abort(400, f"Missing field: {k}")
    try:
        age = int(p["age"]); dept_id = int(p["dept_id"]); salary = int(p["base_salary"])
    except: abort(400, "age, dept_id, base_salary must be integers")

    hire_date = p.get("hire_date")  # "YYYY-MM-DD" (optionnel)
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO employees(first_name,last_name,age,dept_id,base_salary,hire_date)
            VALUES (%s,%s,%s,%s,%s,%s)
        """, (p["first_name"], p["last_name"], age, dept_id, salary, hire_date))
        conn.commit()
        new_id = cur.lastrowid
        return jsonify({"id": new_id}), 201
    finally:
        cur.close(); conn.close()

@app.put("/employees/<int:eid>")
def update_employee(eid):
    p = request.get_json(silent=True) or {}
    allowed = ["first_name","last_name","age","dept_id","base_salary","hire_date"]
    sets = []; vals = []
    for k,v in p.items():
        if k not in allowed: continue
        if k in ["age","dept_id","base_salary"]: 
            try: v = int(v)
            except: abort(400, f"{k} must be integer")
        sets.append(f"{k}=%s"); vals.append(v)
    if not sets: abort(400, "no valid fields to update")

    vals.append(eid)
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute(f"UPDATE employees SET {', '.join(sets)} WHERE id=%s", tuple(vals))
        conn.commit()
        if cur.rowcount == 0: abort(404, "employee not found")
        return jsonify({"updated": eid}), 200
    finally:
        cur.close(); conn.close()

@app.delete("/employees/<int:eid>")
def delete_employee(eid):
    conn = get_conn(); cur = conn.cursor()
    try:
        cur.execute("DELETE FROM employees WHERE id=%s", (eid,))
        conn.commit()
        if cur.rowcount == 0: abort(404, "employee not found")
        return jsonify({"deleted": eid}), 200
    finally:
        cur.close(); conn.close()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)

