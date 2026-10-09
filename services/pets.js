import { saveDataJson } from "../utils/saveDataJson.js";
import { $t, languageData } from "./translations.js";
import { getImageUrl } from "../constants.js";
import { getRarityColor } from "../utils/index.js";
import { state } from "./main.js";

// Every pet shares the same item definition. The pet type is stored in the
// "pet id" attribute (296) and points to an entry of pet_definitions; adult
// chickens also have a style, which picks a material group of the pet model.
const PET_ITEM_NAME = "pet";

// The game has no inventory images for chicks and chickens, so they are rendered
// from the models in the image tracker and named after the material they use.
const RENDERED_IMAGES_URL =
    "https://raw.githubusercontent.com/ByMykel/counter-strike-image-tracker/refs/heads/main/static/pets";

// Material used by each style, from the material groups of each pet model.
const PETS = {
    chicken_egg_01: { image_inventory: "econ/pets/chicken_egg" },
    chicken_chick_01: { material: "chick_yellow" },
    chicken_catalana_01: {
        breed: "Catalana",
        styles: {
            1: "chicken_catalan_tan",
            2: "chicken_catalan_black_white_head",
            3: "chicken_catalan_white",
            4: "chicken_catalan_yellow_and_red",
            5: "chicken_catalan_light_blue_and_red",
            6: "chicken_catalan_black_with_red_head",
            7: "chicken_catalan_blue",
            8: "chicken_catalan_dark_orange",
            9: "chicken_catalana_blue_and_light_orange",
            10: "chicken_catalan_orange_blue_neck",
            11: "chicken_catalan_yellow_red_gradient",
            12: "chicken_catalan_grey",
            13: "chicken_catalan_black",
        },
    },
    chicken_silkie_01: {
        breed: "Silkie",
        styles: {
            1: "chicken_silkie_white",
            2: "chicken_silkie_splash",
            3: "chicken_silkie_blue_with_red_beard",
            4: "chicken_silkie_leopard",
            5: "chicken_silkie_red",
            6: "chicken_silkie_red_beetle",
            7: "chicken_silkie_orange",
            8: "chicken_silkie_purple",
            9: "chicken_silkie_aqua_with_yellow",
        },
    },
    chicken_polish_01: {
        breed: "Polish",
        styles: {
            1: "chicken_polish_black_with_white_head",
            2: "chicken_polish_brown",
            3: "chicken_polish_white_with_black_wing_tips",
            4: "chicken_polish_brown_with_black_wing_tips",
            5: "chicken_polish_white_black_head_color",
            6: "chicken_polish_blue",
            7: "chicken_polish_green_with_red_head",
            8: "chicken_polish_green",
            9: "chicken_polish_pink",
            10: "chicken_polish_blue_yellow",
            11: "chicken_polish_orange_white_blue",
            12: "chicken_polish_orange_with_black_stripes",
        },
    },
};

const SMALL_WORDS = ["and", "with"];

// The game has no localized color names, so they come from the material name:
// "chicken_polish_white_with_black_wing_tips" -> "White with Black Wing Tips".
const getColor = material =>
    material
        .split("_")
        .slice(2)
        .filter((word, i, words) => !(word === "color" && i === words.length - 1))
        .map((word, i) =>
            i > 0 && SMALL_WORDS.includes(word) ? word : word[0].toUpperCase() + word.slice(1)
        )
        .join(" ");

const parseItem = (item, petItem, pet, style = null, material = pet.material) => {
    const { cdnImages } = state;
    const rarity = `rarity_${petItem.item_rarity}`;
    const name = $t(item.loc_name);
    const color = style !== null ? getColor(material) : null;

    const image = pet.image_inventory
        ? (cdnImages[pet.image_inventory] ?? getImageUrl(pet.image_inventory))
        : `${RENDERED_IMAGES_URL}/${material}.png`;

    return {
        id: style !== null ? `pet-${item.object_id}_${style}` : `pet-${item.object_id}`,
        pet_id: item.object_id,
        style,
        name: style !== null ? `${name} | ${pet.breed} (${color})` : name,
        description: $t(item.loc_description),
        breed: pet.breed ?? null,
        color,
        rarity: {
            id: rarity,
            name: $t(rarity),
            color: getRarityColor(rarity),
        },
        image,

        // Return original attributes from item_game.json
        original: {
            name: item.name,
            loc_name: item.loc_name,
            pedestal_display_model: item.pedestal_display_model,
            image_inventory: pet.image_inventory ?? null,
            material: material ?? null,
        },
    };
};

export const getPets = () => {
    const { itemsGame, items } = state;
    const { folder } = languageData;

    const petItem = items[PET_ITEM_NAME];
    const pets = Object.entries(itemsGame.pet_definitions ?? {})
        .filter(([, item]) => PETS[item.name])
        .flatMap(([key, item]) => {
            const pet = PETS[item.name];
            const definition = { ...item, object_id: key };

            if (!pet.styles) {
                return [parseItem(definition, petItem, pet)];
            }

            return Object.entries(pet.styles).map(([style, material]) =>
                parseItem(definition, petItem, pet, Number(style), material)
            );
        });

    saveDataJson(`./public/api/${folder}/pets.json`, pets);
};
