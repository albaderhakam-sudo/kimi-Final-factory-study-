/* ============================ SEED DATA ============================ */

export const RATE_DEFAULT = 7.0;

// products: group, item, raw(CNY/pc), hours(h/pc), qty(6mo), price(USD|null)
export const SEED_PRODUCTS = [
  ["KK Lifting Clutch","1.3T",22.316,0.161955882352941,694,10.8],
  ["KK Lifting Clutch","2.5T",37.097,0.169534615384615,4623,11.9],
  ["KK Lifting Clutch","5T",74.942,0.215803373819163,2134,22.8],
  ["KK Lifting Clutch","10T",188.416,0.362380952380952,1047,60.8],
  ["KK Lifting Clutch","20T",455.147,0.739104895104895,221,128],
  ["KK Lifting Clutch","32T",1087.471,4.57166666666667,24,500],
  ["Cast in loop","0.8Tx210",1.17256203354298,0.550350404312669,0,null],
  ["Cast in loop","1.2Tx225",1.60307175919732,0.575348655920738,0,null],
  ["Cast in loop","1.6Tx235",1.98138034907903,0.593042080468551,0,null],
  ["Cast in loop","1.6Tx330",2.55343327175698,0.66237684729064,0,null],
  ["Cast in loop","1.6Tx460",3.29071423520924,0.804418546365915,0,null],
  ["Cast in loop","2Tx280",2.83011782115856,0.640235606178811,0,null],
  ["Cast in loop","2.5Tx315",3.52992980895916,0.726823671497584,0,null],
  ["Cast in loop","2.5Tx460",4.63309041203894,0.936317244846657,0,null],
  ["Cast in loop","4Tx340",5.45454195520566,1.07395820613346,0,null],
  ["Cast in loop","5.2Tx360",8.04025938983674,1.38896028775596,0,null],
  ["Cast in loop","5.2Tx460",9.49361688983674,1.6218599310607,0,null],
  ["Cast in loop","6.3Tx390",11.5502368353118,1.72046199296199,0,null],
  ["Cast in loop","8Tx460",17.9741190111425,2.35187912330327,0,null],
  ["Cast in loop","10Tx520",24.13383003267,2.71388773388773,0,null],
  ["Combination Pin Anchor Ring Clutch","2.5T",34.9844977536427,0.260985035808431,0,null],
  ["Combination Pin Anchor Ring Clutch","5T",63.4803683999339,0.27635853384416,0,null],
  ["Combination Pin Anchor Ring Clutch","10T",156.669747477145,0.619880952380952,0,null],
  ["Spread Anchor Combination Ring Clutch","1.25T",26.594331494549,0.245033175863267,1133,6.8],
  ["Spread Anchor Combination Ring Clutch","2.5T",45.8849878501019,0.327644772485368,445,14.9],
  ["Sealing Cap","M12",0.0728601677974435,0.000192063492063492,29300,0.024],
  ["Sealing Cap","M16",0.1263,0.000192063492063492,101220,0.028],
  ["Sealing Cap","M20",0.171690454545455,0.000231818181818182,15963,null],
  ["Sealing Cap","M24",0.195380921985816,0.000279432624113475,30255,0.047],
  ["Sealing Cap","M30",0.187621931216931,0.00370499118165785,22000,null],
  ["Pin Anchor Rubber Former","1.3T",4.170095,0.00297380952380952,1005,0.74],
  ["Pin Anchor Rubber Former","2.5T",6.74894,0.00309047619047619,3511,1.2],
  ["Pin Anchor Rubber Former","5T",13.5078166666667,0.00324603174603175,1507,2.4],
  ["Pin Anchor Rubber Former","7.5T",25.2105,0.0045,104,4.36],
  ["Pin Anchor Rubber Former","10T",25.6922,0.0045,305,4.46],
  ["Pin Anchor Rubber Former","20T",60.77065,0.0045,0,null],
  ["Spread Anchor Recess Former","1.25T",4.045095,0.0140055555555556,0,null],
  ["Spread Anchor Recess Former","2.5T",5.467315,0.0224432624113475,150,1.3],
  ["Spread Anchor Recess Former","5T",11.6103166666667,0.0141222222222222,0,null],
  ["Spread Anchor Recess Former","10T",31.4422,0.0173380414312618,0,null],
  ["Nailing Plate","M10",0.456875,0.000505,0,null],
  ["Nailing Plate","M12",0.496875,0.000505,20110,0.1],
  ["Nailing Plate","M16",0.537692307692308,0.000505,69806,0.103],
  ["Nailing Plate","M20",0.587692307692308,0.000505,55144,0.106],
  ["Nailing Plate","M24",0.6725,0.000505,20061,0.132],
  ["Nailing Plate","M30",0.817142857142857,0.000699,10071,0.159],
  ["Nailing Plate","M36",1.10538461538462,0.000699,5030,0.215],
  ["Nailing Plate","Large M12",0.504285714285714,0.000568,0,null],
  ["Nailing Plate","Large M16",0.549230769230769,0.000568,30020,0.112],
  ["Nailing Plate","Large M20",0.559230769230769,0.000568,5110,0.119],
  ["Nailing Plate","Large M24",0.725,0.000758,35089,0.144],
  ["Nailing Plate","Large M30",0.863846153846154,0.000758,65268,0.17],
  ["Nailing Plate","Large M36",1.20923076923077,0.001136,5082,0.23],
  ["Nailing Plate","Large M42",1.30923076923077,0.001136,3050,0.25],
  ["Nailing Plate","Large M52",1.52818181818182,0.001136,0,null],
  ["WZP Anchor Pin Fixing Plate","1.3T",1.241525,0.00104666666666667,0,null],
  ["WZP Anchor Pin Fixing Plate","2.5T",1.8940475,0.00105833333333333,1006,0.325],
  ["WZP Anchor Pin Fixing Plate","5T",2.43706333333333,0.00107777777777778,1000,0.43],
  ["WZP Anchor Pin Fixing Plate","10T",3.137095,0.00136666666666667,0,null],
  ["WZP Anchor Pin Fixing Plate","20T",4.55299,0.00148333333333333,0,null],
];

