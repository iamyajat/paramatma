/**
 * One-time sample content so pages, OG images, and the reading UI can be
 * tested before real content is entered through /admin. Safe to re-run —
 * everything is upserted by slug, never wiped.
 *
 * Usage: npm run seed
 */
import { config } from "dotenv";
config({ path: ".env.local" });

import mongoose from "mongoose";
import { connectToDatabase } from "../src/lib/db";
import { Deity } from "../src/models/Deity";
import { Work } from "../src/models/Work";
import { Segment, type SegmentKind } from "../src/models/Segment";
import { splitOnBlankLines } from "../src/lib/segment-parsing";
import type { ContentType } from "../src/lib/content-types";

interface DeitySeed {
  slug: string;
  name: { dev: string; en: string };
  aka: string[];
  description: string;
  order: number;
}

interface SegmentSeed {
  kind: SegmentKind;
  number?: number;
  text: { dev: string; en?: string };
  mantra?: { dev: string; en?: string };
  meaning?: string;
}

interface WorkSeed {
  slug: string;
  type: ContentType;
  title: { dev: string; en: string };
  deitySlug: string;
  description: string;
  segments: SegmentSeed[];
}

const deities: DeitySeed[] = [
  {
    slug: "ganesha",
    name: { dev: "गणेश", en: "Ganesha" },
    aka: ["Ganapati", "Vinayaka", "Gajanana"],
    description:
      "The elephant-headed remover of obstacles, invoked before all beginnings.",
    order: 1,
  },
  {
    slug: "vishnu",
    name: { dev: "विष्णु", en: "Vishnu" },
    aka: ["Narayana", "Hari"],
    description: "The preserver, who sustains the universe across the ages.",
    order: 2,
  },
];

const ashtottaraNames: [string, string, string, string][] = [
  // [name.dev, name.en, mantra.dev, mantra.en]
  ["गजानन", "Gajanana", "ॐ गजाननाय नमः", "Om Gajananaya Namaha"],
  ["गणाध्यक्ष", "Ganadhyaksha", "ॐ गणाध्यक्षाय नमः", "Om Ganadhyakshaya Namaha"],
  ["विघ्नराज", "Vighnaraja", "ॐ विघ्नराजाय नमः", "Om Vighnarajaya Namaha"],
  ["विनायक", "Vinayaka", "ॐ विनायकाय नमः", "Om Vinayakaya Namaha"],
  ["द्विजप्रिय", "Dvijapriya", "ॐ द्विजप्रियाय नमः", "Om Dvijapriyaya Namaha"],
  ["अग्निगर्वच्छित्", "Agnigarvachhid", "ॐ अग्निगर्वच्छिदे नमः", "Om Agnigarvachhide Namaha"],
  ["इन्द्रश्रीप्रद", "Indrashriprada", "ॐ इन्द्रश्रीप्रदाय नमः", "Om Indrashripradaya Namaha"],
  ["वाणीप्रद", "Vaniprada", "ॐ वाणीप्रदाय नमः", "Om Vanipradaya Namaha"],
  ["सर्वसिद्धिप्रद", "Sarvasiddhiprada", "ॐ सर्वसिद्धिप्रदाय नमः", "Om Sarvasiddhipradaya Namaha"],
  ["अष्टसिद्धिप्रद", "Ashtasiddhiprada", "ॐ अष्टसिद्धिप्रदाय नमः", "Om Ashtasiddhipradaya Namaha"],
];

const ashtottaraMeanings = [
  "One with the face of an elephant.",
  "Lord and overseer of the ganas, Shiva's attendants.",
  "The king who removes obstacles.",
  "The remover of obstacles, foremost leader.",
  "Beloved of the twice-born, the learned and the devoted.",
  "Destroyer of the pride of Agni, the fire god.",
  "Bestower of Indra's prosperity.",
  "Bestower of speech and wisdom.",
  "Bestower of all accomplishments.",
  "Bestower of the eight great siddhis, or spiritual powers.",
];

const jaiGaneshAartiText = `जय गणेश जय गणेश जय गणेश देवा।
माता जाकी पार्वती पिता महादेवा॥

एक दंत दयावंत चार भुजा धारी।
माथे पर तिलक सोहे मूसे की सवारी॥
जय गणेश जय गणेश जय गणेश देवा।
माता जाकी पार्वती पिता महादेवा॥

पान चढ़े फूल चढ़े और चढ़े मेवा।
लड्डुअन का भोग लगे संत करें सेवा॥
जय गणेश जय गणेश जय गणेश देवा।
माता जाकी पार्वती पिता महादेवा॥

अंधन को आंख देत कोढ़िन को काया।
बांझन को पुत्र देत निर्धन को माया॥
जय गणेश जय गणेश जय गणेश देवा।
माता जाकी पार्वती पिता महादेवा॥

सूर श्याम शरण आए सफल कीजे सेवा।
माता जाकी पार्वती पिता महादेवा॥
जय गणेश जय गणेश जय गणेश देवा।
माता जाकी पार्वती पिता महादेवा॥`;

