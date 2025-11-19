from flask import Flask, jsonify
from flask_cors import CORS
import mysql.connector
import os

app = Flask(__name__)
CORS(app)

# -------------------------------------------------------------
#  Connexion à MySQL
# -------------------------------------------------------------
def get_db_connection():
    return mysql.connector.connect(
        host=os.getenv("MYSQL_HOST", "mysql-employee"),
        user=os.getenv("MYSQL_USER", "root"),
        password=os.getenv("MYSQL_PASSWORD", "root"),
        database=os.getenv("MYSQL_DB", "employees_db")
    )


# -------------------------------------------------------------
#  Calcul du salaire net (Tunisie)
# Brut => Net
# -------------------------------------------------------------
def calcul_salaire_net(brut):
    CNSS_EMPLOYE = 0.0918   # 9,18% CNSS salarié
    IRPP = 0.05             # 5% impôt (taux simplifié pour PFE)

    cnss = brut * CNSS_EMPLOYE
    irpp = brut * IRPP
    net = brut - cnss - irpp

    return round(net, 2), round(cnss, 2), round(irpp, 2)


# -------------------------------------------------------------
#  ROUTE : /payroll — calcul pour tous les employés
# -------------------------------------------------------------
@app.route('/payroll', methods=['GET'])
def get_all_payroll():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM employees;")
    employees = cursor.fetchall()

    result = []
    for emp in employees:
        brut = float(emp["base_salary"])
        net, cnss, irpp = calcul_salaire_net(brut)

        emp_result = {
            "id": emp["id"],
            "full_name": f"{emp['first_name']} {emp['last_name']}",
            "department_id": emp["dept_id"],
            "salaire_brut": brut,
            "CNSS": cnss,
            "IRPP": irpp,
            "salaire_net": net,
            "hire_date": emp["hire_date"].strftime("%Y-%m-%d")
        }
        result.append(emp_result)

    return jsonify(result)


# -------------------------------------------------------------
#  ROUTE : /payroll/<id> — calcul pour un employé
# -------------------------------------------------------------
@app.route('/payroll/<int:emp_id>', methods=['GET'])
def get_payroll_by_id(emp_id):
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM employees WHERE id = %s;", (emp_id,))
    emp = cursor.fetchone()

    if not emp:
        return jsonify({"error": "Employee not found"}), 404

    brut = float(emp["base_salary"])
    net, cnss, irpp = calcul_salaire_net(brut)

    emp_result = {
        "id": emp["id"],
        "full_name": f"{emp['first_name']} {emp['last_name']}",
        "department_id": emp["dept_id"],
        "salaire_brut": brut,
        "CNSS": cnss,
        "IRPP": irpp,
        "salaire_net": net,
        "hire_date": emp["hire_date"].strftime("%Y-%m-%d")
    }

    return jsonify(emp_result)


# -------------------------------------------------------------
# Health check
# -------------------------------------------------------------
@app.route('/healthz', methods=['GET'])
def health():
    return jsonify({"status": "ok", "service": "payroll"})


# -------------------------------------------------------------
# Lancement local (Docker runtime)
# -------------------------------------------------------------
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5004)

