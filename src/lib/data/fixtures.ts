/**
 * Dummy content used to showcase the site before the real API is wired.
 *
 * Every entity here matches the shapes in `src/lib/types.ts`, which are also
 * what the API / Drizzle data source returns. To go live: keep these types,
 * point `DATA_SOURCE=api`, and fill the route handlers in `src/app/api`.
 *
 * NOTE ON LANGUAGES: `ab` (Abkhaz) strings currently fall back to the Russian
 * text — they are marked with `L(ru, en)` (no third arg). Hand these to an
 * Abkhaz translator; the i18n wiring already serves them at `/ab`.
 */

import type {
  Excursion,
  Localized,
  Property,
  Provision,
  RentalItem,
  Seller,
} from "@/lib/types";

/** localized-string helper: ab defaults to ru until translated */
function L(ru: string, en: string, ab?: string): Localized {
  return { ru, en, ab: ab ?? ru };
}

const RUB = (amount: number) => ({ amount, currency: "RUB" as const });

/** Real Abkhazia photography from /public/photos — see public/photos/CREDITS.md */
function pic(file: string, alt: Localized) {
  return { src: `/photos/${file}.jpg`, alt };
}

/* ================================================================== */
/* Hosts                                                               */
/* ================================================================== */

const hostAstan = {
  id: "host-astan",
  name: "Astan",
  since: 2016,
  about: L(
    "Астан вырос в Мюссере и знает каждую тропу от моря до реликтовой рощи. Держит гостевой дом вместе с женой Наалой, которая готовит завтраки из своих продуктов.",
    "Astan grew up in Mussera and knows every path from the sea to the relict grove. He runs the guest house with his wife Naala, who cooks breakfast from their own produce.",
  ),
  languages: ["Абхазский", "Русский", "English"],
  responseTimeHours: 2,
};

/* ================================================================== */
/* Stay — properties                                                   */
/* ================================================================== */

