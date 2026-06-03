// Red Dragon Factory — canonical dataset
// Source: Items+price+working+hours.xlsx (products) + Sheet2 (employees), parsed exactly.
// Raw cost = loaded CNY/pc (incl. plating/tools/packing). hoursPerPc = production hours per piece.
// priceUSD = native selling price (USD); CNY revenue = priceUSD * FX. null = price missing (fill in-app).
// Period: Jan–Jun 2026 (6 months actual).
window.RDF_DATA = {
  meta: {
    fx: 7.0,
    months: 6,
    rentPerYear: 185000,      // forward-looking assumption (≈15,417/mo)
    electricityPerMonth: 5000,
    histRentPer6mo: 68000,    // historical reconciliation only
    histElecPer6mo: 30000,
  },
  products: [
  {
    "id": "p1",
    "group": "KK Lifting Clutch",
    "size": "1.3T",
    "rawCost": 22.316,
    "hoursPerPc": 0.161955882352941,
    "qty": 694,
    "priceUSD": 10.8
  },
  {
    "id": "p2",
    "group": "KK Lifting Clutch",
    "size": "2.5T",
    "rawCost": 37.096999999999994,
    "hoursPerPc": 0.169534615384615,
    "qty": 4623,
    "priceUSD": 11.9
  },
  {
    "id": "p3",
    "group": "KK Lifting Clutch",
    "size": "5T",
    "rawCost": 74.94200000000001,
    "hoursPerPc": 0.215803373819163,
    "qty": 2134,
    "priceUSD": 22.8
  },
  {
    "id": "p4",
    "group": "KK Lifting Clutch",
    "size": "10T",
    "rawCost": 188.41599999999997,
    "hoursPerPc": 0.362380952380952,
    "qty": 1047,
    "priceUSD": 60.8
  },
  {
    "id": "p5",
    "group": "KK Lifting Clutch",
    "size": "20T",
    "rawCost": 455.147,
    "hoursPerPc": 0.739104895104895,
    "qty": 221,
    "priceUSD": 128
  },
  {
    "id": "p6",
    "group": "KK Lifting Clutch",
    "size": "32T",
    "rawCost": 1087.471,
    "hoursPerPc": 4.57166666666667,
    "qty": 24,
    "priceUSD": 500
  },
  {
    "id": "p7",
    "group": "Cast in Loop",
    "size": "0.8Tx210",
    "rawCost": 1.172562033542977,
    "hoursPerPc": 0.550350404312669,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p8",
    "group": "Cast in Loop",
    "size": "1.2Tx225",
    "rawCost": 1.6030717591973245,
    "hoursPerPc": 0.575348655920738,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p9",
    "group": "Cast in Loop",
    "size": "1.6Tx235",
    "rawCost": 1.9813803490790254,
    "hoursPerPc": 0.593042080468551,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p10",
    "group": "Cast in Loop",
    "size": "1.6Tx330",
    "rawCost": 2.5534332717569788,
    "hoursPerPc": 0.66237684729064,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p11",
    "group": "Cast in Loop",
    "size": "1.6Tx460",
    "rawCost": 3.290714235209235,
    "hoursPerPc": 0.804418546365915,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p12",
    "group": "Cast in Loop",
    "size": "2Tx280",
    "rawCost": 2.8301178211585576,
    "hoursPerPc": 0.640235606178811,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p13",
    "group": "Cast in Loop",
    "size": "2.5Tx315",
    "rawCost": 3.529929808959157,
    "hoursPerPc": 0.726823671497584,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p14",
    "group": "Cast in Loop",
    "size": "2.5Tx460",
    "rawCost": 4.633090412038941,
    "hoursPerPc": 0.936317244846657,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p15",
    "group": "Cast in Loop",
    "size": "4Tx340",
    "rawCost": 5.454541955205656,
    "hoursPerPc": 1.07395820613346,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p16",
    "group": "Cast in Loop",
    "size": "5.2Tx360",
    "rawCost": 8.040259389836743,
    "hoursPerPc": 1.38896028775596,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p17",
    "group": "Cast in Loop",
    "size": "5.2Tx460",
    "rawCost": 9.493616889836744,
    "hoursPerPc": 1.6218599310607,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p18",
    "group": "Cast in Loop",
    "size": "6.3Tx390",
    "rawCost": 11.550236835311836,
    "hoursPerPc": 1.72046199296199,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p19",
    "group": "Cast in Loop",
    "size": "8Tx460",
    "rawCost": 17.974119011142538,
    "hoursPerPc": 2.35187912330327,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p20",
    "group": "Cast in Loop",
    "size": "10Tx520",
    "rawCost": 24.13383003267003,
    "hoursPerPc": 2.71388773388773,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p21",
    "group": "Combination Pin Anchor Ring Clutch",
    "size": "2.5T",
    "rawCost": 34.984497753642735,
    "hoursPerPc": 0.260985035808431,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p22",
    "group": "Combination Pin Anchor Ring Clutch",
    "size": "5T",
    "rawCost": 63.4803683999339,
    "hoursPerPc": 0.27635853384416,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p23",
    "group": "Combination Pin Anchor Ring Clutch",
    "size": "10T",
    "rawCost": 156.66974747714463,
    "hoursPerPc": 0.619880952380952,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p24",
    "group": "Spread Anchor Combination Ring Clutch",
    "size": "1.25T",
    "rawCost": 26.594331494548975,
    "hoursPerPc": 0.245033175863267,
    "qty": 1133,
    "priceUSD": 6.8
  },
  {
    "id": "p25",
    "group": "Spread Anchor Combination Ring Clutch",
    "size": "2.5T",
    "rawCost": 45.884987850101886,
    "hoursPerPc": 0.327644772485368,
    "qty": 445,
    "priceUSD": 14.9
  },
  {
    "id": "p26",
    "group": "Sealing Cap",
    "size": "M12",
    "rawCost": 0.07286016779744346,
    "hoursPerPc": 0.000192063492063492,
    "qty": 29300,
    "priceUSD": 0.024
  },
  {
    "id": "p27",
    "group": "Sealing Cap",
    "size": "M16",
    "rawCost": 0.1263,
    "hoursPerPc": 0.000192063492063492,
    "qty": 101220,
    "priceUSD": 0.028
  },
  {
    "id": "p28",
    "group": "Sealing Cap",
    "size": "M20",
    "rawCost": 0.17169045454545456,
    "hoursPerPc": 0.000231818181818182,
    "qty": 15963,
    "priceUSD": null
  },
  {
    "id": "p29",
    "group": "Sealing Cap",
    "size": "M24",
    "rawCost": 0.1953809219858156,
    "hoursPerPc": 0.000279432624113475,
    "qty": 30255,
    "priceUSD": 0.047
  },
  {
    "id": "p30",
    "group": "Sealing Cap",
    "size": "M30",
    "rawCost": 0.187621931216931,
    "hoursPerPc": 0.00370499118165785,
    "qty": 22000,
    "priceUSD": null
  },
  {
    "id": "p31",
    "group": "Pin Anchor Rubber Former",
    "size": "1.3T",
    "rawCost": 4.170095,
    "hoursPerPc": 0.00297380952380952,
    "qty": 1005,
    "priceUSD": 0.74
  },
  {
    "id": "p32",
    "group": "Pin Anchor Rubber Former",
    "size": "2.5T",
    "rawCost": 6.74894,
    "hoursPerPc": 0.00309047619047619,
    "qty": 3511,
    "priceUSD": 1.2
  },
  {
    "id": "p33",
    "group": "Pin Anchor Rubber Former",
    "size": "5T",
    "rawCost": 13.507816666666667,
    "hoursPerPc": 0.00324603174603175,
    "qty": 1507,
    "priceUSD": 2.4
  },
  {
    "id": "p34",
    "group": "Pin Anchor Rubber Former",
    "size": "7.5T",
    "rawCost": 25.210499999999996,
    "hoursPerPc": 0.0045,
    "qty": 104,
    "priceUSD": 4.36
  },
  {
    "id": "p35",
    "group": "Pin Anchor Rubber Former",
    "size": "10T",
    "rawCost": 25.6922,
    "hoursPerPc": 0.0045,
    "qty": 305,
    "priceUSD": 4.46
  },
  {
    "id": "p36",
    "group": "Pin Anchor Rubber Former",
    "size": "20T",
    "rawCost": 60.770649999999996,
    "hoursPerPc": 0.0045,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p37",
    "group": "Spread Anchor Recess Former",
    "size": "1.25T",
    "rawCost": 4.045095,
    "hoursPerPc": 0.0140055555555556,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p38",
    "group": "Spread Anchor Recess Former",
    "size": "2.5T",
    "rawCost": 5.467315,
    "hoursPerPc": 0.0224432624113475,
    "qty": 150,
    "priceUSD": 1.3
  },
  {
    "id": "p39",
    "group": "Spread Anchor Recess Former",
    "size": "5T",
    "rawCost": 11.610316666666666,
    "hoursPerPc": 0.0141222222222222,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p40",
    "group": "Spread Anchor Recess Former",
    "size": "10T",
    "rawCost": 31.4422,
    "hoursPerPc": 0.0173380414312618,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p41",
    "group": "Nailing Plate",
    "size": "M10",
    "rawCost": 0.45687500000000003,
    "hoursPerPc": 0.000505,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p42",
    "group": "Nailing Plate",
    "size": "M12",
    "rawCost": 0.496875,
    "hoursPerPc": 0.000505,
    "qty": 20110,
    "priceUSD": 0.1
  },
  {
    "id": "p43",
    "group": "Nailing Plate",
    "size": "M16",
    "rawCost": 0.5376923076923077,
    "hoursPerPc": 0.000505,
    "qty": 69806,
    "priceUSD": 0.103
  },
  {
    "id": "p44",
    "group": "Nailing Plate",
    "size": "M20",
    "rawCost": 0.5876923076923077,
    "hoursPerPc": 0.000505,
    "qty": 55144,
    "priceUSD": 0.106
  },
  {
    "id": "p45",
    "group": "Nailing Plate",
    "size": "M24",
    "rawCost": 0.6725,
    "hoursPerPc": 0.000505,
    "qty": 20061,
    "priceUSD": 0.132
  },
  {
    "id": "p46",
    "group": "Nailing Plate",
    "size": "M30",
    "rawCost": 0.8171428571428571,
    "hoursPerPc": 0.000699,
    "qty": 10071,
    "priceUSD": 0.159
  },
  {
    "id": "p47",
    "group": "Nailing Plate",
    "size": "M36",
    "rawCost": 1.1053846153846154,
    "hoursPerPc": 0.000699,
    "qty": 5030,
    "priceUSD": 0.215
  },
  {
    "id": "p48",
    "group": "Nailing Plate",
    "size": "Large M12",
    "rawCost": 0.5042857142857142,
    "hoursPerPc": 0.000568,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p49",
    "group": "Nailing Plate",
    "size": "Large M16",
    "rawCost": 0.5492307692307692,
    "hoursPerPc": 0.000568,
    "qty": 30020,
    "priceUSD": 0.112
  },
  {
    "id": "p50",
    "group": "Nailing Plate",
    "size": "Large M20",
    "rawCost": 0.5592307692307692,
    "hoursPerPc": 0.000568,
    "qty": 5110,
    "priceUSD": 0.119
  },
  {
    "id": "p51",
    "group": "Nailing Plate",
    "size": "Large M24",
    "rawCost": 0.725,
    "hoursPerPc": 0.000758,
    "qty": 35089,
    "priceUSD": 0.144
  },
  {
    "id": "p52",
    "group": "Nailing Plate",
    "size": "Large M30",
    "rawCost": 0.8638461538461538,
    "hoursPerPc": 0.000758,
    "qty": 65268,
    "priceUSD": 0.17
  },
  {
    "id": "p53",
    "group": "Nailing Plate",
    "size": "Large M36",
    "rawCost": 1.2092307692307693,
    "hoursPerPc": 0.001136,
    "qty": 5082,
    "priceUSD": 0.23
  },
  {
    "id": "p54",
    "group": "Nailing Plate",
    "size": "Large M42",
    "rawCost": 1.3092307692307692,
    "hoursPerPc": 0.001136,
    "qty": 3050,
    "priceUSD": 0.25
  },
  {
    "id": "p55",
    "group": "Nailing Plate",
    "size": "Large M52",
    "rawCost": 1.528181818181818,
    "hoursPerPc": 0.001136,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p56",
    "group": "WZP Anchor Pin Fixing Plate",
    "size": "1.3T",
    "rawCost": 1.241525,
    "hoursPerPc": 0.00104666666666667,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p57",
    "group": "WZP Anchor Pin Fixing Plate",
    "size": "2.5T",
    "rawCost": 1.8940475,
    "hoursPerPc": 0.00105833333333333,
    "qty": 1006,
    "priceUSD": 0.325
  },
  {
    "id": "p58",
    "group": "WZP Anchor Pin Fixing Plate",
    "size": "5T",
    "rawCost": 2.437063333333333,
    "hoursPerPc": 0.00107777777777778,
    "qty": 1000,
    "priceUSD": 0.43
  },
  {
    "id": "p59",
    "group": "WZP Anchor Pin Fixing Plate",
    "size": "10T",
    "rawCost": 3.137095,
    "hoursPerPc": 0.00136666666666667,
    "qty": 0,
    "priceUSD": null
  },
  {
    "id": "p60",
    "group": "WZP Anchor Pin Fixing Plate",
    "size": "20T",
    "rawCost": 4.552989999999999,
    "hoursPerPc": 0.00148333333333333,
    "qty": 0,
    "priceUSD": null
  }
],
  employees: [
  {
    "id": "e1",
    "name": "HAKAM",
    "position": "General Manager",
    "basic": 10000,
    "group": "Employee"
  },
  {
    "id": "e2",
    "name": "abbi",
    "position": "GM Assistant",
    "basic": 10000,
    "group": "Employee"
  },
  {
    "id": "e3",
    "name": "Lihua",
    "position": "Factory Manager",
    "basic": 10000,
    "group": "Employee"
  },
  {
    "id": "e4",
    "name": "Ajiao",
    "position": "Accountant",
    "basic": 10000,
    "group": "Employee"
  },
  {
    "id": "e5",
    "name": "Eva",
    "position": "HR",
    "basic": 10000,
    "group": "Employee"
  },
  {
    "id": "e6",
    "name": "Welder",
    "position": "Welder",
    "basic": 6438,
    "group": "Labor",
    "availHoursPerDay": 8
  },
  {
    "id": "e7",
    "name": "Laohe",
    "position": "Labor (retired)",
    "basic": 4940,
    "group": "Labor",
    "availHoursPerDay": 8
  },
  {
    "id": "e8",
    "name": "Tangshu",
    "position": "QC",
    "basic": 4465,
    "group": "Labor",
    "availHoursPerDay": 8
  },
  {
    "id": "e9",
    "name": "Jia",
    "position": "Labor",
    "basic": 5465,
    "group": "Labor",
    "availHoursPerDay": 8
  },
  {
    "id": "e10",
    "name": "Tangenshu wife",
    "position": "Labor",
    "basic": 3615,
    "group": "Labor",
    "availHoursPerDay": 8
  },
  {
    "id": "e11",
    "name": "Xiaoyan",
    "position": "Machinery man",
    "basic": 6500,
    "group": "Labor",
    "availHoursPerDay": 8
  }
]
};
