function testVerifValide() {

  describe('EnregistrementService.verifValide()', () => {

    it('devrait valider une saisie avec les champs obligatoires', () => {
      const donnee = { date: new Date(), transporteur: "DFDS", client: "Cooperl" };
      const reponse = EnregistrementService.verifValide(donnee, []);
      expect(reponse.valide).toBe(true);
    });

    it('devrait refuser une saisie sans un champ obligatoire', () => {
      const donnee = { date: new Date(), client: "" };
      const reponse = EnregistrementService.verifValide(donnee, []);
      expect(reponse.valide).toBe(false);
    });

    it("devrait refuser une heure de prêt à charger antérieure à l'arrivée", () => {
      const donnee = {
        date: new Date(),
        transporteur: "DFDS",
        client: "Cooperl",
        heure_arrivee: "14:00",
        heure_pret_ch: "11:00"
      };
      const res = EnregistrementService.verifValide(donnee, []);
      expect(res.valide).toBe(false);
    });

    it("devrait refuser une heure de départ antérieure à l'arrivée", () => {
      const donnee = {date: new Date(),transporteur: "DFDS",client: "Cooperl",heure_arrivee: "14:00",heure_depart: "11:00"};
      const res = EnregistrementService.verifValide(donnee, []);
      expect(res.valide).toBe(false);
    });

    it("devrait refuser une heure de départ antérieure à l'heure pret à charger", () => {
      const donnee = {date: new Date(),transporteur: "DFDS",client: "Cooperl",heure_pret_ch: "14:00",heure_depart: "11:00"};
      const res = EnregistrementService.verifValide(donnee, []);
      expect(res.valide).toBe(false);
    });

    it('devrait bloquer le départ si une anomalie est toujours en cours', () => {
      const donnee = {
        date: new Date(),
        transporteur: "DFDS",
        client: "Cooperl",
        heure_arrivee: "08:00",
        heure_depart: "12:00"
      };
      const anomaliesEnCours = [{ horodatage_fin: null }];
      const res = EnregistrementService.verifValide(donnee, anomaliesEnCours);
      expect(res.valide).toBe(false);
    });

  });
}


function testModifierEnregistrement() {
  describe('EnregistrementService.modifierEnregistrement()', () => {

    it("devrait bloquer la modification si l'ID est manquant (sans toucher au Repository)", () => {
      // 1. Sauvegarde de la méthode originale
      const fonctionOriginale = EnregistrementRepository.modifierEnregistrement;
      let repositoryAppele = false;

      // 2. Monkey Patching du Repository
      EnregistrementRepository.modifierEnregistrement = function() {
        repositoryAppele = true;
      };

      try {
        const enregistrementSansId = new Enregistrement({
          date: new Date(),
          transporteur: "DFDS",
          client: "Cooperl"
        });
        enregistrementSansId.id = null; // ID absent

        let erreurLevee = false;
        let messageErreur = "";

        try {
          EnregistrementService.modifierEnregistrement(enregistrementSansId, []);
        } catch (err) {
          erreurLevee = true;
          messageErreur = err.message;
        }

        expect(erreurLevee).toBe(true);
        expect(messageErreur).toBe("id obligatoire");
        expect(repositoryAppele).toBe(false);

      } finally {
        // 3. Restauration systématique de la fonction d'origine
        EnregistrementRepository.modifierEnregistrement = fonctionOriginale;
      }
    });

    it("devrait refuser la modification si les règles métier échouent et ne pas appeler le Repository", () => {
      const fonctionOriginale = EnregistrementRepository.modifierEnregistrement;
      let repositoryAppele = false;

      EnregistrementRepository.modifierEnregistrement = function() {
        repositoryAppele = true;
      };

      try {
        const enregistrementInvalide = new Enregistrement({
          id: "REC_123",
          date: new Date(),
          transporteur: "DFDS",
          client: "Cooperl",
          heure_arrivee: "14:00",
          heure_depart: "10:00"
        });

        let erreurLevee = false;

        try {
          EnregistrementService.modifierEnregistrement(enregistrementInvalide, []);
        } catch (err) {
          erreurLevee = true;
        }

        expect(erreurLevee).toBe(true);
        expect(repositoryAppele).toBe(false);

      } finally {
        EnregistrementRepository.modifierEnregistrement = fonctionOriginale;
      }
    });

    it("devrait appeler le Repository avec les bonnes données lorsque tout est valide", () => {
      const fonctionOriginale = EnregistrementRepository.modifierEnregistrement;
      
      let repositoryAppele = false;
      let donneeRecueParRepo = null;

      EnregistrementRepository.modifierEnregistrement = function(enregistrement) {
        repositoryAppele = true;
        donneeRecueParRepo = enregistrement;
      };

      try {
        const enregistrementValide = new Enregistrement({
          id: "REC_123",
          date: new Date(),
          transporteur: "DFDS",
          client: "Cooperl",
          heure_arrivee: "08:00",
          heure_depart: "12:00"
        });

        let erreurLevee = false;

        try {
          EnregistrementService.modifierEnregistrement(enregistrementValide, []);
        } catch (err) {
          erreurLevee = true;
        }

        expect(erreurLevee).toBe(false);
        expect(repositoryAppele).toBe(true);
        expect(donneeRecueParRepo.id).toBe("REC_123");

      } finally {
        EnregistrementRepository.modifierEnregistrement = fonctionOriginale;
      }
    });

  });
}