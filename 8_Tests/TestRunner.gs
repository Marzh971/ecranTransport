function expect(obtenu) {
  return {
    toBe: (attendu) => {
      if (obtenu !== attendu) throw new Error(`Attendu : ${attendu} | Obtenu : ${obtenu}`);
    },

  };
}

function it(nomTest, fn) {
  try {
    fn();
    console.log(`  Réussite : ${nomTest}`);
  } catch (err) {
    console.error(`  Erreur : ${nomTest} -> ${err.message}`);
  }
}

function describe(nomBloc, fn) {
  console.log(`\n ${nomBloc}`);
  fn();
}