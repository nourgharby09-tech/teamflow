import SalaryCalculator from "./SalaryCalculator";
import { EmployeeSalaryList } from "./EmployeeSalaryList";
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const EMPLOYEE_API = 'http://employee.local';
const PAYROLL_API = 'http://payroll.local';
const DEPARTMENT_API = 'http://department.local';


function formatDate(d) {
  if (!d) return '';
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString();
}

function numberFmt(n) {
  if (n == null || Number.isNaN(n)) return '-';
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [payroll, setPayroll] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterDeptId, setFilterDeptId] = useState('all');

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    age: '',
    base_salary: '',
    hire_date: '',
    dept_id: ''
  });

  // Map helpers
  const departmentsMap = useMemo(() => {
    const m = {};
    departments.forEach(d => (m[d.id] = d.name));
    return m;
  }, [departments]);

  const payrollMap = useMemo(() => {
    const m = {};
    payroll.forEach(p => (m[p.id] = p));
    return m;
  }, [payroll]);

  const mergedRows = useMemo(() => {
    let rows = employees.map(emp => {
      const p = payrollMap[emp.id] || {};
      return {
        id: emp.id,
        fullName: `${emp.first_name} ${emp.last_name}`,
        age: emp.age,
        deptId: emp.dept_id,
        deptName: departmentsMap[emp.dept_id] || `Dept ${emp.dept_id}`,
        baseSalary: Number(emp.base_salary),
        hireDate: emp.hire_date,
        salaireBrut: p.salaire_brut ?? Number(emp.base_salary),
        salaireNet: p.salaire_net ?? null,
        cnss: p.CNSS ?? null,
        irpp: p.IRPP ?? null
      };
    });

    if (filterDeptId !== 'all') {
      const id = Number(filterDeptId);
      rows = rows.filter(r => r.deptId === id);
    }

    rows.sort((a, b) => b.id - a.id);
    return rows;
  }, [employees, payrollMap, departmentsMap, filterDeptId]);

  const totals = useMemo(() => {
    let brut = 0;
    let net = 0;
    mergedRows.forEach(r => {
      brut += Number(r.salaireBrut || 0);
      net += Number(r.salaireNet || 0);
    });
    return { brut, net };
  }, [mergedRows]);

  async function loadAll() {
    try {
      setLoading(true);
      setError('');
      const [empRes, payRes, deptRes] = await Promise.all([
        axios.get(`${EMPLOYEE_API}/employees`),
        axios.get(`${PAYROLL_API}/payroll`),
        axios.get(`${DEPARTMENT_API}/departments`)
      ]);
      setEmployees(empRes.data || []);
      setPayroll(payRes.data || []);
      setDepartments(deptRes.data || []);
    } catch (err) {
      console.error(err);
      setError('Erreur lors du chargement des données (employees / payroll / departments).');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.first_name || !form.last_name || !form.base_salary || !form.hire_date || !form.dept_id) {
      setError('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      age: form.age ? Number(form.age) : null,
      dept_id: Number(form.dept_id),
      base_salary: Number(form.base_salary),
      hire_date: new Date(form.hire_date).toISOString().split('T')[0]
    };

    try {
      setSaving(true);
      await axios.post(`${EMPLOYEE_API}/employees`, payload, {
        headers: { 'Content-Type': 'application/json' }
      });
      setSuccess('Employé ajouté avec succès.');
      setForm({
        first_name: '',
        last_name: '',
        age: '',
        base_salary: '',
        hire_date: '',
        dept_id: ''
      });
      await loadAll();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'ajout de l'employé.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(`Supprimer l'employé #${id} ?`)) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`${EMPLOYEE_API}/employees/${id}`);
      setSuccess(`Employé #${id} supprimé.`);
      await loadAll();
    } catch (err) {
      console.error(err);
      setError('Erreur lors de la suppression.');
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">TeamFlow – Dashboard RH</h1>
            <p className="text-sm text-slate-500">
              Gestion centralisée des employés, des départements et des salaires brut / net.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
            React + Vite + Tailwind
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Messages */}
        {(error || success) && (
          <div className="space-y-2">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
                {success}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Employés</p>
            <p className="mt-2 text-2xl font-semibold">{mergedRows.length}</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total salaire brut</p>
            <p className="mt-2 text-2xl font-semibold">{numberFmt(totals.brut)} TND</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-slate-500">Total salaire net</p>
            <p className="mt-2 text-2xl font-semibold">{numberFmt(totals.net)} TND</p>
          </div>
        </section>

        {/* Form + filters */}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Ajouter un employé</h2>
            <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-2">
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
                placeholder="Prénom"
                required
              />
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
                placeholder="Nom"
                required
              />
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                placeholder="Âge"
              />
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                type="number"
                name="base_salary"
                value={form.base_salary}
                onChange={handleChange}
                placeholder="Salaire brut (TND)"
                required
              />
              <input
                className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                type="date"
                name="hire_date"
                value={form.hire_date}
                onChange={handleChange}
                required
              />
              <select
                className="rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                name="dept_id"
                value={form.dept_id}
                onChange={handleChange}
                required
              >
                <option value="">Département…</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={saving}
                className="md:col-span-2 inline-flex items-center justify-center rounded-md bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-60"
              >
                {saving ? 'Enregistrement…' : 'Ajouter un employé'}
              </button>
            </form>
          </div>

          <div className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold">Filtres</h2>
            <div className="space-y-2 text-sm">
              <label className="block text-slate-600 font-medium">Département</label>
              <select
                className="w-full rounded-md border border-slate-300 px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                value={filterDeptId}
                onChange={e => setFilterDeptId(e.target.value)}
              >
                <option value="all">Tous les départements</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500">
              Le filtre s&apos;applique sur le tableau ci-dessous et sur les totaux (brut / net).
            </p>
          </div>
        </section>

        {/* Table */}
        <section className="rounded-xl bg-white border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Liste des employés</h2>
            {loading && <span className="text-xs text-slate-500">Chargement…</span>}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-3 py-2 text-left font-semibold">ID</th>
                  <th className="px-3 py-2 text-left font-semibold">Employé</th>
                  <th className="px-3 py-2 text-left font-semibold">Âge</th>
                  <th className="px-3 py-2 text-left font-semibold">Département</th>
                  <th className="px-3 py-2 text-right font-semibold">Salaire brut</th>
                  <th className="px-3 py-2 text-right font-semibold">Salaire net</th>
                  <th className="px-3 py-2 text-right font-semibold">CNSS</th>
                  <th className="px-3 py-2 text-right font-semibold">IRPP</th>
                  <th className="px-3 py-2 text-left font-semibold">Date embauche</th>
                  <th className="px-3 py-2 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mergedRows.length === 0 && (
                  <tr>
                    <td colSpan="10" className="px-3 py-6 text-center text-slate-500">
                      Aucun employé à afficher.
                    </td>
                  </tr>
                )}
                {mergedRows.map(row => (
                  <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-3 py-2">{row.id}</td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">{row.fullName}</div>
                    </td>
                    <td className="px-3 py-2">{row.age ?? '-'}</td>
                    <td className="px-3 py-2">{row.deptName}</td>
                    <td className="px-3 py-2 text-right">{numberFmt(row.salaireBrut)}</td>
                    <td className="px-3 py-2 text-right">{numberFmt(row.salaireNet)}</td>
                    <td className="px-3 py-2 text-right">
                      {row.cnss != null ? numberFmt(row.cnss) : '-'}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {row.irpp != null ? numberFmt(row.irpp) : '-'}
                    </td>
                    <td className="px-3 py-2">{formatDate(row.hireDate)}</td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="inline-flex items-center rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-100"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
         <SalaryCalculator />
         <EmployeeSalaryList />
        </section>
      </main>
    </div>
  );
}
