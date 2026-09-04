/**
 * Guest reviews. Their own table in the database — a review belongs to a
 * property or an excursion by slug, not to a booking.
 *
 * As with the rest of the fixtures, `ab` falls back to the Russian text.
 */

import type { Localized, Review } from "@/lib/types";

function L(ru: string, en: string, ab?: string): Localized {
  return { ru, en, ab: ab ?? ru };
}

export const reviews: Review[] = [
  {
    id: "rev-01",
    subjectSlug: "ahmad-farm",
    author: "Ирина",
    date: "2026-08-14",
    rating: 5,
    booked: L("Кедровый дом", "Cedar House"),
    text: L(
      "Дом больше, чем на фотографиях. Терраса — лучшее место в доме, завтракали там каждое утро. До пляжа действительно минут пятнадцать, дорога вниз через сад. Ахмад оставлял инжир и виноград у двери, мы даже не сразу поняли, что это нам.",
      "The house is bigger than the photos suggest. The terrace is the best part of it — we had breakfast there every morning. It really is about fifteen minutes to the beach, downhill through the orchard. Ahmad left figs and grapes by the door; it took us a day to work out they were for us.",
    ),
    reply: L(
      "Спасибо, Ирина. Инжир в этом году удался — приезжайте в сентябре, будет ещё больше.",
      "Thank you, Irina. The figs did well this year — come in September and there will be more.",
    ),
  },
  {
    id: "rev-02",
    subjectSlug: "ahmad-farm",
    author: "Дмитрий и Катя",
    date: "2026-07-29",
    rating: 5,
    booked: L("Мандариновый дом", "Tangerine House"),
    text: L(
      "Брали на двоих, места хватило с запасом. Тихо, слышно только цикад. Единственное — дорога к дому грунтовая, на низкой машине аккуратнее.",
      "We took it for two and had space to spare. Quiet — you only hear cicadas. One thing: the track up to the house is unpaved, so take care in a low car.",
    ),
  },
  {
    id: "rev-03",
    subjectSlug: "ahmad-farm",
    author: "Sofia",
    date: "2026-06-11",
    rating: 4,
    booked: L("Речной дом", "River House"),
    text: L(
      "Маленький, но всё продумано. Кондиционера нет, в июне это было нормально, в августе, наверное, было бы жарко.",
      "Small, but everything is thought through. No air conditioning — fine in June, though I imagine August would be hot.",
    ),
  },
  {
    id: "rev-04",
    subjectSlug: "moaz-farm",
    author: "Елена",
    date: "2026-08-02",
    rating: 5,
    booked: L("Мансарда", "Attic Room"),
    text: L(
      "Завтраки у Наалы — отдельная причина сюда ехать. Мацони, мёд, яйца, всё своё. Астан отвёл нас к морю через лес и показал бухту, где мы были одни.",
      "Naala's breakfasts are a reason to come here on their own. Matsoni, honey, eggs, all their own. Astan walked us to the sea through the forest and showed us a cove where we had the water to ourselves.",
    ),
    reply: L(
      "Спасибо! Бухта работает, пока про неё не написали в интернете.",
      "Thank you! That cove works right up until someone writes about it on the internet.",
    ),
  },
  {
    id: "rev-05",
    subjectSlug: "moaz-farm",
    author: "Martin",
    date: "2026-07-18",
    rating: 5,
    booked: L("Садовая комната", "Garden Room"),
    text: L(
      "Отдельный вход из сада — то, что нужно, когда возвращаешься поздно. Цена за человека честная, ничего не добавили при отъезде.",
      "The separate garden entrance is exactly what you want when you come back late. The per-person price is honest — nothing was added at checkout.",
    ),
  },
  {
    id: "rev-06",
    subjectSlug: "moaz-farm",
    author: "Ольга",
    date: "2026-06-24",
    rating: 4,
    booked: L("Комната во флигеле", "Annexe Room"),
    text: L(
      "Санузел общий с соседней комнатой — нам не мешало, но стоит знать заранее. Всё остальное отлично.",
      "The bathroom is shared with the next room — it did not bother us, but it is worth knowing in advance. Everything else was excellent.",
    ),
  },
  {
    id: "rev-07",
    subjectSlug: "bzyb-orchard",
    author: "Георгий",
    date: "2026-08-20",
    rating: 5,
    booked: L("Ореховый дом", "Walnut House"),
    text: L(
      "Приехали компанией шесть человек, взяли оба дома. Двор общий, вечером жарили мясо у реки. Шум воды всю ночь — спится прекрасно.",
      "Six of us came and took both houses. The yard is shared; in the evening we cooked by the river. The sound of the water all night makes for very good sleep.",
    ),
  },
  {
    id: "rev-08",
    subjectSlug: "ritsa-gega-blue-lake",
    author: "Анна",
    date: "2026-08-09",
    rating: 5,
    text: L(
      "Ранний выезд себя оправдал: на Рице были почти одни, автобусы приехали, когда мы уже уезжали. Гегский водопад — по грунтовке, трясёт, но оно того стоит.",
      "The early start paid off: we had Ritsa almost to ourselves and the coaches arrived as we were leaving. The Gega waterfall is down a rough track — bumpy, but worth it.",
    ),
  },
  {
    id: "rev-09",
    subjectSlug: "ritsa-gega-blue-lake",
    author: "Павел",
    date: "2026-07-31",
    rating: 4,
    text: L(
      "День длинный, с маленькими детьми было бы тяжело. Водитель отличный, рассказывал всю дорогу.",
      "It is a long day; it would be hard with small children. The driver was excellent and talked the whole way.",
    ),
  },
  {
    id: "rev-10",
    subjectSlug: "new-athos",
    author: "Марина",
    date: "2026-08-05",
    rating: 5,
    text: L(
      "В пещере действительно холодно, кофту берите. Подъём к крепости несложный, вид на всё побережье.",
      "It really is cold in the cave — bring a layer. The climb to the fortress is easy and the view runs along the whole coast.",
    ),
  },
  {
    id: "rev-11",
    subjectSlug: "old-gagra",
    author: "Nino",
    date: "2026-07-12",
    rating: 5,
    text: L(
      "Три часа пролетели. Про принца Ольденбургского рассказывали так, что теперь хочу прочитать про него книгу.",
      "Three hours flew by. The story of Prince Oldenburg was told so well that I now want to read a book about him.",
    ),
  },
  {
    id: "rev-12",
    subjectSlug: "bzyb-rafting",
    author: "Сергей",
    date: "2026-08-17",
    rating: 5,
    text: L(
      "Первый раз на рафте, было совсем не страшно. Остановка на косе с купанием — лучшая часть.",
      "First time on a raft and it was not frightening at all. The stop at the sand spit for a swim was the best part.",
    ),
  },
];

export function reviewsFor(subjectSlug: string): Review[] {
  return reviews
    .filter((r) => r.subjectSlug === subjectSlug)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}
