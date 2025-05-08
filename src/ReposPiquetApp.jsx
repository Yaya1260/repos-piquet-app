import React, { useState } from "react";
import { differenceInMinutes, parse, addHours, format, isBefore } from "date-fns";

export default function ReposPiquetApp() {
  const [formData, setFormData] = useState({
    finTravail: "",
    debutInter1: "",
    finInter1: "",
    debutInter2: "",
    finInter2: ""
  });

  const [resultat, setResultat] = useState("");

  const handleChange = (e) => {
    let value = e.target.value;
    if (/^\d{4}$/.test(value)) {
      value = value.slice(0, 2) + ":" + value.slice(2);
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  const parseTime = (timeStr) => parse(timeStr, "HH:mm", new Date());

  const calculerRepos = () => {
    try {
      const {
        finTravail,
        debutInter1,
        finInter1,
        debutInter2,
        finInter2
      } = formData;

      const ft = parseTime(finTravail);
      const di1 = parseTime(debutInter1);
      const fi1 = parseTime(finInter1);

      if (isBefore(di1, ft)) di1.setDate(di1.getDate() + 1);
      if (isBefore(fi1, di1)) fi1.setDate(fi1.getDate() + 1);

      let totalRepos = differenceInMinutes(di1, ft) / 60;
      let tranche4h = totalRepos >= 4;
      let fi2 = null;

      if (debutInter2 && finInter2) {
        const di2 = parseTime(debutInter2);
        fi2 = parseTime(finInter2);
        if (isBefore(di2, fi1)) di2.setDate(di2.getDate() + 1);
        if (isBefore(fi2, di2)) fi2.setDate(fi2.getDate() + 1);

        const tranche2 = differenceInMinutes(di2, fi1) / 60;
        const tranche3 = differenceInMinutes(addHours(8, 0), fi2) / 60;

        totalRepos += tranche2 + tranche3;
        tranche4h = tranche4h || tranche2 >= 4 || tranche3 >= 4;
      } else {
        const tranche2 = differenceInMinutes(addHours(8, 0), fi1) / 60;
        totalRepos += tranche2;
        tranche4h = tranche4h || tranche2 >= 4;
      }

      let reposApres = 0;
      let messageTranche = "";

      if (tranche4h && totalRepos >= 11) {
        messageTranche = "✅ Tranche de repos consécutive de 4h respectée.";
        reposApres = 0;
      } else {
        messageTranche = "❌ Aucune tranche de repos de 4h ou repos total < 11h. Repos obligatoire de 11h après dernière intervention.";
        reposApres = 11;
      }

      const heureMinReprise = addHours(fi2 || fi1, reposApres);

      let msg = `Repos total cumulé : ${totalRepos.toFixed(2)} h\n`;
      msg += `Repos requis après intervention : ${reposApres.toFixed(2)} h\n`;
      msg += messageTranche + "\n";
      msg += `⏰ Heure minimale de reprise : ${format(heureMinReprise, "HH:mm")} (${format(heureMinReprise, "dd/MM/yyyy")})`;

      setResultat(msg);
    } catch (err) {
      setResultat("Erreur de format : utilisez HH:mm ou 4 chiffres (ex: 0730) pour toutes les heures.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem", backgroundColor: '#2563eb', color: 'white', padding: '0.5rem' }}>Calcul du Repos Quotidien</h1>
      {Object.entries(formData).map(([key, val]) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <input
            name={key}
            value={val}
            onChange={handleChange}
            placeholder={key.replace(/([A-Z])/g, " $1").trim() + " (HH:mm ou HHmm)"}
            style={{ width: "100%", padding: "0.5rem" }}
          />
        </div>
      ))}
      <button onClick={calculerRepos} style={{ padding: "0.5rem 1rem", backgroundColor: "#2563eb", color: "#fff", borderRadius: "4px" }}>
        Calculer
      </button>
      {resultat && (
        <pre style={{ marginTop: "1rem", background: "#f9f9f9", padding: "1rem", whiteSpace: "pre-wrap" }}>{resultat}</pre>
      )}
    </div>
  );
}
