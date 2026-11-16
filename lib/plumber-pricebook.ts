// Generated from research-csvs/*-towns.csv — do not edit by hand.
// Regenerate: re-run the generator against the CSVs and re-parse the
// first $low-$high range in price_leak_detection, price_slab_detection
// and price_sewer_camera. Ranges are metro-typical researched prices,
// stored per town because a few towns differ within a metro (e.g. Austin
// and Houston). They are detection-only prices, NOT repair prices and
// NOT quotes — the tool page says so, and the estimator labels every
// output a planning estimate.
//
// Two cells needed a judgment call, recorded here so it is auditable:
// - Leander / Lakeway sewer: the CSV cell leads with Angi's broad Austin
//   sewer-cost range ($260-$1,700). The camera-only figure in the same
//   cell is $100-$600, so that is what is stored, with a note.
// - McAllen sewer ($575-$975): the CSV states this is main sewer line
//   hydrostatic testing, and that no Rio Grande Valley firm publishes a
//   standalone camera price. Stored as-is, with a note saying exactly that.
//   The tool shows the note wherever the McAllen sewer range appears.

export interface PlumberPriceTown {
  slug: string;
  town: string;
  metro: string;
  metroSlug: string;
  /** Researched local detection-only price range, low-high in dollars. */
  leak: [number, number];
  /** Researched local slab-leak detection price range. */
  slab: [number, number];
  /** Researched local sewer-camera price range (see sewerNote). */
  sewer: [number, number];
  /** Caveat on the sewer range, when the CSV cell carries one. */
  sewerNote?: string;
}