const works: WorkSeed[] = [
  {
    slug: "ganesha-ashtottara-shatanamavali",
    type: "ashtottara",
    title: { dev: "श्री गणेश अष्टोत्तरशतनामावली", en: "Ganesha Ashtottara Shatanamavali" },
    deitySlug: "ganesha",
    description:
      "108 sacred names of Lord Ganesha, chanted with 'Om' before and 'Namaha' after each name. Shown here as a 10-name sample.",
    segments: ashtottaraNames.map(([dev, en, mantraDev, mantraEn], i) => ({
      kind: "name" as SegmentKind,
      number: i + 1,
      text: { dev, en },
      mantra: { dev: mantraDev, en: mantraEn },
      meaning: ashtottaraMeanings[i],
    })),
  },
  {
    slug: "jai-ganesh-aarti",
    type: "aarti",
    title: { dev: "जय गणेश आरती", en: "Jai Ganesh Aarti" },
    deitySlug: "ganesha",
    description: "The most beloved aarti of Lord Ganesha, sung during his worship.",
    segments: splitOnBlankLines(jaiGaneshAartiText).map((dev, i) => ({
      kind: "stanza" as SegmentKind,
      number: i + 1,
      text: { dev },
    })),
  },
  {
    slug: "ganesha-stotra",
    type: "stotra",
    title: { dev: "गणेश स्तोत्र", en: "Ganesha Stotra" },
    deitySlug: "ganesha",
    description:
      "Verses invoking Lord Ganesha's blessing before beginning any auspicious task.",
    segments: [
      {
        kind: "verse",
        number: 1,
        text: {
          dev: "वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।\nनिर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥",
          en: "Vakratunda Mahakaya Suryakoti Samaprabha,\nNirvighnam Kuru Me Deva Sarva-kaaryeshu Sarvada",
        },
        meaning:
          "O Lord of the curved trunk and massive body, whose radiance equals a million suns, please make all my endeavors free of obstacles, always.",
      },
      {
        kind: "verse",
        number: 2,
        text: {
          dev: "शुक्लाम्बरधरं विष्णुं शशिवर्णं चतुर्भुजम्।\nप्रसन्नवदनं ध्यायेत् सर्वविघ्नोपशान्तये॥",
          en: "Shuklambaradharam Vishnum Shashivarnam Chaturbhujam,\nPrasannavadanam Dhyayet Sarva-vighnopashantaye",
        },
        meaning:
          "We meditate on the four-armed one, clad in white, moon-hued and serene-faced, for the quelling of all obstacles.",
      },
    ],
  },
  {
    slug: "vishnu-sahasranama",
    type: "sahasranama",
    title: { dev: "विष्णु सहस्रनाम", en: "Vishnu Sahasranama" },
    deitySlug: "vishnu",
    description:
      "The thousand names of Lord Vishnu. Shown here with its traditional opening invocation verse as a sample — the full 1,000 names can be added through the admin panel.",
    segments: [
      {
        kind: "verse",
        number: 1,
        text: {
          dev: "शान्ताकारं भुजगशयनं पद्मनाभं सुरेशं\nविश्वाधारं गगनसदृशं मेघवर्णं शुभाङ्गम्।\nलक्ष्मीकान्तं कमलनयनं योगिभिर्ध्यानगम्यं\nवन्दे विष्णुं भवभयहरं सर्वलोकैकनाथम्॥",
          en: "Shantakaram Bhujagashayanam Padmanabham Suresham,\nVishvadharam Gagana-sadrisham Meghavarnam Shubhangam,\nLakshmikantam Kamalanayanam Yogibhirdhyanagamyam,\nVande Vishnum Bhavabhayaharam Sarvalokaikanatham",
        },
        meaning:
          "I bow to Vishnu, of tranquil form, resting on the serpent-couch, lotus-naveled, lord of the celestials, support of the universe, vast as the sky, cloud-hued, of auspicious form, beloved of Lakshmi, lotus-eyed, reachable by yogis in meditation, remover of the fear of worldly existence, sole lord of all the worlds.",
      },
    ],
  },
];

async function upsertDeity(seed: DeitySeed) {
  const doc = await Deity.findOneAndUpdate(
    { slug: seed.slug },
    {
      $set: {
        name: seed.name,
        aka: seed.aka,
        description: seed.description,
        order: seed.order,
      },
    },
    { upsert: true, returnDocument: "after" }
  );
  return doc;
}

async function upsertWork(seed: WorkSeed, deityId: mongoose.Types.ObjectId) {
  const work = await Work.findOneAndUpdate(
    { slug: seed.slug },
    {
      $set: {
        type: seed.type,
        title: seed.title,
        deity: deityId,
        deitySlug: seed.deitySlug,
        description: seed.description,
        status: "published",
        segmentCount: seed.segments.length,
      },
    },
    { upsert: true, returnDocument: "after" }
  );

  await Segment.deleteMany({ work: work._id });
  await Segment.insertMany(
    seed.segments.map((s, i) => ({
      work: work._id,
      workSlug: work.slug,
      workType: work.type,
      deitySlug: work.deitySlug,
      order: i,
      number: s.number,
      kind: s.kind,
      text: s.text,
      mantra: s.mantra,
      meaning: s.meaning,
    }))
  );

  return work;
}

async function main() {
  await connectToDatabase();

  const deityIdBySlug = new Map<string, mongoose.Types.ObjectId>();
  for (const deitySeed of deities) {
    const doc = await upsertDeity(deitySeed);
    deityIdBySlug.set(deitySeed.slug, doc._id);
    console.log(`Deity ready: ${deitySeed.name.en}`);
  }

  for (const workSeed of works) {
    const deityId = deityIdBySlug.get(workSeed.deitySlug);
    if (!deityId) throw new Error(`Unknown deity slug: ${workSeed.deitySlug}`);
    await upsertWork(workSeed, deityId);
    console.log(
      `Work ready: ${workSeed.title.en} (${workSeed.segments.length} segments)`
    );
  }

  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