export const properties: Property[] = [
  {
    id: "prop-ahmad-farm",
    slug: "ahmad-farm",
    kind: "compound",
    name: L("Ферма Ахмада", "Ahmad Farm"),
    tagline: L(
      "Три отдельных дома на склоне над Цандрипшем — море в пятнадцати минутах пешком.",
      "Three separate houses on the hillside above Tsandripsh — the sea a fifteen-minute walk away.",
    ),
    story: L(
      "Ахмад посадил этот мандариновый сад в девяностых, а первый дом построил для своей семьи. Сейчас на участке три отдельно стоящих дома, у каждого своя терраса, вход и вид на воду. Вы снимаете дом целиком — с кухней, двором и местом под машину. Утром хозяева оставляют у двери корзину с фруктами и зеленью из сада.",
      "Ahmad planted this tangerine orchard in the nineties and built the first house for his family. Today the plot holds three free-standing houses, each with its own terrace, entrance and view of the water. You rent a whole house — kitchen, yard and a parking spot included. In the morning the hosts leave a basket of fruit and greens from the garden by your door.",
    ),
    location: {
      region: L("Гагрский район", "Gagra district"),
      area: L("Цандрипш", "Tsandripsh"),
      lat: 43.378,
      lng: 40.096,
    },
    photos: [
      pic("coast-hillside", L("Дом на склоне среди мандариновых деревьев", "House on the hillside among tangerine trees")),
      pic("gagra-beach", L("Терраса с видом на море", "Terrace overlooking the sea")),
      pic("boxwood-forest", L("Мандариновый сад", "Tangerine orchard")),
      pic("pitsunda-sea", L("Двор фермы", "Farm yard")),
    ],
    amenities: ["kitchen", "parking", "wifi", "washer", "terrace", "garden", "sea_view", "bbq"],
    highlights: [
      L("15 минут пешком до галечного пляжа", "15-minute walk to the pebble beach"),
      L("Каждый дом снимается целиком", "Each house is rented in full"),
      L("Фрукты и зелень из сада включены", "Fruit and greens from the garden included"),
      L("Место под машину у каждого дома", "A parking spot at every house"),
    ],
    checkIn: "14:00",
    checkOut: "11:00",
    houseRules: [
      L("Не курить внутри домов", "No smoking inside the houses"),
      L("Тихий час с 23:00 до 8:00", "Quiet hours 23:00–08:00"),
      L("Можно с домашними животными по договорённости", "Pets allowed by prior arrangement"),
    ],
    cancellation: {
      freeUntilDays: 7,
      note: L(
        "Бесплатная отмена за 7 дней до заезда. Позже — удерживается стоимость первой ночи.",
        "Free cancellation up to 7 days before arrival. After that the first night is charged.",
      ),
    },
    rating: 4.9,
    reviewCount: 37,
    units: [
      {
        id: "unit-ahmad-cedar",
        name: L("Кедровый дом", "Cedar House"),
        description: L(
          "Самый большой дом фермы: две спальни, большая кухня-гостиная и глубокая терраса под кедром.",
          "The largest house on the farm: two bedrooms, a big kitchen-living room and a deep terrace under a cedar.",
        ),
        guests: 5,
        bedrooms: 2,
        beds: 3,
        baths: 1,
        sizeSqm: 78,
        pricePerNight: RUB(6500),
        photos: [
          pic("boxwood-forest", L("Гостиная Кедрового дома", "Cedar House living room")),
          pic("coast-hillside", L("Спальня", "Bedroom")),
          pic("gagra-beach-wide", L("Терраса под кедром", "Terrace under the cedar")),
        ],
        amenities: ["kitchen", "parking", "wifi", "washer", "terrace", "sea_view", "bbq"],
      },
      {
        id: "unit-ahmad-tangerine",
        name: L("Мандариновый дом", "Tangerine House"),
        description: L(
          "Одна спальня плюс диван-кровать, окна выходят прямо в сад. Подходит для пары или небольшой семьи.",
          "One bedroom plus a sofa bed, windows opening straight into the orchard. Good for a couple or a small family.",
        ),
        guests: 3,
        bedrooms: 1,
        beds: 2,
        baths: 1,
        sizeSqm: 46,
        pricePerNight: RUB(4200),
        photos: [
          pic("coast-hillside", L("Спальня с видом в сад", "Bedroom facing the orchard")),
          pic("boxwood-forest", L("Кухня", "Kitchen")),
        ],
        amenities: ["kitchen", "parking", "wifi", "terrace", "garden"],
      },
      {
        id: "unit-ahmad-river",
        name: L("Речной дом", "River House"),
        description: L(
          "Небольшой дом в нижней части участка, ближе всего к тропе на пляж. Студия с кухонным углом и душем.",
          "A small house at the lower end of the plot, closest to the beach path. A studio with a kitchenette and a shower.",
        ),
        guests: 2,
        bedrooms: 1,
        beds: 1,
        baths: 1,
        sizeSqm: 32,
        pricePerNight: RUB(3400),
        photos: [
          pic("gagra-beach-wide", L("Студия Речного дома", "River House studio")),
          pic("gagra-beach", L("Крыльцо", "Porch")),
        ],
        amenities: ["kitchen", "parking", "wifi", "terrace"],
      },
    ],
  },

  {
    id: "prop-moaz-farm",
    slug: "moaz-farm",
    kind: "hosted",
    name: L("Ферма Моаз", "Moaz Farm"),
    tagline: L(
      "Гостевой дом в Мюссере: комнаты по числу гостей, завтрак и хозяин, который всё покажет.",
      "A guest house in Mussera: rooms priced per guest, breakfast, and a host who shows you around.",
    ),
    story: L(
      "Моаз — семейный гостевой дом на краю Мюссерского заповедника. Астан и Наала принимают гостей в отдельных комнатах основного дома и во флигеле. Цена — за человека, вместе с завтраком из своих яиц, молока и мёда. Астан водит гостей к морю через сосновый лес и подсказывает, куда съездить без толпы.",
      "Moaz is a family guest house on the edge of the Mussera reserve. Astan and Naala host guests in private rooms in the main house and the annexe. The price is per person and includes breakfast made with their own eggs, milk and honey. Astan walks guests to the sea through the pine forest and points you to the places without the crowds.",
    ),
    location: {
      region: L("Гудаутский район", "Gudauta district"),
      area: L("Мюссера", "Mussera"),
      lat: 43.18,
      lng: 40.42,
    },
    photos: [
      pic("mussera-ruins", L("Основной дом фермы Моаз", "The main house at Moaz Farm")),
      pic("boxwood-forest", L("Общая веранда с завтраком", "Shared veranda set for breakfast")),
      pic("athos-bay", L("Сосновый лес по дороге к морю", "Pine forest on the way to the sea")),
      pic("pitsunda-sea", L("Двор и огород", "Yard and vegetable garden")),
    ],
    amenities: ["breakfast", "parking", "wifi", "shared_kitchen", "garden", "host_guiding", "laundry_service"],
    highlights: [
      L("Завтрак из продуктов фермы включён", "Farm-produce breakfast included"),
      L("Хозяин провожает к морю через лес", "The host walks you to the sea through the forest"),
      L("Цена за человека, не за комнату", "Priced per person, not per room"),
      L("Трансфер от Гудауты по запросу", "Transfer from Gudauta on request"),
    ],
    checkIn: "13:00",
    checkOut: "11:00",
    houseRules: [
      L("Завтрак в общей веранде с 8:30 до 10:00", "Breakfast on the shared veranda 08:30–10:00"),
      L("Не курить в комнатах", "No smoking in the rooms"),
      L("Тихий час после 22:30", "Quiet hours after 22:30"),
    ],
    cancellation: {
      freeUntilDays: 5,
      note: L(
        "Бесплатная отмена за 5 дней до заезда.",
        "Free cancellation up to 5 days before arrival.",
      ),
    },
    rating: 4.8,
    reviewCount: 52,
    host: hostAstan,
    rooms: [
      {
        id: "room-moaz-garden",
        name: L("Садовая комната", "Garden Room"),
        description: L(
          "Комната в основном доме с отдельным входом из сада, двуспальная кровать, свой душ.",
          "A room in the main house with a separate garden entrance, a double bed and a private shower.",
        ),
        guestsPerRoom: 2,
        pricePerPerson: RUB(2200),
        quantity: 2,
        photos: [
          pic("boxwood-forest", L("Садовая комната", "Garden Room")),
          pic("mussera-ruins", L("Свой душ", "Private shower")),
        ],
        amenities: ["private_bath", "breakfast", "garden_entrance", "wifi", "ac"],
      },
      {
        id: "room-moaz-annexe",
        name: L("Комната во флигеле", "Annexe Room"),
        description: L(
          "Две односпальные кровати, общий санузел с одной соседней комнатой, тише всего вечером.",
          "Two single beds, a bathroom shared with one neighbouring room, quietest in the evening.",
        ),
        guestsPerRoom: 2,
        pricePerPerson: RUB(1700),
        quantity: 3,
        photos: [
          pic("mussera-ruins", L("Комната во флигеле", "Annexe Room")),
        ],
        amenities: ["shared_bath", "breakfast", "wifi", "fan"],
      },
      {
        id: "room-moaz-attic",
        name: L("Мансарда", "Attic Room"),
        description: L(
          "Большая комната под крышей основного дома, до трёх гостей, вид на море из окна.",
          "A large room under the roof of the main house, up to three guests, a sea view from the window.",
        ),
        guestsPerRoom: 3,
        pricePerPerson: RUB(2000),
        quantity: 1,
        photos: [
          pic("athos-bay", L("Мансарда с видом на море", "Attic room with a sea view")),
          pic("pitsunda-sea", L("Уголок для чтения", "Reading corner")),
        ],
        amenities: ["private_bath", "breakfast", "sea_view", "wifi"],
      },
    ],
  },

  {
    id: "prop-bzyb-orchard",
    slug: "bzyb-orchard",
    kind: "compound",
    name: L("Сад на Бзыби", "Bzyb Orchard"),
    tagline: L(
      "Два дома у реки между Пицундой и Рицей — база для поездок в горы.",
      "Two houses by the river between Pitsunda and Ritsa — a base for trips into the mountains.",
    ),
    story: L(
      "Участок стоит на правом берегу Бзыби, там где долина ещё широкая. Два дома делят общий двор с большим орехом и выходом к воде. Отсюда полчаса до пляжей Пицунды и час до озера Рица, а вечером слышно только реку.",
      "The plot sits on the right bank of the Bzyb where the valley is still wide. Two houses share a yard with a big walnut tree and a path to the water. It is half an hour to the Pitsunda beaches and an hour to Lake Ritsa, and in the evening all you hear is the river.",
    ),
    location: {
      region: L("Гагрский район", "Gagra district"),
      area: L("Бзыпта", "Bzypta"),
      lat: 43.24,
      lng: 40.33,
    },
    photos: [
      pic("bzyb-river", L("Дома у реки Бзыбь", "Houses by the Bzyb river")),
      pic("boxwood-forest", L("Общий двор с орехом", "Shared yard with a walnut tree")),
      pic("blue-lake", L("Река Бзыбь", "The Bzyb river")),
    ],
    amenities: ["kitchen", "parking", "wifi", "river_access", "garden", "bbq", "washer"],
    highlights: [
      L("Выход к реке с общего двора", "River access from the shared yard"),
      L("30 минут до Пицунды, час до Рицы", "30 minutes to Pitsunda, an hour to Ritsa"),
      L("Оба дома можно снять вместе для большой компании", "Both houses can be booked together for a group"),
    ],
    checkIn: "15:00",
    checkOut: "12:00",
    houseRules: [
      L("Костёр только в оборудованном очаге", "Fires only in the built fire pit"),
      L("Не оставлять детей у реки без присмотра", "Do not leave children unattended by the river"),
    ],
    cancellation: {
      freeUntilDays: 10,
      note: L(
        "Бесплатная отмена за 10 дней до заезда.",
        "Free cancellation up to 10 days before arrival.",
      ),
    },
    rating: 4.7,
    reviewCount: 19,
    units: [
      {
        id: "unit-bzyb-walnut",
        name: L("Ореховый дом", "Walnut House"),
        description: L(
          "Двухэтажный дом, три спальни, большая веранда над двором.",
          "A two-storey house, three bedrooms, a large veranda over the yard.",
        ),
        guests: 6,
        bedrooms: 3,
        beds: 4,
        baths: 2,
        sizeSqm: 96,
        pricePerNight: RUB(7200),
        photos: [
          pic("bzyb-river", L("Веранда Орехового дома", "Walnut House veranda")),
          pic("boxwood-forest", L("Спальня наверху", "Upstairs bedroom")),
        ],
        amenities: ["kitchen", "parking", "wifi", "washer", "terrace", "bbq", "river_access"],
      },
      {
        id: "unit-bzyb-willow",
        name: L("Ивовый дом", "Willow House"),
        description: L(
          "Одноэтажный дом ближе к воде, две спальни, крыльцо в тени ивы.",
          "A single-storey house nearer the water, two bedrooms, a porch in the shade of a willow.",
        ),
        guests: 4,
        bedrooms: 2,
        beds: 2,
        baths: 1,
        sizeSqm: 58,
        pricePerNight: RUB(5100),
        photos: [
          pic("boxwood-forest", L("Крыльцо Ивового дома", "Willow House porch")),
        ],
        amenities: ["kitchen", "parking", "wifi", "river_access", "garden"],
      },
    ],
  },
];

