class QuaiService {

  static getAll() {
    const quais = QuaiRepository.getAll();

    // Convertit chaque instance de Enregistrement en objet littéral
    return quais.map(item => item.toJSON());
  }

  static getAllOperationnel() {
    const quais = QuaiRepository.getAllOperationnel();

    // Convertit chaque instance de Enregistrement en objet littéral
    return quais.map(item => item.toJSON());
  }


  static getQuai(id) {
    let quai = QuaiRepository.getQuai(id);
    return quai.toJSON();
  }

  static modifierEtatQuai(id) {

    let quai = QuaiRepository.getQuai(id);
    console.log(quai);
    if (!quai) {
      throw new Error(`Aucun quai trouvé avec l'ID : ${id}`);
    }

    if (quai.stateDock === "Hors Service") {
      quai.stateDock = "Opérationnel";
    } else if (quai.stateDock === "Opérationnel") {
      quai.stateDock = "Hors Service";
    }
    quai = QuaiRepository.modifierQuai(quai);
    LogService.ecrireLog(
      "QUAI", 
      `Modification  Quai ID : ${quai.idDock || "Inconnu"} - Etat: ${quai.stateDock}`
    );
    return quai;
  }

}