export const SEED_EMPLOYEES = [
  ["HAKAM","General Manager","Employee",10000,"1"],
  ["Abbi","GM Assistant","Employee",10000,"1"],
  ["Lihua","Factory Manager","Employee",10000,"1"],
  ["Ajiao","Accountant","Employee",10000,"1"],
  ["Eva","HR","Employee",10000,"1"],
  ["Welder","Welder","Labor",6438,"0"],
  ["Laohe","Labor (retired)","Labor",4940,"0"],
  ["Tangshu","QC","Labor",4465,"0"],
  ["Jia","Labor","Labor",5465,"0"],
  ["Tangenshu wife","Labor","Labor",3615,"0"],
  ["Xiaoyan","Machinery man","Labor",6500,"0"],
];

let UID = 1;
const uid = (p) => (p || "x") + (UID++);

export function makeDefaultState() {
  UID = 1;
  const products = SEED_PRODUCTS.map((r) => ({
    id: uid("p"),
    group: r[0],
    item: r[1],
    raw: r[2],
    hours: r[3],
    qty: r[4],
    price: r[5],
  }));
  const employees = SEED_EMPLOYEES.map((r) => ({
    id: uid("e"),
    name: r[0],
    position: r[1],
    group: r[2],
    standard: r[3],
    basic: Math.round(r[3] * 0.6),
    hoursMonth: 208,
    prod: r[2] === "Labor",
    salaryModel: r[4] != null ? String(r[4]) : (r[2] === "Labor" ? "0" : "1"),
  }));
  const rev6 = products.reduce(
    (a, p) => a + (p.price != null ? p.qty * p.price * RATE_DEFAULT : 0),
    0
  );
  const base = Math.round(rev6 / 6);
  return {
    ui: { cur: "CNY", rate: RATE_DEFAULT, months: 6, lang: "en", view: "monthly" },
    sales: { value: base, flex: 35 },
    products,
    employees,
    labor: { hoursDay: 8, daysMonth: 26 },
    costs: { rentMonthly: 15417, elecMonthly: 5000 },
    salary: {
      model: "0",
      basicPct: 60,
      S0: base,
      multiplier: 1.0,
      labSalesPreview: base,
    },
    invest: {
      total: 0,
      auto: false,
      buckets: [
        { id: uid("b"), name: "Machinery & equipment", mode: "fixed", value: 250000, months: 0, basis: "none", auto: false },
        { id: uid("b"), name: "Assets / fit-out", mode: "fixed", value: 120000, months: 0, basis: "none", auto: false },
        { id: uid("b"), name: "Raw materials (working capital)", mode: "months", value: 0, months: 2, basis: "material", auto: true },
        { id: uid("b"), name: "Rent reserve", mode: "months", value: 0, months: 3, basis: "rent", auto: true },
        { id: uid("b"), name: "Salary reserve", mode: "months", value: 0, months: 3, basis: "payroll", auto: true },
        { id: uid("b"), name: "Utilities reserve", mode: "months", value: 0, months: 3, basis: "elec", auto: true },
        { id: uid("b"), name: "Contingency", mode: "fixed", value: 80000, months: 0, basis: "none", auto: false },
      ],
    },
  };
}
