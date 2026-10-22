class EnregistrementService {

  static getAll() {
    const enregistrements = EnregistrementRepository.getAll();

    // Convertit chaque instance de Enregistrement en objet littéral
    return enregistrements.map(item => item.toJSON());
  }


  static getAllByDate(dateDebut, dateFin) {
    const enregistrements = EnregistrementRepository.getAllbyDate(dateDebut, dateFin);

    // Convertit chaque instance de Enregistrement en objet littéral
    return enregistrements.map(item => item.toJSON());
  }

  // Fonction pour créer un enregistrement
  static creerEnregistrement(enregistrement, anomalie = []) {
    // Vérification de la présence des champs obligatoires
    const resultat = EnregistrementService.verifValide(enregistrement, anomalie);

    if (resultat.valide) {

      let listeTransporteur = ParamsService.getTransporteurs();
      let listeClient = ParamsService.getClients();
      let nouveauClient = null;
      let nouveauTransporteur = null;

      if (!listeTransporteur.includes(enregistrement.transporteur.trim())) {
        nouveauTransporteur = enregistrement.transporteur.trim();
        ParamsService.ajouterDonnees("Transporteur", nouveauTransporteur);
      }

      if (!listeClient.includes(enregistrement.client.trim())) {
        nouveauClient = enregistrement.client.trim();
        ParamsService.ajouterDonnees("Client", nouveauClient);
      }

      EnregistrementRepository.creerEnregistrement(enregistrement);
      LogService.logEnregistrement("CREATION", enregistrement.id);

      return {
        success: true,
        transporteur: nouveauTransporteur,
        client: nouveauClient
      };
    } else {
      throw new Error(resultat.message);
    }
  }

  // Fonction pour récupérer les données pour la page d'affichage quai/attente
  static getAllAffichage() {
    const enregistrements = EnregistrementRepository.getAllAffichage();
    let enregistrementsAttente = enregistrements.filter(enregistrement => {
      if (!enregistrement.quai && !enregistrement.heure_pret_ch && enregistrement.heure_arrivee && enregistrement.statut != "Décrochée") {
        return true;
      }
      return false;
    });
    enregistrementsAttente = enregistrementsAttente.sort((a, b) => a.heure_arrivee - b.heure_arrivee);

    // récupéré les enregistrements avec un quai.
    let enregistrementsQuai = enregistrements.filter(enregistrement => {
      if (!enregistrement.quai) {
        return false;
      }
      return true;
    });
    enregistrementsQuai = enregistrementsQuai.sort((a, b) => a.heure_arrivee - b.heure_arrivee);

    // Prendre premier de chaque quais
    const quais = QuaiService.getAll();
    let enregistrementQuaiMap = new Map();

    for (let i = 0; i < enregistrementsQuai.length; i++) {
      const objet = enregistrementsQuai[i];
      // ajoute une paire clé valeur numéro quai et enregistrement
      if (!enregistrementQuaiMap.has(objet.quai)) {
        enregistrementQuaiMap.set(objet.quai, objet);
      }
      // arrete la boucle for
      if (enregistrementQuaiMap.size == quais.length) {
        break;
      }
    }
    enregistrementsQuai = Array.from(enregistrementQuaiMap.values());
    const objetJs = {};
    for (let i = 0; i < quais.length; i++) {
      // Utilisation de la notation par crochets pour définir les clés dynamiquement
      const e = enregistrementsQuai.find(ligne => ligne.quai == quais[i].idDock);

      objetJs[quais[i].idDock] = {
        etat: quais[i].stateDock,
        enregistrement: (e && typeof e.toJSON === 'function') ? e.toJSON() : (e || null)
      };
    }
    return {
      attente: enregistrementsAttente.map(item => item.toJSON()),
      quai: objetJs
    };
  }

  // Fonction pour modifier un enregistrement
  static modifierEnregistrement(enregistrement, anomalie = []) {

    const idValide = enregistrement.id;

    if (!idValide) {
      throw new Error("id obligatoire")
    }
    const resultat = EnregistrementService.verifValide(enregistrement, anomalie);
    if (resultat.valide) {

      let listeTransporteur = ParamsService.getTransporteurs();
      let listeClient = ParamsService.getClients();
      let nouveauClient = null;
      let nouveauTransporteur = null;

      if (!listeTransporteur.includes(enregistrement.transporteur.trim())) {
        nouveauTransporteur = enregistrement.transporteur.trim();
        ParamsService.ajouterDonnees("Transporteur", nouveauTransporteur);
      }

      if (!listeClient.includes(enregistrement.client.trim())) {
        nouveauClient = enregistrement.client.trim();
        ParamsService.ajouterDonnees("Client", nouveauClient);
      }

      EnregistrementRepository.modifierEnregistrement(enregistrement);
      LogService.logEnregistrement("MODIFICATION", enregistrement.id);

      return {
        success: true,
        transporteur: nouveauTransporteur,
        client: nouveauClient
      };

    } else {
      throw new Error(resultat.message);
    }
  }


  static supprimerEnregistrement(id) {
    // 1. Récupérer l'enregistrement existant en BDD pour extraire les URLs de documents
    const enregistrement = EnregistrementRepository.getById(id);

    if (enregistrement) {
      // 2. Suppression des documents Google Drive associés
      if (enregistrement.feuille_temperature_url) {
        TemperatureService.purgerTousLesDocuments(enregistrement.feuille_temperature_url);
      }
    }

    // 3. Suppression de toutes les anomalies associées
    AnomalieService.supprimerAnomaliesParEnregistrement(id);

    // 4. Suppression de l'enregistrement principal en BDD
    EnregistrementRepository.supprimerEnregistrement(id);
    LogService.logEnregistrement("SUPPRESSION", enregistrement.id);
  }


  static verifValide(enregistrement, anomalie = []) {

    // Vérification de la présence des champs obligatoires
    const dateValide = enregistrement.date instanceof Date;
    const transporteurValide = enregistrement.transporteur;
    const clientValide = enregistrement.client;

    if (!dateValide || !transporteurValide || !clientValide) {
      return { valide: false, message: "Date, transporteur et client sont obligatoires." };
    }


    //Vérification des heures

    // Fonction helper pour convertir en millisecondes (objets Date ou chaînes "HH:mm")
    const toMs = (h) => {
      if (!h) return null;
      if (h instanceof Date && !isNaN(h)) return h.getTime();
      if (typeof h === 'string' && h.includes(':')) {
        const [heures, minutes] = h.split(':').map(Number);
        return (heures * 3600 + minutes * 60) * 1000;
      }
      return null;
    };

    const heure_arrivee_valide = toMs(enregistrement?.heure_arrivee);
    const heure_pret_ch_valide = toMs(enregistrement?.heure_pret_ch);
    const heure_depart_valide = toMs(enregistrement?.heure_depart);

    if (heure_arrivee_valide && heure_pret_ch_valide) {
      if (heure_pret_ch_valide < heure_arrivee_valide) {
        return { valide: false, message: "L'heure d'arrivée doit être inférieure à l'heure prêt à charger." };
      }
    }
    if (heure_arrivee_valide && heure_depart_valide) {
      if (heure_depart_valide < heure_arrivee_valide) {
        return { valide: false, message: "L'heure de départ doit être supérieure à l'heure d'arrivée." };
      }
    }

    if (heure_pret_ch_valide && heure_depart_valide) {
      if (heure_depart_valide < heure_pret_ch_valide) {
        return { valide: false, message: "L'heure de départ doit être supérieure à l'heure prêt à charger." };
      }
    }

    if (anomalie.length > 0 && heure_depart_valide !== null) {
      // Si un départ est saisi, AUCUNE anomalie ne doit être encore en cours (sans date de fin)
      const anomalieNonTerminee = anomalie.some(a => !a.horodatage_fin);
      if (anomalieNonTerminee) {
        return {
          valide: false,
          message: "Clôturez toutes les anomalies (renseigner l'horodatage de fin) avant de valider l'heure de départ."
        };
      }
    }

    return { valide: true };
  }

  static modifierFeuilleTemperature(idEnregistrement, etat) {
    if (!idEnregistrement) {
      throw new Error("Id d'enregistrement obligatoire");
    }

    // Récupération de l'enregistrement existant en BDD
    const enregistrement = EnregistrementRepository.getById(idEnregistrement);
    if (!enregistrement) {
      throw new Error("Enregistrement introuvable");
    }
    // de la propriété concernée
    enregistrement.feuille_temperature_verifiee = Boolean(etat);

    // Mise à jour via le Repository
    EnregistrementRepository.modifierEnregistrement(enregistrement);
  }


  static updateUrlDocument(donneesEnregistrement, urlDocument, typeDocument) {
    if (!donneesEnregistrement || !donneesEnregistrement.id) {
      throw new Error("Objet enregistrement invalide.");
    }

    // Vérification que enregistrement est bien une instance
    const enregistrement = (donneesEnregistrement instanceof Enregistrement) ? donneesEnregistrement : new Enregistrement(donneesEnregistrement);

    // Lecture ou initialisation du tableau
    let docs = enregistrement.feuille_temperature_url ? JSON.parse(enregistrement.feuille_temperature_url) : [];

    // Ajout du nouvel objet si l'URL n'existe pas déjà
    if (!docs.some(d => d.url === urlDocument)) {
      docs.push({
        type: typeDocument,
        url: urlDocument
      });
    }

    enregistrement.feuille_temperature_url = JSON.stringify(docs);
    enregistrement.feuille_temperature_generee = true;

    // Écriture Google Sheets
    EnregistrementRepository.modifierEnregistrement(enregistrement);

    return enregistrement;
  }



  static supprimerUrl(docs, urlASupprimer) {
    if (!docs) return "";

    const docsJson = JSON.parse(docs)

    // On garde tous les documents sauf celui avec cette URL
    const docsFiltres = docsJson.filter(doc => doc.url !== urlASupprimer);

    return docsFiltres.length > 0 ? JSON.stringify(docsFiltres) : "";
  }

}


