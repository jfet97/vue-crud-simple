<template>
    <div class="add-smoothie container">
        <h2 class="center align indigo-text">Add new smoothie recipe</h2>
        <form @submit.prevent="addSmooothie">
            <div class="filed title">
                <label for="title">Smoothie Title:</label>
                <input type="text" name="title" v-model="title"> <!-- !!! v-model su title -->
            </div>
            <div v-for="(ingredient, i) in ingredients" :key="i" class="field">
                <label for="ingredient">Ingredient:</label>
                <input type="text" name="ingredient" v-model="ingredients[i]">
                <i class="material-icons delete" @click="deleteIngredient(ingredient)">delete</i>
            </div>
            <div class="filed add-ingredient">
                <label for="add-ingredient">Add an ingredient, then press <b>tab</b> to insert another:</label>
                <!--
                    niente v-model diretto perché non conosciamo il numero degli ingredienti 
                    che un utente potrebbe inserire
                    facciamo in modo che ad ogni tab premuto l'ingrediente scritto venga memorizzato
                    e l'input pulito
                    modificatore prevent per evitare che si sposti sul successivo campo di input: il bottone
                -->
                <input type="text" name="add-ingredient" @keydown.tab.prevent="addIngredient" v-model="another">
            </div>
            <div class="filed center-align">
                <p v-if="feedback" class="red-text">{{ feedback }}</p>
                <button class="btn pink">Add Smoothie</button>
            </div>
        </form>
    </div>
</template>

<script>
import db from "@/firebase/init.js";
import slugify from "slugify";

export default {
  name: "AddSmooothie",

  data() {
    return {
      title: null,
      another: null,
      ingredients: [],
      feedback: null,
      slug: null,
    };
  },

  methods: {
    async addSmooothie() {

      if (this.ingredients.length == 0) {
        this.feedback = "No ingredients inserted!";
        return;
      }

      this.ingredients = this.ingredients.map(el => el.trim());

      if (this.ingredients.includes("")) {
        this.feedback = "One or more ingredients are blank!";
        return;
      }

      if (this.title) {
        if (this.feedback) {
          // elimino il messaggio di errore se presente
          this.feedback = null;
        }

        // create a slug
        this.slug = slugify(this.title, {
          replacement: "-", // ogni spazio verrà rimpiazzato con un -
          remove: /[$*_+~/;.()'"!\-:@]/g, // toglie dallo slug eventuali caratter indesiderati presenti nel title
          lower: true // tutto lowercase
        });

        try {
          // connect to the database
          await db.collection("smoothies").add({
            title: this.title,
            ingredients: this.ingredients,
            slug: this.slug,
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
        this.ingredients.push(this.another);
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
      this.ingredients = this.ingredients.filter(ing => {
        return ing != ingredient;
      });
    },
  }
};
</script>

<style>
.add-smoothie {
  margin-top: 60px;
  padding: 20px;
  max-width: 500px;
}
.add-smoothie h2 {
  font-size: 2em;
  margin: 20px auto;
}
.add-smoothie .field {
  margin: 20px auto;
  position: relative;
}

.add-smoothie .delete {
  position: absolute;
  right: 0;
  bottom: 16px;
  cursor: pointer;
  color: #aaa;
  font-size: 1.4em;
}
</style>