/* ================================================================== */
/* Village — sellers & provisions                                      */
/* ================================================================== */

export const sellers: Seller[] = [
  {
    id: "seller-ripa",
    slug: "ripa-dairy",
    name: L("Молочная семьи Рипа", "Ripa Family Dairy"),
    about: L(
      "Семья Рипа держит коров в Лыхны и делает мацони, сулугуни и масло по-старому, без заквасок из магазина.",
      "The Ripa family keeps cows in Lykhny and makes matsoni, sulguni and butter the old way, with no shop-bought cultures.",
    ),
    location: { region: L("Гудаутский район", "Gudauta district"), area: L("Лыхны", "Lykhny") },
  },
  {
    id: "seller-apiary",
    slug: "gagra-hills-apiary",
    name: L("Пасека на Гагрском хребте", "Gagra Hills Apiary"),
    about: L(
      "Кочевая пасека: весной — в ущельях на каштане, летом — на субальпийском разнотравье над Гагрой.",
      "A migratory apiary: chestnut blossom in the gorges in spring, subalpine meadows above Gagra in summer.",
    ),
    location: { region: L("Гагрский район", "Gagra district"), area: L("Гагра", "Gagra") },
  },
  {
    id: "seller-garden",
    slug: "tsandripsh-garden",
    name: L("Сад в Цандрипше", "Tsandripsh Garden"),
    about: L(
      "Приусадебный сад у моря: куры на выгуле, мандарины, фейхоа и грецкий орех.",
      "A seaside kitchen garden: free-range hens, tangerines, feijoa and walnuts.",
    ),
    location: { region: L("Гагрский район", "Gagra district"), area: L("Цандрипш", "Tsandripsh") },
  },
];

