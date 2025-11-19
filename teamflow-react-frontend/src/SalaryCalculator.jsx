import { useState } from "react";

export default function SalaryCalculator() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [result, setResult] = useState(null);

  const handleCalculate = async () => {
    if (!firstName || !lastName) {
      alert("Veuillez remplir prénom et nom !");
      return;
    }

    try {
      // 🔥 ON UTILISE /payroll (qui marche déjà)
      const res = await fetch("http://payroll.local/payroll");
      const all = await res.json();

      // 🔍 Trouver l'employé
      const emp = all.find(
        e =>
          e.full_name.toLowerCase() === `${firstName} ${lastName}`.toLowerCase()
      );

      if (!emp) {
        alert("Employé introuvable !");
        return;
      }

      setResult(emp);

    } catch (err) {
      console.error(err);
      alert("Erreur : Payroll ne répond pas !");
    }
  };

  return (
    <div className="p-5 bg-white shadow rounded-xl mt-5">
      <h2 className="text-xl font-bold mb-3">🔢 Calcul d’un salaire</h2>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Prénom"
          className="border p-2 rounded w-full"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Nom"
          className="border p-2 rounded w-full"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
        />
      </div>

      <button
        onClick={handleCalculate}
        className="mt-4 w-full bg-blue-600 text-white rounded p-2"
      >
        Calculer
      </button>

      {result && (
        <div className="mt-4 bg-green-100 p-3 rounded">
          <p><b>Salaire brut :</b> {result.salaire_brut} TND</p>
          <p><b>Salaire net :</b> {result.salaire_net} TND</p>
          <p><b>CNSS :</b> {result.CNSS}</p>
          <p><b>IRPP :</b> {result.IRPP}</p>
        </div>
      )}
    </div>
  );
}

