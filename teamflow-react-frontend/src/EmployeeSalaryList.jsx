import { useEffect, useState } from "react";

export function EmployeeSalaryList() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://employee.local/employees");
        const list = await res.json();

        const enriched = await Promise.all(
          list.map(async (emp) => {
            const p = await fetch(`http://payroll.local/calc?id=${emp.id}`);
            const salary = await p.json();
            return {
              ...emp,
              brut: salary.brut,
              net: salary.net,
            };
          })
        );

        setEmployees(enriched);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  return (
    <div className="p-5 bg-white shadow rounded-xl mt-5">
      <h2 className="text-xl font-bold mb-3">📋 Salaire de tous les employés</h2>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Prénom</th>
            <th className="p-2 border">Nom</th>
            <th className="p-2 border">Salaire brut</th>
            <th className="p-2 border">Salaire net</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((e) => (
            <tr key={e.id}>
              <td className="p-2 border">{e.first_name}</td>
              <td className="p-2 border">{e.last_name}</td>
              <td className="p-2 border">{e.brut} TND</td>
              <td className="p-2 border">{e.net} TND</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