export const provisions: Provision[] = [
  {
    id: "prov-milk",
    slug: "fresh-cow-milk",
    sellerId: "seller-ripa",
    category: "dairy",
    name: L("Молоко коровье", "Cow's milk"),
    description: L(
      "Утренняя дойка, непастеризованное. Разливаем в вашу тару или в стеклянную бутылку с возвратом.",
      "From the morning milking, unpasteurised. Poured into your own container or a returnable glass bottle.",
    ),
    unitLabel: L("1 литр", "1 litre"),
    price: RUB(150),
    inStock: true,
    photos: [],
    deliveryNote: L(
      "Доставка к месту проживания по средам и субботам до полудня.",
      "Delivered to your accommodation Wednesday and Saturday before noon.",
    ),
  },
  {
    id: "prov-matsoni",
    slug: "matsoni-yogurt",
    sellerId: "seller-ripa",
    category: "dairy",
    name: L("Мацони", "Matsoni"),
    description: L(
      "Кисломолочный продукт из цельного молока, густой, слегка терпкий. Отлично на завтрак с мёдом.",
      "A cultured product from whole milk — thick and slightly tart. Excellent for breakfast with honey.",
    ),
    unitLabel: L("Банка 0,5 л", "0.5 L jar"),
    price: RUB(180),
    inStock: true,
    photos: [],
    deliveryNote: L(
      "Доставка по средам и субботам.",
      "Delivered Wednesday and Saturday.",
    ),
  },
  {
    id: "prov-sulguni",
    slug: "sulguni-cheese",
    sellerId: "seller-ripa",
    category: "dairy",
    name: L("Сулугуни", "Sulguni cheese"),
    description: L(
      "Рассольный сыр, косичка или круг. Молодой — мягкий, выдержанный — плотнее и солонее.",
      "A brined cheese, braided or in a round. Young it is soft; aged it is firmer and saltier.",
    ),
    unitLabel: L("около 500 г", "about 500 g"),
    price: RUB(550),
    inStock: true,
    photos: [],
    deliveryNote: L("Доставка по средам и субботам.", "Delivered Wednesday and Saturday."),
  },
  {
    id: "prov-chestnut-honey",
    slug: "chestnut-honey",
    sellerId: "seller-apiary",
    category: "honey",
    name: L("Каштановый мёд", "Chestnut honey"),
    description: L(
      "Тёмный, с лёгкой горчинкой, почти не кристаллизуется. Сбор в ущельях Гагрского хребта.",
      "Dark, faintly bitter, slow to crystallise. Gathered in the gorges of the Gagra range.",
    ),
    unitLabel: L("Банка 1 кг", "1 kg jar"),
    price: RUB(900),
    inStock: true,
    photos: [],
    deliveryNote: L(
      "Доставка в течение двух дней после заказа.",
      "Delivered within two days of ordering.",
    ),
  },
  {
    id: "prov-mountain-honey",
    slug: "mountain-honey",
    sellerId: "seller-apiary",
    category: "honey",
    name: L("Горный мёд", "Mountain honey"),
    description: L(
      "Разнотравье с субальпийских лугов, светлый, густой аромат. Кристаллизуется мелко.",
      "Wildflower honey from the subalpine meadows — light, strongly aromatic, with a fine crystal.",
    ),
    unitLabel: L("Банка 1 кг", "1 kg jar"),
    price: RUB(850),
    inStock: false,
    photos: [],
    deliveryNote: L(
      "Новый сбор в конце июля — оставьте заявку.",
      "New harvest at the end of July — leave a request.",
    ),
  },
  {
    id: "prov-eggs",
    slug: "free-range-eggs",
    sellerId: "seller-garden",
    category: "eggs",
    name: L("Яйца домашние", "Free-range eggs"),
    description: L(
      "Куры гуляют по саду, питаются зеленью и зерном. Желток яркий, скорлупа разного цвета.",
      "Hens roam the garden on greens and grain. Bright yolks, mixed shell colours.",
    ),
    unitLabel: L("10 штук", "10 eggs"),
    price: RUB(160),
    inStock: true,
    photos: [],
    deliveryNote: L(
      "Доставка ежедневно, кроме воскресенья.",
      "Delivered daily except Sunday.",
    ),
  },
  {
    id: "prov-tangerines",
    slug: "tangerines",
    sellerId: "seller-garden",
    category: "produce",
    name: L("Мандарины", "Tangerines"),
    description: L(
      "Абхазские мандарины прямо с дерева, в сезон с ноября по январь. Тонкая кожура, кисло-сладкие.",
      "Abkhaz tangerines straight off the tree, in season November to January. Thin-skinned, sweet-sharp.",
    ),
    unitLabel: L("Ящик 5 кг", "5 kg box"),
    price: RUB(500),
    inStock: false,
    photos: [],
    deliveryNote: L(
      "Сезон с ноября. Сейчас можно оставить заявку на осень.",
      "Season starts in November. You can leave a request for autumn now.",
    ),
  },
  {
    id: "prov-feijoa",
    slug: "feijoa",
    sellerId: "seller-garden",
    category: "produce",
    name: L("Фейхоа", "Feijoa"),
    description: L(
      "Осенний урожай, собираем спелыми. Едят ложкой или крутят с сахаром без варки.",
      "Autumn harvest, picked ripe. Eaten with a spoon, or blended raw with sugar.",
    ),
    unitLabel: L("1 кг", "1 kg"),
    price: RUB(400),
    inStock: false,
    photos: [],
    deliveryNote: L("Сезон с октября.", "Season starts in October."),
  },
  {
    id: "prov-walnuts",
    slug: "walnuts",
    sellerId: "seller-garden",
    category: "produce",
    name: L("Грецкие орехи", "Walnuts"),
    description: L(
      "Прошлогодний урожай, очищенные ядра или в скорлупе.",
      "Last year's harvest, shelled halves or still in the shell.",
    ),
    unitLabel: L("500 г ядер", "500 g of kernels"),
    price: RUB(450),
    inStock: true,
    photos: [],
    deliveryNote: L("Доставка вместе с другими заказами.", "Delivered together with other orders."),
  },
  {
    id: "prov-adjika",
    slug: "adjika",
    sellerId: "seller-ripa",
    category: "preserves",
    name: L("Аджика", "Adjika"),
    description: L(
      "Острая паста из красного перца, чеснока и трав, растёртая на камне. Домашний рецепт семьи Рипа.",
      "A hot paste of red pepper, garlic and herbs, ground on a stone. The Ripa family recipe.",
    ),
    unitLabel: L("Банка 250 г", "250 g jar"),
    price: RUB(300),
    inStock: true,
    photos: [],
    deliveryNote: L("Доставка по средам и субботам.", "Delivered Wednesday and Saturday."),
  },
];

