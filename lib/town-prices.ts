// Generated from ~/workspace/leak-detection-seo/research-csvs/*-towns.csv — do not edit by hand.
// Regenerate: parse the first $low–$high range in each price_* column per town.
// Columns: price_leak_detection, price_slab_detection, price_sewer_camera.
// HONEST LIMIT: the researched ranges are metro-typical — towns in the same metro
// share the same range, because the underlying research is metro-level (plumber-published
// prices, local guides, Angi local data). They are shown per town, never relabelled
// as a town-specific quote. McAllen sewer-camera cells are a hydrostatic-test price,
// not a standalone camera price — flagged in cameraNote on those rows.

export interface TownPrice {
  town: string;
  metro: string;
  townSlug: string;
  metroSlug: string;
  /** General / yard-line / gas / pool detection — researched metro-typical range. */
  leakLow: number;
  leakHigh: number;
  /** Slab leak detection only — researched metro-typical range. */
  slabLow: number;
  slabHigh: number;
  /** Sewer camera inspection — researched metro-typical range (see cameraNote). */
  cameraLow: number;
  cameraHigh: number;
  /** Present only where the source cell is not a standalone camera price. */
  cameraNote?: string;
}

export const TOWN_PRICES: TownPrice[] = [
  { town: 'Conroe', metro: 'Houston', townSlug: 'conroe', metroSlug: 'houston', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 500, cameraLow: 150, cameraHigh: 500 },
  { town: 'Cypress', metro: 'Houston', townSlug: 'cypress', metroSlug: 'houston', leakLow: 125, leakHigh: 400, slabLow: 200, slabHigh: 500, cameraLow: 150, cameraHigh: 500 },
  { town: 'Humble', metro: 'Houston', townSlug: 'humble', metroSlug: 'houston', leakLow: 125, leakHigh: 400, slabLow: 200, slabHigh: 500, cameraLow: 150, cameraHigh: 500 },
  { town: 'Katy', metro: 'Houston', townSlug: 'katy', metroSlug: 'houston', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 400, cameraLow: 175, cameraHigh: 350 },
  { town: 'League City', metro: 'Houston', townSlug: 'league-city', metroSlug: 'houston', leakLow: 125, leakHigh: 400, slabLow: 200, slabHigh: 500, cameraLow: 150, cameraHigh: 500 },
  { town: 'Pasadena', metro: 'Houston', townSlug: 'pasadena', metroSlug: 'houston', leakLow: 125, leakHigh: 400, slabLow: 200, slabHigh: 500, cameraLow: 150, cameraHigh: 500 },
  { town: 'Pearland', metro: 'Houston', townSlug: 'pearland', metroSlug: 'houston', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 400, cameraLow: 175, cameraHigh: 350 },
  { town: 'Spring', metro: 'Houston', townSlug: 'spring', metroSlug: 'houston', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 500, cameraLow: 150, cameraHigh: 500 },
  { town: 'Sugar Land', metro: 'Houston', townSlug: 'sugar-land', metroSlug: 'houston', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 400, cameraLow: 175, cameraHigh: 350 },
  { town: 'The Woodlands', metro: 'Houston', townSlug: 'the-woodlands', metroSlug: 'houston', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 500, cameraLow: 150, cameraHigh: 500 },
  { town: 'Allen', metro: 'Dallas', townSlug: 'allen', metroSlug: 'dallas', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Carrollton', metro: 'Dallas', townSlug: 'carrollton', metroSlug: 'dallas', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Denton', metro: 'Dallas', townSlug: 'denton', metroSlug: 'dallas', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Frisco', metro: 'Dallas', townSlug: 'frisco', metroSlug: 'dallas', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Garland', metro: 'Dallas', townSlug: 'garland', metroSlug: 'dallas', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Irving', metro: 'Dallas', townSlug: 'irving', metroSlug: 'dallas', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Lewisville', metro: 'Dallas', townSlug: 'lewisville', metroSlug: 'dallas', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'McKinney', metro: 'Dallas', townSlug: 'mckinney', metroSlug: 'dallas', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Plano', metro: 'Dallas', townSlug: 'plano', metroSlug: 'dallas', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Richardson', metro: 'Dallas', townSlug: 'richardson', metroSlug: 'dallas', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Alamo Heights', metro: 'San Antonio', townSlug: 'alamo-heights', metroSlug: 'san-antonio', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 285, cameraHigh: 425 },
  { town: 'Boerne', metro: 'San Antonio', townSlug: 'boerne', metroSlug: 'san-antonio', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 285, cameraHigh: 425 },
  { town: 'Cibolo', metro: 'San Antonio', townSlug: 'cibolo', metroSlug: 'san-antonio', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 285, cameraHigh: 425 },
  { town: 'Converse', metro: 'San Antonio', townSlug: 'converse', metroSlug: 'san-antonio', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 285, cameraHigh: 425 },
  { town: 'Leon Valley', metro: 'San Antonio', townSlug: 'leon-valley', metroSlug: 'san-antonio', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 285, cameraHigh: 425 },
  { town: 'Live Oak', metro: 'San Antonio', townSlug: 'live-oak', metroSlug: 'san-antonio', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 285, cameraHigh: 425 },
  { town: 'New Braunfels', metro: 'San Antonio', townSlug: 'new-braunfels', metroSlug: 'san-antonio', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 285, cameraHigh: 425 },
  { town: 'Schertz', metro: 'San Antonio', townSlug: 'schertz', metroSlug: 'san-antonio', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 285, cameraHigh: 425 },
  { town: 'Selma', metro: 'San Antonio', townSlug: 'selma', metroSlug: 'san-antonio', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 285, cameraHigh: 425 },
  { town: 'Universal City', metro: 'San Antonio', townSlug: 'universal-city', metroSlug: 'san-antonio', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 285, cameraHigh: 425 },
  { town: 'Buda', metro: 'Austin', townSlug: 'buda', metroSlug: 'austin', leakLow: 150, leakHigh: 500, slabLow: 150, slabHigh: 400, cameraLow: 150, cameraHigh: 300 },
  { town: 'Cedar Park', metro: 'Austin', townSlug: 'cedar-park', metroSlug: 'austin', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 150, cameraHigh: 300 },
  { town: 'Dripping Springs', metro: 'Austin', townSlug: 'dripping-springs', metroSlug: 'austin', leakLow: 150, leakHigh: 500, slabLow: 150, slabHigh: 400, cameraLow: 125, cameraHigh: 500 },
  { town: 'Georgetown', metro: 'Austin', townSlug: 'georgetown', metroSlug: 'austin', leakLow: 150, leakHigh: 500, slabLow: 150, slabHigh: 400, cameraLow: 125, cameraHigh: 500 },
  { town: 'Kyle', metro: 'Austin', townSlug: 'kyle', metroSlug: 'austin', leakLow: 150, leakHigh: 500, slabLow: 150, slabHigh: 400, cameraLow: 150, cameraHigh: 300 },
  { town: 'Lakeway', metro: 'Austin', townSlug: 'lakeway', metroSlug: 'austin', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 260, cameraHigh: 1700 },
  { town: 'Leander', metro: 'Austin', townSlug: 'leander', metroSlug: 'austin', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 260, cameraHigh: 1700 },
  { town: 'Pflugerville', metro: 'Austin', townSlug: 'pflugerville', metroSlug: 'austin', leakLow: 150, leakHigh: 500, slabLow: 150, slabHigh: 400, cameraLow: 125, cameraHigh: 500 },
  { town: 'Round Rock', metro: 'Austin', townSlug: 'round-rock', metroSlug: 'austin', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 600, cameraLow: 150, cameraHigh: 300 },
  { town: 'San Marcos', metro: 'Austin', townSlug: 'san-marcos', metroSlug: 'austin', leakLow: 150, leakHigh: 500, slabLow: 150, slabHigh: 400, cameraLow: 125, cameraHigh: 500 },
  { town: 'Arlington', metro: 'Fort Worth', townSlug: 'arlington', metroSlug: 'fort-worth', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Bedford', metro: 'Fort Worth', townSlug: 'bedford', metroSlug: 'fort-worth', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Burleson', metro: 'Fort Worth', townSlug: 'burleson', metroSlug: 'fort-worth', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Euless', metro: 'Fort Worth', townSlug: 'euless', metroSlug: 'fort-worth', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Grand Prairie', metro: 'Fort Worth', townSlug: 'grand-prairie', metroSlug: 'fort-worth', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Grapevine', metro: 'Fort Worth', townSlug: 'grapevine', metroSlug: 'fort-worth', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Keller', metro: 'Fort Worth', townSlug: 'keller', metroSlug: 'fort-worth', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Mansfield', metro: 'Fort Worth', townSlug: 'mansfield', metroSlug: 'fort-worth', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'North Richland Hills', metro: 'Fort Worth', townSlug: 'north-richland-hills', metroSlug: 'fort-worth', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Southlake', metro: 'Fort Worth', townSlug: 'southlake', metroSlug: 'fort-worth', leakLow: 250, leakHigh: 600, slabLow: 250, slabHigh: 600, cameraLow: 200, cameraHigh: 500 },
  { town: 'Anthony', metro: 'El Paso', townSlug: 'anthony', metroSlug: 'el-paso', leakLow: 129, leakHigh: 500, slabLow: 280, slabHigh: 950, cameraLow: 170, cameraHigh: 730 },
  { town: 'Canutillo', metro: 'El Paso', townSlug: 'canutillo', metroSlug: 'el-paso', leakLow: 129, leakHigh: 500, slabLow: 280, slabHigh: 950, cameraLow: 170, cameraHigh: 730 },
  { town: 'Clint', metro: 'El Paso', townSlug: 'clint', metroSlug: 'el-paso', leakLow: 129, leakHigh: 500, slabLow: 280, slabHigh: 950, cameraLow: 170, cameraHigh: 730 },
  { town: 'El Paso', metro: 'El Paso', townSlug: 'el-paso', metroSlug: 'el-paso', leakLow: 129, leakHigh: 500, slabLow: 280, slabHigh: 950, cameraLow: 170, cameraHigh: 730 },
  { town: 'Fabens', metro: 'El Paso', townSlug: 'fabens', metroSlug: 'el-paso', leakLow: 129, leakHigh: 500, slabLow: 280, slabHigh: 950, cameraLow: 170, cameraHigh: 730 },
  { town: 'Horizon City', metro: 'El Paso', townSlug: 'horizon-city', metroSlug: 'el-paso', leakLow: 129, leakHigh: 500, slabLow: 280, slabHigh: 950, cameraLow: 170, cameraHigh: 730 },
  { town: 'San Elizario', metro: 'El Paso', townSlug: 'san-elizario', metroSlug: 'el-paso', leakLow: 129, leakHigh: 500, slabLow: 280, slabHigh: 950, cameraLow: 170, cameraHigh: 730 },
  { town: 'Socorro', metro: 'El Paso', townSlug: 'socorro', metroSlug: 'el-paso', leakLow: 129, leakHigh: 500, slabLow: 280, slabHigh: 950, cameraLow: 170, cameraHigh: 730 },
  { town: 'Vinton', metro: 'El Paso', townSlug: 'vinton', metroSlug: 'el-paso', leakLow: 129, leakHigh: 500, slabLow: 280, slabHigh: 950, cameraLow: 170, cameraHigh: 730 },
  { town: 'Westway', metro: 'El Paso', townSlug: 'westway', metroSlug: 'el-paso', leakLow: 129, leakHigh: 500, slabLow: 280, slabHigh: 950, cameraLow: 170, cameraHigh: 730 },
  { town: 'Alamo', metro: 'McAllen', townSlug: 'alamo', metroSlug: 'mcallen', leakLow: 400, leakHigh: 800, slabLow: 400, slabHigh: 800, cameraLow: 575, cameraHigh: 975, cameraNote: 'Main sewer line hydrostatic test price — standalone sewer-camera price unverified for this metro' },
  { town: 'Donna', metro: 'McAllen', townSlug: 'donna', metroSlug: 'mcallen', leakLow: 400, leakHigh: 800, slabLow: 400, slabHigh: 800, cameraLow: 575, cameraHigh: 975, cameraNote: 'Main sewer line hydrostatic test price — standalone sewer-camera price unverified for this metro' },
  { town: 'Edinburg', metro: 'McAllen', townSlug: 'edinburg', metroSlug: 'mcallen', leakLow: 400, leakHigh: 800, slabLow: 400, slabHigh: 800, cameraLow: 575, cameraHigh: 975, cameraNote: 'Main sewer line hydrostatic test price — standalone sewer-camera price unverified for this metro' },
  { town: 'Hidalgo', metro: 'McAllen', townSlug: 'hidalgo', metroSlug: 'mcallen', leakLow: 400, leakHigh: 800, slabLow: 400, slabHigh: 800, cameraLow: 575, cameraHigh: 975, cameraNote: 'Main sewer line hydrostatic test price — standalone sewer-camera price unverified for this metro' },
  { town: 'McAllen', metro: 'McAllen', townSlug: 'mcallen', metroSlug: 'mcallen', leakLow: 400, leakHigh: 800, slabLow: 400, slabHigh: 800, cameraLow: 575, cameraHigh: 975, cameraNote: 'Main sewer line hydrostatic test price — standalone sewer-camera price unverified for this metro' },
  { town: 'Mercedes', metro: 'McAllen', townSlug: 'mercedes', metroSlug: 'mcallen', leakLow: 400, leakHigh: 800, slabLow: 400, slabHigh: 800, cameraLow: 575, cameraHigh: 975, cameraNote: 'Main sewer line hydrostatic test price — standalone sewer-camera price unverified for this metro' },
  { town: 'Mission', metro: 'McAllen', townSlug: 'mission', metroSlug: 'mcallen', leakLow: 400, leakHigh: 800, slabLow: 400, slabHigh: 800, cameraLow: 575, cameraHigh: 975, cameraNote: 'Main sewer line hydrostatic test price — standalone sewer-camera price unverified for this metro' },
  { town: 'Pharr', metro: 'McAllen', townSlug: 'pharr', metroSlug: 'mcallen', leakLow: 400, leakHigh: 800, slabLow: 400, slabHigh: 800, cameraLow: 575, cameraHigh: 975, cameraNote: 'Main sewer line hydrostatic test price — standalone sewer-camera price unverified for this metro' },
  { town: 'San Juan', metro: 'McAllen', townSlug: 'san-juan', metroSlug: 'mcallen', leakLow: 400, leakHigh: 800, slabLow: 400, slabHigh: 800, cameraLow: 575, cameraHigh: 975, cameraNote: 'Main sewer line hydrostatic test price — standalone sewer-camera price unverified for this metro' },
  { town: 'Weslaco', metro: 'McAllen', townSlug: 'weslaco', metroSlug: 'mcallen', leakLow: 400, leakHigh: 800, slabLow: 400, slabHigh: 800, cameraLow: 575, cameraHigh: 975, cameraNote: 'Main sewer line hydrostatic test price — standalone sewer-camera price unverified for this metro' },
  { town: 'Alice', metro: 'Corpus Christi', townSlug: 'alice', metroSlug: 'corpus-christi', leakLow: 180, leakHigh: 400, slabLow: 200, slabHigh: 450, cameraLow: 175, cameraHigh: 350 },
  { town: 'Aransas Pass', metro: 'Corpus Christi', townSlug: 'aransas-pass', metroSlug: 'corpus-christi', leakLow: 180, leakHigh: 400, slabLow: 200, slabHigh: 450, cameraLow: 175, cameraHigh: 350 },
  { town: 'Corpus Christi', metro: 'Corpus Christi', townSlug: 'corpus-christi', metroSlug: 'corpus-christi', leakLow: 180, leakHigh: 400, slabLow: 200, slabHigh: 450, cameraLow: 175, cameraHigh: 350 },
  { town: 'Ingleside', metro: 'Corpus Christi', townSlug: 'ingleside', metroSlug: 'corpus-christi', leakLow: 180, leakHigh: 400, slabLow: 200, slabHigh: 450, cameraLow: 175, cameraHigh: 350 },
  { town: 'Mathis', metro: 'Corpus Christi', townSlug: 'mathis', metroSlug: 'corpus-christi', leakLow: 180, leakHigh: 400, slabLow: 200, slabHigh: 450, cameraLow: 175, cameraHigh: 350 },
  { town: 'Port Aransas', metro: 'Corpus Christi', townSlug: 'port-aransas', metroSlug: 'corpus-christi', leakLow: 180, leakHigh: 400, slabLow: 200, slabHigh: 450, cameraLow: 175, cameraHigh: 350 },
  { town: 'Portland', metro: 'Corpus Christi', townSlug: 'portland', metroSlug: 'corpus-christi', leakLow: 180, leakHigh: 400, slabLow: 200, slabHigh: 450, cameraLow: 175, cameraHigh: 350 },
  { town: 'Robstown', metro: 'Corpus Christi', townSlug: 'robstown', metroSlug: 'corpus-christi', leakLow: 180, leakHigh: 400, slabLow: 200, slabHigh: 450, cameraLow: 175, cameraHigh: 350 },
  { town: 'Rockport', metro: 'Corpus Christi', townSlug: 'rockport', metroSlug: 'corpus-christi', leakLow: 180, leakHigh: 400, slabLow: 200, slabHigh: 450, cameraLow: 175, cameraHigh: 350 },
  { town: 'Sinton', metro: 'Corpus Christi', townSlug: 'sinton', metroSlug: 'corpus-christi', leakLow: 180, leakHigh: 400, slabLow: 200, slabHigh: 450, cameraLow: 175, cameraHigh: 350 },
  { town: 'Abernathy', metro: 'Lubbock', townSlug: 'abernathy', metroSlug: 'lubbock', leakLow: 200, leakHigh: 400, slabLow: 200, slabHigh: 400, cameraLow: 150, cameraHigh: 500 },
  { town: 'Idalou', metro: 'Lubbock', townSlug: 'idalou', metroSlug: 'lubbock', leakLow: 200, leakHigh: 400, slabLow: 200, slabHigh: 400, cameraLow: 150, cameraHigh: 500 },
  { town: 'Levelland', metro: 'Lubbock', townSlug: 'levelland', metroSlug: 'lubbock', leakLow: 200, leakHigh: 400, slabLow: 200, slabHigh: 400, cameraLow: 150, cameraHigh: 500 },
  { town: 'Littlefield', metro: 'Lubbock', townSlug: 'littlefield', metroSlug: 'lubbock', leakLow: 200, leakHigh: 400, slabLow: 200, slabHigh: 400, cameraLow: 150, cameraHigh: 500 },
  { town: 'Lubbock', metro: 'Lubbock', townSlug: 'lubbock', metroSlug: 'lubbock', leakLow: 200, leakHigh: 400, slabLow: 200, slabHigh: 400, cameraLow: 150, cameraHigh: 500 },
  { town: 'Plainview', metro: 'Lubbock', townSlug: 'plainview', metroSlug: 'lubbock', leakLow: 200, leakHigh: 400, slabLow: 200, slabHigh: 400, cameraLow: 150, cameraHigh: 500 },
  { town: 'Ralls', metro: 'Lubbock', townSlug: 'ralls', metroSlug: 'lubbock', leakLow: 200, leakHigh: 400, slabLow: 200, slabHigh: 400, cameraLow: 150, cameraHigh: 500 },
  { town: 'Shallowater', metro: 'Lubbock', townSlug: 'shallowater', metroSlug: 'lubbock', leakLow: 200, leakHigh: 400, slabLow: 200, slabHigh: 400, cameraLow: 150, cameraHigh: 500 },
  { town: 'Slaton', metro: 'Lubbock', townSlug: 'slaton', metroSlug: 'lubbock', leakLow: 200, leakHigh: 400, slabLow: 200, slabHigh: 400, cameraLow: 150, cameraHigh: 500 },
  { town: 'Wolfforth', metro: 'Lubbock', townSlug: 'wolfforth', metroSlug: 'lubbock', leakLow: 200, leakHigh: 400, slabLow: 200, slabHigh: 400, cameraLow: 150, cameraHigh: 500 },
  { town: 'Amarillo', metro: 'Amarillo', townSlug: 'amarillo', metroSlug: 'amarillo', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 400, cameraLow: 100, cameraHigh: 250 },
  { town: 'Borger', metro: 'Amarillo', townSlug: 'borger', metroSlug: 'amarillo', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 400, cameraLow: 100, cameraHigh: 250 },
  { town: 'Canyon', metro: 'Amarillo', townSlug: 'canyon', metroSlug: 'amarillo', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 400, cameraLow: 100, cameraHigh: 250 },
  { town: 'Dalhart', metro: 'Amarillo', townSlug: 'dalhart', metroSlug: 'amarillo', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 400, cameraLow: 100, cameraHigh: 250 },
  { town: 'Dumas', metro: 'Amarillo', townSlug: 'dumas', metroSlug: 'amarillo', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 400, cameraLow: 100, cameraHigh: 250 },
  { town: 'Fritch', metro: 'Amarillo', townSlug: 'fritch', metroSlug: 'amarillo', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 400, cameraLow: 100, cameraHigh: 250 },
  { town: 'Hereford', metro: 'Amarillo', townSlug: 'hereford', metroSlug: 'amarillo', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 400, cameraLow: 100, cameraHigh: 250 },
  { town: 'Pampa', metro: 'Amarillo', townSlug: 'pampa', metroSlug: 'amarillo', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 400, cameraLow: 100, cameraHigh: 250 },
  { town: 'Perryton', metro: 'Amarillo', townSlug: 'perryton', metroSlug: 'amarillo', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 400, cameraLow: 100, cameraHigh: 250 },
  { town: 'Tulia', metro: 'Amarillo', townSlug: 'tulia', metroSlug: 'amarillo', leakLow: 150, leakHigh: 400, slabLow: 150, slabHigh: 400, cameraLow: 100, cameraHigh: 250 },
];

export function townPriceBySlug(slug: string): TownPrice | undefined {
  return TOWN_PRICES.find((t) => t.townSlug === slug);
}
