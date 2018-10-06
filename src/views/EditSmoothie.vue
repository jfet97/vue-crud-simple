<template>
    <div class="edit-smoothie container">
        <!-- finché firebase non ha risposto smoothie è null -->
        <!-- ma l'hook created termina e il componente viene montato -->
        <h2 v-if="smoothie" key="smoothieArrived">Edit {{ smoothie.title }} Smoothie </h2>
        <h2 v-else key="smoothieNotArrived">Edit a Smoothie </h2>
 
        <form @submit.prevent="editSmooothie">
            <div class="filed title">
                <label for="title">Smoothie Title:</label>
                <input type="text" name="title" v-model="smoothie.title"> <!-- !!! v-model su title -->
            </div>
            <div v-for="(ingredient, i) in smoothie.ingredients" :key="i" class="field">
                <label for="ingredient">Ingredient:</label>
                <input type="text" name="ingredient" v-model="smoothie.ingredients[i]">
                <i class="material-icons delete" @click="deleteIngredient(ingredient)">delete</i>
            </div>
            <div class="filed edit-ingredient">
                <label for="edit-ingredient">Add an ingredient, then press <b>tab</b> to insert another:</label>
                <input type="text" name="edit-ingredient" @keydown.tab.prevent="addIngredient" v-model="another">
            </div>
            <div class="filed center-align">
                <p v-if="feedback" class="red-text">{{ feedback }}</p>
                <button class="btn pink">Edit Smoothie</button>
            </div>
        </form>
    </div>
</template>

<script>
import db from "@/firebase/init.js";
import slugify from "slugify";

export default {
  name: "EditSmoothie",

  data() {
    return {
      smoothie: null,
      another: null,
      feedback: null
    };
  },

  created() {
    // non puoi rendere il lifecycle async
    // quindi il componente verrà creato e montato
    // e appena i dati saranno pronti verrà popolato

    // in index si usava il then della promise ritornata
    // dall'interrogazione di firebase, ma è la stessa cosa
    // l'hook terminava e quando la promise era pronta la cb del then modificava
    // opportunamente il componente

    let vm = this;

    (async function IIFE() {
      let ref = db
        .collection("smoothies")
        .where("slug", "==", vm.$route.params.smoothie_slug);

      try {
        let snapshot = await ref.get();

        // se avessi più documenti che corrispondono a where('slug', "==", vm.$route.params.smoothie_slug)
        // li ricevo tutti -> buona pratica sarebbe impedire il caricamento su firebase di due elementi con
        // slug uguale, ovviamente lato server

        snapshot.forEach(doc => {
          vm.smoothie = doc.data();
          vm.smoothie.id = doc.id;
        });
      } catch (err) {}
    })();
  },

  methods: {
    async editSmooothie() {
      if (this.smoothie.ingredients.length == 0) {
        this.feedback = "No ingredients inserted!";
        return;
      }

      this.smoothie.ingredients = this.smoothie.ingredients.map(el => el.trim());

      if (this.smoothie.ingredients.includes("")) {
        this.feedback = "One or more ingredients are blank!";
        return;
      }

      if (this.smoothie.title) {
        if (this.feedback) {
          // elimino il messaggio di errore se presente
          this.feedback = null;
        }

        // create a slug
        this.smoothie.slug = slugify(this.smoothie.title, {
          replacement: "-", // ogni spazio verrà rimpiazzato con un -
          remove: /[$*_+~/;.()'"!\-:@]/g, // toglie dallo slug eventuali caratter indesiderati presenti nel title
          lower: true // tutto lowercase
        });

        try {
          // connect to the database
          // modifico il doc con questo id precedentemente recuperato -> doc(this.smoothie.id)
          await db.collection("smoothies").doc(this.smoothie.id).update({
            title: this.smoothie.title,
            ingredients: this.smoothie.ingredients,
            slug: this.smoothie.slug,
          });
        } catch (err) {
          console.log(err);
        }

        // then, redirect to the home page
        this.$router.push({ name: "Index" });
      } else {
        this.feedback = "You must enter a smoothie title!";
      }
    },

    addIngredient() {
      if (this.another) {
        // se non è nullo e quindi l'utente ha premuto tab a vuoto
        this.smoothie.ingredients.push(this.another);
        this.another = null; // pulisco l'input

        if (this.feedback) {
          // elimino il messaggio di errore se presente
          this.feedback = null;
        }
      } else {
        this.feedback = "You must enter a value to add an ingredient!";
      }
    },

    deleteIngredient(ingredient) {
      this.smoothie.ingredients = this.smoothie.ingredients.filter(ing => {
        return ing != ingredient;
      });
    }
  }
};
</script>

<style>
.edit-smoothie {
  margin-top: 60px;
  padding: 20px;
  max-width: 500px;
}
.edit-smoothie h2 {
  font-size: 2em;
  margin: 20px auto;
}
.edit-smoothie .field {
  margin: 20px auto;
  position: relative;
}

.edit-smoothie .delete {
  position: absolute;
  right: 0;
  bottom: 16px;
  cursor: pointer;
  color: #aaa;
  font-size: 1.4em;
}
</style>