/* ================================================================== */
/* Rent — daily gear & vehicles                                        */
/* ================================================================== */

export const rentals: RentalItem[] = [
  {
    id: "rent-rav4",
    slug: "toyota-rav4",
    category: "car",
    name: L("Toyota RAV4", "Toyota RAV4"),
    description: L(
      "Полный привод, дорожный просвет для грунтовки на Рицу и в горные сёла. Автомат, кондиционер.",
      "All-wheel drive with the clearance for the Ritsa gravel road and the mountain villages. Automatic, air conditioning.",
    ),
    pricePerDay: RUB(4500),
    deposit: RUB(15000),
    quantity: 2,
    delivery: true,
    pickupPoint: L("Цандрипш, у рынка; либо подвоз к жилью", "Tsandripsh, by the market; or delivery to your stay"),
    photos: [],
    specs: [
      { label: L("Коробка", "Transmission"), value: L("Автомат", "Automatic") },
      { label: L("Привод", "Drivetrain"), value: L("Полный", "All-wheel") },
      { label: L("Мест", "Seats"), value: L("5", "5") },
      { label: L("Залог", "Deposit"), value: L("15 000 ₽", "15,000 ₽") },
    ],
  },
  {
    id: "rent-niva",
    slug: "lada-niva",
    category: "car",
    name: L("Lada Niva 4x4", "Lada Niva 4x4"),
    description: L(
      "Простая и проходимая. Механика, без кондиционера, но проедет там, где RAV4 уже жалко.",
      "Simple and capable. Manual, no air conditioning, but it goes where you would not want to take the RAV4.",
    ),
    pricePerDay: RUB(2800),
    deposit: RUB(8000),
    quantity: 1,
    delivery: true,
    pickupPoint: L("Цандрипш, у рынка", "Tsandripsh, by the market"),
    photos: [],
    specs: [
      { label: L("Коробка", "Transmission"), value: L("Механика", "Manual") },
      { label: L("Привод", "Drivetrain"), value: L("Полный", "All-wheel") },
      { label: L("Мест", "Seats"), value: L("4", "4") },
      { label: L("Залог", "Deposit"), value: L("8 000 ₽", "8,000 ₽") },
    ],
  },
  {
    id: "rent-sup",
    slug: "sup-board",
    category: "water",
    name: L("SUP-доска", "SUP board"),
    description: L(
      "Надувная доска с веслом, насосом и страховочным лишем. Выдаём с сумкой для переноски.",
      "An inflatable board with paddle, pump and a safety leash. Comes with a carry bag.",
    ),
    pricePerDay: RUB(800),
    deposit: RUB(3000),
    quantity: 6,
    delivery: true,
    pickupPoint: L("Пляж Цандрипша или подвоз", "Tsandripsh beach or delivery"),
    photos: [],
    specs: [
      { label: L("В комплекте", "Included"), value: L("Весло, насос, лиш", "Paddle, pump, leash") },
      { label: L("Нагрузка", "Max load"), value: L("120 кг", "120 kg") },
      { label: L("Залог", "Deposit"), value: L("3 000 ₽", "3,000 ₽") },
    ],
  },
  {
    id: "rent-kayak",
    slug: "sea-kayak",
    category: "water",
    name: L("Каяк двухместный", "Two-seat kayak"),
    description: L(
      "Устойчивый каяк для спокойного моря, два весла и два спасжилета.",
      "A stable kayak for calm sea, two paddles and two life vests.",
    ),
    pricePerDay: RUB(1200),
    deposit: RUB(4000),
    quantity: 2,
    delivery: false,
    pickupPoint: L("Пляж Цандрипша", "Tsandripsh beach"),
    photos: [],
    specs: [
      { label: L("Мест", "Seats"), value: L("2", "2") },
      { label: L("В комплекте", "Included"), value: L("2 весла, 2 жилета", "2 paddles, 2 vests") },
      { label: L("Залог", "Deposit"), value: L("4 000 ₽", "4,000 ₽") },
    ],
  },
  {
    id: "rent-beach-set",
    slug: "beach-lounger-set",
    category: "beach",
    name: L("Комплект: два лежака и зонт", "Set: two loungers and an umbrella"),
    description: L(
      "Складные лежаки и зонт с песочным анкером. Привозим утром, забираем вечером.",
      "Folding loungers and an umbrella with a sand anchor. Dropped off in the morning, collected in the evening.",
    ),
    pricePerDay: RUB(600),
    deposit: RUB(1000),
    quantity: 10,
    delivery: true,
    pickupPoint: L("Доставка на пляж", "Delivered to the beach"),
    photos: [],
    specs: [
      { label: L("В комплекте", "Included"), value: L("2 лежака, зонт, анкер", "2 loungers, umbrella, anchor") },
      { label: L("Залог", "Deposit"), value: L("1 000 ₽", "1,000 ₽") },
    ],
  },
  {
    id: "rent-beach-table",
    slug: "folding-beach-table",
    category: "beach",
    name: L("Складной стол", "Folding table"),
    description: L(
      "Низкий алюминиевый стол для пикника на пляже или во дворе.",
      "A low aluminium table for a picnic on the beach or in the yard.",
    ),
    pricePerDay: RUB(200),
    deposit: RUB(500),
    quantity: 8,
    delivery: true,
    pickupPoint: L("Доставка", "Delivered"),
    photos: [],
    specs: [
      { label: L("Размер", "Size"), value: L("90 × 60 см", "90 × 60 cm") },
      { label: L("Залог", "Deposit"), value: L("500 ₽", "500 ₽") },
    ],
  },
  {
    id: "rent-tent",
    slug: "two-person-tent-kit",
    category: "camping",
    name: L("Палатка на двоих + коврики", "Two-person tent + mats"),
    description: L(
      "Комплект для ночёвки в горах: палатка, два коврика, два спальника до +5 °C.",
      "A kit for a night in the mountains: tent, two mats, two sleeping bags rated to +5 °C.",
    ),
    pricePerDay: RUB(700),
    deposit: RUB(3000),
    quantity: 3,
    delivery: false,
    pickupPoint: L("Цандрипш, у рынка", "Tsandripsh, by the market"),
    photos: [],
    specs: [
      { label: L("Вместимость", "Capacity"), value: L("2 человека", "2 people") },
      { label: L("В комплекте", "Included"), value: L("2 коврика, 2 спальника", "2 mats, 2 bags") },
      { label: L("Залог", "Deposit"), value: L("3 000 ₽", "3,000 ₽") },
    ],
  },
  {
    id: "rent-ebike",
    slug: "e-bike",
    category: "bike",
    name: L("Электровелосипед", "E-bike"),
    description: L(
      "Помогает на подъёмах прибрежной дороги. Запас хода около 60 км, замок и шлем в комплекте.",
      "Takes the sting out of the coast-road climbs. Around 60 km of range, lock and helmet included.",
    ),
    pricePerDay: RUB(1500),
    deposit: RUB(6000),
    quantity: 4,
    delivery: true,
    pickupPoint: L("Цандрипш или подвоз к жилью", "Tsandripsh or delivery to your stay"),
    photos: [],
    specs: [
      { label: L("Запас хода", "Range"), value: L("~60 км", "~60 km") },
      { label: L("В комплекте", "Included"), value: L("Замок, шлем", "Lock, helmet") },
      { label: L("Залог", "Deposit"), value: L("6 000 ₽", "6,000 ₽") },
    ],
  },
];