export const PLUMBER_PRICEBOOK: PlumberPriceTown[] = [
  { slug: 'amarillo', town: 'Amarillo', metro: 'Amarillo', metroSlug: 'amarillo', leak: [150, 400], slab: [150, 400], sewer: [100, 250] },
  { slug: 'borger', town: 'Borger', metro: 'Amarillo', metroSlug: 'amarillo', leak: [150, 400], slab: [150, 400], sewer: [100, 250] },
  { slug: 'canyon', town: 'Canyon', metro: 'Amarillo', metroSlug: 'amarillo', leak: [150, 400], slab: [150, 400], sewer: [100, 250] },
  { slug: 'dalhart', town: 'Dalhart', metro: 'Amarillo', metroSlug: 'amarillo', leak: [150, 400], slab: [150, 400], sewer: [100, 250] },
  { slug: 'dumas', town: 'Dumas', metro: 'Amarillo', metroSlug: 'amarillo', leak: [150, 400], slab: [150, 400], sewer: [100, 250] },
  { slug: 'fritch', town: 'Fritch', metro: 'Amarillo', metroSlug: 'amarillo', leak: [150, 400], slab: [150, 400], sewer: [100, 250] },
  { slug: 'hereford', town: 'Hereford', metro: 'Amarillo', metroSlug: 'amarillo', leak: [150, 400], slab: [150, 400], sewer: [100, 250] },
  { slug: 'pampa', town: 'Pampa', metro: 'Amarillo', metroSlug: 'amarillo', leak: [150, 400], slab: [150, 400], sewer: [100, 250] },
  { slug: 'perryton', town: 'Perryton', metro: 'Amarillo', metroSlug: 'amarillo', leak: [150, 400], slab: [150, 400], sewer: [100, 250] },
  { slug: 'tulia', town: 'Tulia', metro: 'Amarillo', metroSlug: 'amarillo', leak: [150, 400], slab: [150, 400], sewer: [100, 250] },
  { slug: 'buda', town: 'Buda', metro: 'Austin', metroSlug: 'austin', leak: [150, 500], slab: [150, 400], sewer: [150, 300] },
  { slug: 'cedar-park', town: 'Cedar Park', metro: 'Austin', metroSlug: 'austin', leak: [150, 400], slab: [150, 600], sewer: [150, 300] },
  { slug: 'dripping-springs', town: 'Dripping Springs', metro: 'Austin', metroSlug: 'austin', leak: [150, 500], slab: [150, 400], sewer: [125, 500] },
  { slug: 'georgetown', town: 'Georgetown', metro: 'Austin', metroSlug: 'austin', leak: [150, 500], slab: [150, 400], sewer: [125, 500] },
  { slug: 'kyle', town: 'Kyle', metro: 'Austin', metroSlug: 'austin', leak: [150, 500], slab: [150, 400], sewer: [150, 300] },
  { slug: 'lakeway', town: 'Lakeway', metro: 'Austin', metroSlug: 'austin', leak: [150, 400], slab: [150, 600], sewer: [100, 600], sewerNote: "Standard residential camera inspections $100-$600; Angi's wider Austin sewer-cost range is $260-$1,700." },
  { slug: 'leander', town: 'Leander', metro: 'Austin', metroSlug: 'austin', leak: [150, 400], slab: [150, 600], sewer: [100, 600], sewerNote: "Standard residential camera inspections $100-$600; Angi's wider Austin sewer-cost range is $260-$1,700." },
  { slug: 'pflugerville', town: 'Pflugerville', metro: 'Austin', metroSlug: 'austin', leak: [150, 500], slab: [150, 400], sewer: [125, 500] },
  { slug: 'round-rock', town: 'Round Rock', metro: 'Austin', metroSlug: 'austin', leak: [150, 400], slab: [150, 600], sewer: [150, 300] },
  { slug: 'san-marcos', town: 'San Marcos', metro: 'Austin', metroSlug: 'austin', leak: [150, 500], slab: [150, 400], sewer: [125, 500] },
  { slug: 'alice', town: 'Alice', metro: 'Corpus Christi', metroSlug: 'corpus-christi', leak: [180, 400], slab: [200, 450], sewer: [175, 350] },
  { slug: 'aransas-pass', town: 'Aransas Pass', metro: 'Corpus Christi', metroSlug: 'corpus-christi', leak: [180, 400], slab: [200, 450], sewer: [175, 350] },
  { slug: 'corpus-christi', town: 'Corpus Christi', metro: 'Corpus Christi', metroSlug: 'corpus-christi', leak: [180, 400], slab: [200, 450], sewer: [175, 350] },
  { slug: 'ingleside', town: 'Ingleside', metro: 'Corpus Christi', metroSlug: 'corpus-christi', leak: [180, 400], slab: [200, 450], sewer: [175, 350] },
  { slug: 'mathis', town: 'Mathis', metro: 'Corpus Christi', metroSlug: 'corpus-christi', leak: [180, 400], slab: [200, 450], sewer: [175, 350] },
  { slug: 'port-aransas', town: 'Port Aransas', metro: 'Corpus Christi', metroSlug: 'corpus-christi', leak: [180, 400], slab: [200, 450], sewer: [175, 350] },
  { slug: 'portland', town: 'Portland', metro: 'Corpus Christi', metroSlug: 'corpus-christi', leak: [180, 400], slab: [200, 450], sewer: [175, 350] },
  { slug: 'robstown', town: 'Robstown', metro: 'Corpus Christi', metroSlug: 'corpus-christi', leak: [180, 400], slab: [200, 450], sewer: [175, 350] },
  { slug: 'rockport', town: 'Rockport', metro: 'Corpus Christi', metroSlug: 'corpus-christi', leak: [180, 400], slab: [200, 450], sewer: [175, 350] },
  { slug: 'sinton', town: 'Sinton', metro: 'Corpus Christi', metroSlug: 'corpus-christi', leak: [180, 400], slab: [200, 450], sewer: [175, 350] },
  { slug: 'allen', town: 'Allen', metro: 'Dallas', metroSlug: 'dallas', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'carrollton', town: 'Carrollton', metro: 'Dallas', metroSlug: 'dallas', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'denton', town: 'Denton', metro: 'Dallas', metroSlug: 'dallas', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'frisco', town: 'Frisco', metro: 'Dallas', metroSlug: 'dallas', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'garland', town: 'Garland', metro: 'Dallas', metroSlug: 'dallas', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'irving', town: 'Irving', metro: 'Dallas', metroSlug: 'dallas', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'lewisville', town: 'Lewisville', metro: 'Dallas', metroSlug: 'dallas', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'mckinney', town: 'McKinney', metro: 'Dallas', metroSlug: 'dallas', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'plano', town: 'Plano', metro: 'Dallas', metroSlug: 'dallas', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'richardson', town: 'Richardson', metro: 'Dallas', metroSlug: 'dallas', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'anthony', town: 'Anthony', metro: 'El Paso', metroSlug: 'el-paso', leak: [129, 500], slab: [280, 950], sewer: [170, 730] },
  { slug: 'canutillo', town: 'Canutillo', metro: 'El Paso', metroSlug: 'el-paso', leak: [129, 500], slab: [280, 950], sewer: [170, 730] },
  { slug: 'clint', town: 'Clint', metro: 'El Paso', metroSlug: 'el-paso', leak: [129, 500], slab: [280, 950], sewer: [170, 730] },
  { slug: 'el-paso', town: 'El Paso', metro: 'El Paso', metroSlug: 'el-paso', leak: [129, 500], slab: [280, 950], sewer: [170, 730] },
  { slug: 'fabens', town: 'Fabens', metro: 'El Paso', metroSlug: 'el-paso', leak: [129, 500], slab: [280, 950], sewer: [170, 730] },
  { slug: 'horizon-city', town: 'Horizon City', metro: 'El Paso', metroSlug: 'el-paso', leak: [129, 500], slab: [280, 950], sewer: [170, 730] },
  { slug: 'san-elizario', town: 'San Elizario', metro: 'El Paso', metroSlug: 'el-paso', leak: [129, 500], slab: [280, 950], sewer: [170, 730] },
  { slug: 'socorro', town: 'Socorro', metro: 'El Paso', metroSlug: 'el-paso', leak: [129, 500], slab: [280, 950], sewer: [170, 730] },
  { slug: 'vinton', town: 'Vinton', metro: 'El Paso', metroSlug: 'el-paso', leak: [129, 500], slab: [280, 950], sewer: [170, 730] },
  { slug: 'westway', town: 'Westway', metro: 'El Paso', metroSlug: 'el-paso', leak: [129, 500], slab: [280, 950], sewer: [170, 730] },
  { slug: 'arlington', town: 'Arlington', metro: 'Fort Worth', metroSlug: 'fort-worth', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'bedford', town: 'Bedford', metro: 'Fort Worth', metroSlug: 'fort-worth', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'burleson', town: 'Burleson', metro: 'Fort Worth', metroSlug: 'fort-worth', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'euless', town: 'Euless', metro: 'Fort Worth', metroSlug: 'fort-worth', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'grand-prairie', town: 'Grand Prairie', metro: 'Fort Worth', metroSlug: 'fort-worth', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'grapevine', town: 'Grapevine', metro: 'Fort Worth', metroSlug: 'fort-worth', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'keller', town: 'Keller', metro: 'Fort Worth', metroSlug: 'fort-worth', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'mansfield', town: 'Mansfield', metro: 'Fort Worth', metroSlug: 'fort-worth', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'north-richland-hills', town: 'North Richland Hills', metro: 'Fort Worth', metroSlug: 'fort-worth', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'southlake', town: 'Southlake', metro: 'Fort Worth', metroSlug: 'fort-worth', leak: [250, 600], slab: [250, 600], sewer: [200, 500] },
  { slug: 'conroe', town: 'Conroe', metro: 'Houston', metroSlug: 'houston', leak: [150, 400], slab: [150, 500], sewer: [150, 500] },
  { slug: 'cypress', town: 'Cypress', metro: 'Houston', metroSlug: 'houston', leak: [125, 400], slab: [200, 500], sewer: [150, 500] },
  { slug: 'humble', town: 'Humble', metro: 'Houston', metroSlug: 'houston', leak: [125, 400], slab: [200, 500], sewer: [150, 500] },
  { slug: 'katy', town: 'Katy', metro: 'Houston', metroSlug: 'houston', leak: [150, 400], slab: [150, 400], sewer: [175, 350] },
  { slug: 'league-city', town: 'League City', metro: 'Houston', metroSlug: 'houston', leak: [125, 400], slab: [200, 500], sewer: [150, 500] },
  { slug: 'pasadena', town: 'Pasadena', metro: 'Houston', metroSlug: 'houston', leak: [125, 400], slab: [200, 500], sewer: [150, 500] },
  { slug: 'pearland', town: 'Pearland', metro: 'Houston', metroSlug: 'houston', leak: [150, 400], slab: [150, 400], sewer: [175, 350] },
  { slug: 'spring', town: 'Spring', metro: 'Houston', metroSlug: 'houston', leak: [150, 400], slab: [150, 500], sewer: [150, 500] },
  { slug: 'sugar-land', town: 'Sugar Land', metro: 'Houston', metroSlug: 'houston', leak: [150, 400], slab: [150, 400], sewer: [175, 350] },
  { slug: 'the-woodlands', town: 'The Woodlands', metro: 'Houston', metroSlug: 'houston', leak: [150, 400], slab: [150, 500], sewer: [150, 500] },
  { slug: 'abernathy', town: 'Abernathy', metro: 'Lubbock', metroSlug: 'lubbock', leak: [200, 400], slab: [200, 400], sewer: [150, 500] },
  { slug: 'idalou', town: 'Idalou', metro: 'Lubbock', metroSlug: 'lubbock', leak: [200, 400], slab: [200, 400], sewer: [150, 500] },
  { slug: 'levelland', town: 'Levelland', metro: 'Lubbock', metroSlug: 'lubbock', leak: [200, 400], slab: [200, 400], sewer: [150, 500] },
  { slug: 'littlefield', town: 'Littlefield', metro: 'Lubbock', metroSlug: 'lubbock', leak: [200, 400], slab: [200, 400], sewer: [150, 500] },
  { slug: 'lubbock', town: 'Lubbock', metro: 'Lubbock', metroSlug: 'lubbock', leak: [200, 400], slab: [200, 400], sewer: [150, 500] },
  { slug: 'plainview', town: 'Plainview', metro: 'Lubbock', metroSlug: 'lubbock', leak: [200, 400], slab: [200, 400], sewer: [150, 500] },
  { slug: 'ralls', town: 'Ralls', metro: 'Lubbock', metroSlug: 'lubbock', leak: [200, 400], slab: [200, 400], sewer: [150, 500] },
  { slug: 'shallowater', town: 'Shallowater', metro: 'Lubbock', metroSlug: 'lubbock', leak: [200, 400], slab: [200, 400], sewer: [150, 500] },
  { slug: 'slaton', town: 'Slaton', metro: 'Lubbock', metroSlug: 'lubbock', leak: [200, 400], slab: [200, 400], sewer: [150, 500] },
  { slug: 'wolfforth', town: 'Wolfforth', metro: 'Lubbock', metroSlug: 'lubbock', leak: [200, 400], slab: [200, 400], sewer: [150, 500] },
  { slug: 'alamo', town: 'Alamo', metro: 'McAllen', metroSlug: 'mcallen', leak: [400, 800], slab: [400, 800], sewer: [575, 975], sewerNote: "Main sewer line hydrostatic testing, not a standalone camera inspection \u2014 no Rio Grande Valley firm publishes a standalone camera price." },
  { slug: 'donna', town: 'Donna', metro: 'McAllen', metroSlug: 'mcallen', leak: [400, 800], slab: [400, 800], sewer: [575, 975], sewerNote: "Main sewer line hydrostatic testing, not a standalone camera inspection \u2014 no Rio Grande Valley firm publishes a standalone camera price." },
  { slug: 'edinburg', town: 'Edinburg', metro: 'McAllen', metroSlug: 'mcallen', leak: [400, 800], slab: [400, 800], sewer: [575, 975], sewerNote: "Main sewer line hydrostatic testing, not a standalone camera inspection \u2014 no Rio Grande Valley firm publishes a standalone camera price." },
  { slug: 'hidalgo', town: 'Hidalgo', metro: 'McAllen', metroSlug: 'mcallen', leak: [400, 800], slab: [400, 800], sewer: [575, 975], sewerNote: "Main sewer line hydrostatic testing, not a standalone camera inspection \u2014 no Rio Grande Valley firm publishes a standalone camera price." },
  { slug: 'mcallen', town: 'McAllen', metro: 'McAllen', metroSlug: 'mcallen', leak: [400, 800], slab: [400, 800], sewer: [575, 975], sewerNote: "Main sewer line hydrostatic testing, not a standalone camera inspection \u2014 no Rio Grande Valley firm publishes a standalone camera price." },
  { slug: 'mercedes', town: 'Mercedes', metro: 'McAllen', metroSlug: 'mcallen', leak: [400, 800], slab: [400, 800], sewer: [575, 975], sewerNote: "Main sewer line hydrostatic testing, not a standalone camera inspection \u2014 no Rio Grande Valley firm publishes a standalone camera price." },
  { slug: 'mission', town: 'Mission', metro: 'McAllen', metroSlug: 'mcallen', leak: [400, 800], slab: [400, 800], sewer: [575, 975], sewerNote: "Main sewer line hydrostatic testing, not a standalone camera inspection \u2014 no Rio Grande Valley firm publishes a standalone camera price." },
  { slug: 'pharr', town: 'Pharr', metro: 'McAllen', metroSlug: 'mcallen', leak: [400, 800], slab: [400, 800], sewer: [575, 975], sewerNote: "Main sewer line hydrostatic testing, not a standalone camera inspection \u2014 no Rio Grande Valley firm publishes a standalone camera price." },
  { slug: 'san-juan', town: 'San Juan', metro: 'McAllen', metroSlug: 'mcallen', leak: [400, 800], slab: [400, 800], sewer: [575, 975], sewerNote: "Main sewer line hydrostatic testing, not a standalone camera inspection \u2014 no Rio Grande Valley firm publishes a standalone camera price." },
  { slug: 'weslaco', town: 'Weslaco', metro: 'McAllen', metroSlug: 'mcallen', leak: [400, 800], slab: [400, 800], sewer: [575, 975], sewerNote: "Main sewer line hydrostatic testing, not a standalone camera inspection \u2014 no Rio Grande Valley firm publishes a standalone camera price." },
  { slug: 'alamo-heights', town: 'Alamo Heights', metro: 'San Antonio', metroSlug: 'san-antonio', leak: [150, 400], slab: [150, 600], sewer: [285, 425] },
  { slug: 'boerne', town: 'Boerne', metro: 'San Antonio', metroSlug: 'san-antonio', leak: [150, 400], slab: [150, 600], sewer: [285, 425] },
  { slug: 'cibolo', town: 'Cibolo', metro: 'San Antonio', metroSlug: 'san-antonio', leak: [150, 400], slab: [150, 600], sewer: [285, 425] },
  { slug: 'converse', town: 'Converse', metro: 'San Antonio', metroSlug: 'san-antonio', leak: [150, 400], slab: [150, 600], sewer: [285, 425] },
  { slug: 'leon-valley', town: 'Leon Valley', metro: 'San Antonio', metroSlug: 'san-antonio', leak: [150, 400], slab: [150, 600], sewer: [285, 425] },
  { slug: 'live-oak', town: 'Live Oak', metro: 'San Antonio', metroSlug: 'san-antonio', leak: [150, 400], slab: [150, 600], sewer: [285, 425] },
  { slug: 'new-braunfels', town: 'New Braunfels', metro: 'San Antonio', metroSlug: 'san-antonio', leak: [150, 400], slab: [150, 600], sewer: [285, 425] },
  { slug: 'schertz', town: 'Schertz', metro: 'San Antonio', metroSlug: 'san-antonio', leak: [150, 400], slab: [150, 600], sewer: [285, 425] },
  { slug: 'selma', town: 'Selma', metro: 'San Antonio', metroSlug: 'san-antonio', leak: [150, 400], slab: [150, 600], sewer: [285, 425] },
  { slug: 'universal-city', town: 'Universal City', metro: 'San Antonio', metroSlug: 'san-antonio', leak: [150, 400], slab: [150, 600], sewer: [285, 425] },
];

export function priceTownBySlug(slug: string): PlumberPriceTown | undefined {
  return PLUMBER_PRICEBOOK.find((t) => t.slug === slug);
}

/** Metro names in display order, for the town picker. */
export const PRICEBOOK_METROS: string[] = ["Amarillo", "Austin", "Corpus Christi", "Dallas", "El Paso", "Fort Worth", "Houston", "Lubbock", "McAllen", "San Antonio"];
