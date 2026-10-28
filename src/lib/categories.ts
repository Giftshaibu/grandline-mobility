export const paths = {
  hire: {
    title: "Vehicle hire",
    description: "Explore cars and SUVs for personal and business journeys.",
    categories: [
      ["car", "Cars"],
      ["suv", "SUVs"],
      ["van", "Vans"],
    ],
  },
  "heavy-duty": {
    title: "Heavy-duty hire",
    description:
      "Explore large vehicles and equipment for construction, haulage and demanding jobs.",
    categories: [
      ["lorry", "Lorries"],
      ["tipper", "Tippers"],
      ["excavator", "Excavators"],
      ["loader", "Loaders"],
      ["crane", "Cranes"],
      ["tractor", "Tractors"],
    ],
  },
  commercial: {
    title: "Commercial transport",
    description: "Explore trucks, vans and buses for your transport needs.",
    categories: [
      ["truck", "Trucks"],
      ["van", "Vans"],
      ["bus", "Buses"],
    ],
  },
  logistics: {
    title: "Logistics",
    description: "Explore transport providers for goods and vehicle movement.",
    categories: [
      ["goods", "Goods transport"],
      ["vehicle-movement", "Vehicle movement"],
      ["dealer-stock", "Dealer-stock movement"],
    ],
  },
} as const;