/* ================================================================== */
/* Explore — excursions                                                */
/* ================================================================== */

export const excursions: Excursion[] = [
  {
    id: "exc-ritsa",
    slug: "ritsa-gega-blue-lake",
    name: L("Озеро Рица, Гегский водопад и Голубое озеро", "Lake Ritsa, Gega Waterfall and the Blue Lake"),
    summary: L(
      "Целый день в Рицинском парке: серпантин вдоль Бзыби, водопады и озеро на высоте 950 м.",
      "A full day in the Ritsa park: the Bzyb canyon road, waterfalls and a lake at 950 m.",
    ),
    description: L(
      "Выезжаем рано, чтобы попасть к Рице до автобусов. По дороге — Голубое озеро, Юпшарский каньон и «Каменный мешок», сворот к Гегскому водопаду по грунтовке (нужна полноприводная машина). На Рице — час на прогулку и обед у воды. Обратно заезжаем на дачу Сталина, если остаётся время.",
      "We leave early to reach Ritsa before the coaches. On the way: the Blue Lake, the Yupshara canyon and its narrows, and the gravel turn-off to the Gega waterfall (a 4x4 is needed). At Ritsa there is an hour to walk and lunch by the water. On the way back we stop at Stalin's dacha if time allows.",
    ),
    durationHours: 9,
    pricePerPerson: RUB(3500),
    groupMax: 6,
    schedule: L("Ежедневно, выезд в 8:00", "Daily, departure at 08:00"),
    meetingPoint: L("От вашего жилья в Гагрском районе", "Pick-up from your stay in the Gagra district"),
    photos: [
      pic("ritsa-lake", L("Озеро Рица", "Lake Ritsa")),
      pic("ritsa-shore", L("Гегский водопад", "The Gega waterfall")),
      pic("bzyb-river", L("Юпшарский каньон", "The Yupshara canyon")),
    ],
    includes: [
      L("Трансфер на полноприводной машине", "Transfer in a 4x4"),
      L("Экологический сбор парка", "Park entry fee"),
      L("Сопровождение водителя-гида", "A driver-guide with you"),
    ],
    highlights: [
      L("Гегский водопад — съёмки «Шерлока Холмса»", "The Gega waterfall — a Sherlock Holmes filming location"),
      L("Обед у воды на Рице", "Lunch by the water at Ritsa"),
      L("Меньше людей за счёт раннего выезда", "Fewer people thanks to the early start"),
    ],
  },
  {
    id: "exc-new-athos",
    slug: "new-athos",
    name: L("Новый Афон: монастырь, пещера и крепость", "New Athos: monastery, cave and fortress"),
    summary: L(
      "Полдня в Новом Афоне: Симоно-Кананитский монастырь, пещера и подъём к Анакопийской крепости.",
      "Half a day in New Athos: the monastery, the cave and the climb to the Anakopia fortress.",
    ),
    description: L(
      "Начинаем с монастыря и рукотворного водопада, спускаемся к пещере (входим по расписанию, внутри прохладно — возьмите кофту). После обеда — подъём к Анакопийской крепости за видом на всё побережье. Приморский парк с лебедями — по желанию в конце.",
      "We start at the monastery and the man-made waterfall, then go down to the cave (timed entry, it is cold inside — bring a layer). After lunch, the climb to the Anakopia fortress for the view along the whole coast. The seaside park with its swans is optional at the end.",
    ),
    durationHours: 5,
    pricePerPerson: RUB(2200),
    groupMax: 8,
    schedule: L("Вторник, четверг, суббота, выезд в 9:00", "Tuesday, Thursday, Saturday, departure at 09:00"),
    meetingPoint: L("От вашего жилья", "Pick-up from your stay"),
    photos: [
      pic("athos-monastery", L("Новоафонский монастырь", "The New Athos monastery")),
      pic("athos-cave", L("Новоафонская пещера", "The New Athos cave")),
      pic("anacopia", L("Анакопийская крепость", "The Anakopia fortress")),
    ],
    includes: [
      L("Трансфер", "Transfer"),
      L("Билет в пещеру", "Cave ticket"),
      L("Сопровождение гида", "A guide with you"),
    ],
    highlights: [
      L("Поезд по пещере", "The little train through the cave"),
      L("Вид с башни крепости", "The view from the fortress tower"),
    ],
  },
  {
    id: "exc-gagra",
    slug: "old-gagra",
    name: L("Старая Гагра пешком", "Old Gagra on foot"),
    summary: L(
      "Неспешная прогулка по Старой Гагре: колоннада, ресторан «Гагрипш», парк принца Ольденбургского и ущелье Жоэквара.",
      "An unhurried walk through Old Gagra: the colonnade, the Gagripsh restaurant, Prince Oldenburg's park and the Zhoekvara gorge.",
    ),
    description: L(
      "Три часа пешком с рассказом о том, как Гагра стала курортом при принце Ольденбургском. Проходим колоннаду, приморский парк с субтропиками, поднимаемся к замку и заканчиваем у входа в ущелье Жоэквара. Кофе в «Гагрипше» — по желанию.",
      "Three hours on foot with the story of how Gagra became a resort under Prince Oldenburg. We walk the colonnade and the subtropical seaside park, climb to the castle and finish at the mouth of the Zhoekvara gorge. Coffee at the Gagripsh is optional.",
    ),
    durationHours: 3,
    pricePerPerson: RUB(1500),
    groupMax: 10,
    schedule: L("Понедельник и пятница, 10:00", "Monday and Friday, 10:00"),
    meetingPoint: L("У колоннады в Гагре", "At the colonnade in Gagra"),
    photos: [
      pic("gagra-colonnade", L("Гагрская колоннада", "The Gagra colonnade")),
      pic("gagripsh", L("Ресторан «Гагрипш»", "The Gagripsh restaurant")),
      pic("gagra-beach", L("Приморский парк", "The seaside park")),
    ],
    includes: [
      L("Пешеходная экскурсия с гидом", "A guided walking tour"),
    ],
    highlights: [
      L("История Приморского парка", "The history of the seaside park"),
      L("Панорама с замка принца Ольденбургского", "The panorama from Prince Oldenburg's castle"),
    ],
  },
  {
    id: "exc-bzyb-raft",
    slug: "bzyb-rafting",
    name: L("Сплав по Бзыби", "Rafting the Bzyb"),
    summary: L(
      "Полдня на воде: сплав по нижнему участку Бзыби, подходит для новичков с 12 лет.",
      "Half a day on the water: the lower Bzyb, suitable for beginners aged 12 and up.",
    ),
    description: L(
      "Инструктаж на берегу, снаряжение выдаём. Маршрут по нижнему течению без сложных порогов, с остановкой на песчаной косе. Сухую одежду и полотенце берите с собой, всё остальное — наше.",
      "A briefing on the bank, gear provided. The route follows the lower river with no serious rapids and a stop on a sand spit. Bring dry clothes and a towel; everything else is ours.",
    ),
    durationHours: 4,
    pricePerPerson: RUB(2600),
    groupMax: 8,
    schedule: L("Среда и воскресенье, 10:00 (май–сентябрь)", "Wednesday and Sunday, 10:00 (May–September)"),
    meetingPoint: L("Мост через Бзыбь", "The bridge over the Bzyb"),
    photos: [
      pic("bzyb-river", L("Сплав по реке Бзыбь", "Rafting on the Bzyb")),
      pic("boxwood-forest", L("Остановка на косе", "A stop on the sand spit")),
    ],
    includes: [
      L("Снаряжение и гидрокостюм", "Gear and a wetsuit"),
      L("Инструктор на рафте", "An instructor on the raft"),
      L("Страховка", "Insurance"),
    ],
    highlights: [
      L("Подходит для первого раза", "Good for a first time"),
      L("Купание на песчаной косе", "A swim at the sand spit"),
    ],
  },
];
