import type { AccountDetail, CoachReply, MockData } from "./types";

export const mockData: MockData = {
  customer: { id: "C024", name: "Demo Customer (C024)", asOf: "2026-10-31", creditLimit: 5332.24 },
  accounts: [
    { id: "acct_pnc_checking", institutionId: "inst_pnc", type: "checking", balance: 6122.85, yield: 0, change12m: -1151, changeMagnitude: 1151, changeDirection: "down", changeTone: "neutral" },
    { id: "acct_pnc_savings", institutionId: "inst_pnc", type: "savings", balance: 12577.24, yield: 2.5, change12m: 623, changeMagnitude: 623, changeDirection: "up", changeTone: "good" },
    { id: "acct_pnc_ira", institutionId: "inst_pnc", type: "ira", balance: 50025.78, yield: 3.5, change12m: 3170, changeMagnitude: 3170, changeDirection: "up", changeTone: "good" },
    { id: "acct_pnc_card", institutionId: "inst_pnc", type: "credit_card", balance: 9971.34, creditLimit: 5332.24, apr: 22.5, monthlyPayment: 299.14, change12m: 91, changeMagnitude: 91, changeDirection: "up", changeTone: "bad", utilization: 1.87, overLimit: true, usageWidth: "93.5%", usagePercent: 187, usageTone: "bad", limitWidth: "50%" },
    { id: "acct_pnc_auto", institutionId: "inst_pnc", type: "auto_loan", balance: 28908.09, apr: 7.5, monthlyPayment: 602.25, change12m: -1657, changeMagnitude: 1657, changeDirection: "down", changeTone: "good" },
    { id: "acct_pnc_personal", institutionId: "inst_pnc", type: "personal_loan", balance: 13901.14, apr: 11.0, monthlyPayment: 386.14, change12m: -996, changeMagnitude: 996, changeDirection: "down", changeTone: "good" },
    { id: "acct_pnc_mortgage", institutionId: "inst_pnc", type: "mortgage", balance: 281770.84, apr: 6.5, monthlyPayment: 1831.51, change12m: -5087, changeMagnitude: 5087, changeDirection: "down", changeTone: "good" },
  ],
  monthly: [
    { month: "2025-11", income: 8344, spending: 6201, debtCosts: 2797, creditCardBalance: 9880, savingsBalance: 11954, debtToIncome: 0.33521093000958774, cashFlow: -654 } ,
    { month: "2025-12", income: 8353, spending: 6010, debtCosts: 2806, creditCardBalance: 9888, savingsBalance: 12002, debtToIncome: 0.33592721178019874, cashFlow: -463 } ,
    { month: "2026-01", income: 8356, spending: 5255, debtCosts: 2742, creditCardBalance: 9897, savingsBalance: 12072, debtToIncome: 0.32814743896601245, cashFlow: 359 } ,
    { month: "2026-02", income: 8510, spending: 5673, debtCosts: 2662, creditCardBalance: 9905, savingsBalance: 12132, debtToIncome: 0.3128084606345476, cashFlow: 175 } ,
    { month: "2026-03", income: 8531, spending: 5720, debtCosts: 2847, creditCardBalance: 9913, savingsBalance: 12190, debtToIncome: 0.33372406517407105, cashFlow: -36 } ,
    { month: "2026-04", income: 8259, spending: 5227, debtCosts: 2758, creditCardBalance: 9921, savingsBalance: 12252, debtToIncome: 0.33393873350284536, cashFlow: 274 } ,
    { month: "2026-05", income: 8542, spending: 5422, debtCosts: 2881, creditCardBalance: 9930, savingsBalance: 12307, debtToIncome: 0.3372746429407633, cashFlow: 239 } ,
    { month: "2026-06", income: 8473, spending: 5340, debtCosts: 2684, creditCardBalance: 9938, savingsBalance: 12365, debtToIncome: 0.3167709193910067, cashFlow: 449 } ,
    { month: "2026-07", income: 8559, spending: 5724, debtCosts: 2657, creditCardBalance: 9946, savingsBalance: 12410, debtToIncome: 0.31043346185302023, cashFlow: 178 } ,
    { month: "2026-08", income: 8337, spending: 5651, debtCosts: 2610, creditCardBalance: 9955, savingsBalance: 12453, debtToIncome: 0.3130622526088521, cashFlow: 76 } ,
    { month: "2026-09", income: 8461, spending: 5447, debtCosts: 2875, creditCardBalance: 9963, savingsBalance: 12501, debtToIncome: 0.3397943505495804, cashFlow: 139 } ,
    { month: "2026-10", income: 8557, spending: 5669, debtCosts: 2773, creditCardBalance: 9971, savingsBalance: 12577, debtToIncome: 0.3240621713217249, cashFlow: 115 } ,
  ],
  spendingByCategoryLastMonth: [{"category": "housing", "label": "Housing", "amount": 1990}, {"category": "groceries", "label": "Groceries", "amount": 975}, {"category": "utilities", "label": "Utilities", "amount": 884}, {"category": "other_spending", "label": "Other", "amount": 884}, {"category": "dining", "label": "Dining", "amount": 312}, {"category": "shopping", "label": "Shopping", "amount": 312}, {"category": "transport", "label": "Transport", "amount": 312}],
  metrics: [
    { id: "emergency_fund", label: "Emergency fund", value: 2.2, unit: "months", status: "watch", target: "3–6 months", explanation: "Your checking and savings would cover about 2.2 months of spending and debt costs.", goalProgress: 0.7333333333333333, ringOffset: 85.45132041764237 },
    { id: "debt_to_income", label: "Debt-to-income", value: 0.37, unit: "percent", status: "risk", target: "under 36%", explanation: "Your scheduled debt payments are about 37% of your monthly income.", pieData: [{ name: "Debt payments", value: 37 }, { name: "Remaining income", value: 63 }] },
    { id: "credit_utilization", label: "Credit card use", value: 1.87, unit: "percent", status: "risk", target: "under 30%", explanation: "Your card balance is 187% of your $5,332 limit. You are over the limit." },
    { id: "monthly_cash_flow", label: "Monthly cash flow", value: 71, unit: "dollars", status: "watch", target: "positive", explanation: "On average you have about $71 left each month after spending and debt costs.", cashAxis: { bound: 1000, barX: 160, barWidth: 7.1, labelX: 175.1, negative: false, tone: "good", ticks: [{ x: 60, label: "−$1k" }, { x: 160, label: "$0" }, { x: 260, label: "+$1k" }] } },
  ],
  metricsAfterLinking: [
    { id: "emergency_fund", label: "Emergency fund", value: 4.8, unit: "months", status: "good", target: "3–6 months", explanation: "Your checking and savings (all banks) would cover about 4.8 months of spending and debt costs.", goalProgress: 1, ringOffset: 0 },
    { id: "debt_to_income", label: "Debt-to-income", value: 0.39, unit: "percent", status: "risk", target: "under 36%", explanation: "Your scheduled debt payments are about 39% of your monthly income.", pieData: [{ name: "Debt payments", value: 39 }, { name: "Remaining income", value: 61 }] },
    { id: "credit_utilization", label: "Credit card use", value: 1.08, unit: "percent", status: "risk", target: "under 30%", explanation: "Your card balances are 108% of your $15,428 combined limit. You are over the limit." },
    { id: "monthly_cash_flow", label: "Monthly cash flow", value: 71, unit: "dollars", status: "watch", target: "positive", explanation: "On average you have about $71 left each month after spending and debt costs. (PNC accounts only.)", cashAxis: { bound: 1000, barX: 160, barWidth: 7.1, labelX: 175.1, negative: false, tone: "good", ticks: [{ x: 60, label: "−$1k" }, { x: 160, label: "$0" }, { x: 260, label: "+$1k" }] } },
  ],
  alerts: [
    { id: "a1", severity: "critical", title: "Card is over its limit", reason: "Balance $9,971 vs. limit $5,332.", suggestedAction: "Pay down the card before adding new purchases.", date: "2026-10-31", read: false, metricId: "credit_utilization", channels: ["app", "imessage"] },
    { id: "a2", severity: "warning", title: "Card balance rose 12 months in a row", reason: "Up from $9,880 to $9,971 since last November.", suggestedAction: "Paying $50 more per month would start shrinking it.", date: "2026-10-31", read: false, metricId: "credit_utilization", channels: ["app", "imessage"] },
    { id: "a3", severity: "warning", title: "Emergency fund is below 3 months", reason: "Your checking and savings cover about 2.2 months of costs.", suggestedAction: "A common goal is 3 to 6 months. Ask the coach for a plan.", date: "2026-10-31", read: false, metricId: "emergency_fund", channels: ["app"] },
    { id: "a4", severity: "warning", title: "Debt payments are a large share of income", reason: "Scheduled payments are 37% of income.", suggestedAction: "Ask the coach which debt to pay down first.", date: "2026-10-31", read: false, metricId: "debt_to_income", channels: ["app"] },
    { id: "a5", severity: "info", title: "You paid $30 in fees this year", reason: "Card and loan servicing fees.", suggestedAction: "Ask the coach which fees can be avoided.", date: "2026-10-15", read: true, channels: ["app"] },
  ],
};


export const accountDetails: AccountDetail[] = [
  {
    "id": "acct_pnc_checking",
    "institutionId": "inst_pnc",
    "type": "checking",
    "label": "Checking",
    "history": [
      7274,
      6600,
      6056,
      5004,
      6164,
      7028,
      6270,
      6113,
      6380,
      6560,
      5512,
      6123
    ],
    "recent": [
      {
        "date": "2026-10-21",
        "label": "Mortgage payment",
        "amount": -2062.96,
        "incoming": false,
        "displayValue": -2062.96,
        "displayLabel": "Mortgage payment"
      },
      {
        "date": "2026-10-25",
        "label": "Other spending",
        "amount": -884.35,
        "incoming": false,
        "displayValue": -884.35,
        "displayLabel": "Other spending"
      },
      {
        "date": "2026-10-28",
        "label": "Credit card payment",
        "amount": -1425.62,
        "incoming": false,
        "displayValue": -1425.62,
        "displayLabel": "Credit card payment"
      }
    ],
    "chart": [
      {
        "month": "2025-11",
        "balance": 7274
      },
      {
        "month": "2025-12",
        "balance": 6600
      },
      {
        "month": "2026-01",
        "balance": 6056
      },
      {
        "month": "2026-02",
        "balance": 5004
      },
      {
        "month": "2026-03",
        "balance": 6164
      },
      {
        "month": "2026-04",
        "balance": 7028
      },
      {
        "month": "2026-05",
        "balance": 6270
      },
      {
        "month": "2026-06",
        "balance": 6113
      },
      {
        "month": "2026-07",
        "balance": 6380
      },
      {
        "month": "2026-08",
        "balance": 6560
      },
      {
        "month": "2026-09",
        "balance": 5512
      },
      {
        "month": "2026-10",
        "balance": 6123
      }
    ],
    "coachReply": {
      "reply": "Your Checking balance is $6,123. No interest. $1,151 down over 12 months.",
      "sources": [
        "Checking account",
        "12-month account history"
      ],
      "verified": true
    }
  },
  {
    "id": "acct_pnc_savings",
    "institutionId": "inst_pnc",
    "type": "savings",
    "label": "Savings",
    "history": [
      11954,
      12002,
      12072,
      12132,
      12190,
      12252,
      12307,
      12365,
      12410,
      12453,
      12501,
      12577
    ],
    "recent": [
      {
        "date": "2026-10-01",
        "label": "Paycheck deposit",
        "amount": 25.05,
        "incoming": true,
        "displayValue": 25.05,
        "displayLabel": "Paycheck deposit"
      },
      {
        "date": "2026-10-05",
        "label": "Savings transfer",
        "amount": 25.05,
        "incoming": true,
        "displayValue": 25.05,
        "displayLabel": "Savings transfer"
      },
      {
        "date": "2026-10-31",
        "label": "Interest earned",
        "amount": 26.15,
        "incoming": true,
        "displayValue": 26.15,
        "displayLabel": "Interest earned"
      }
    ],
    "chart": [
      {
        "month": "2025-11",
        "balance": 11954
      },
      {
        "month": "2025-12",
        "balance": 12002
      },
      {
        "month": "2026-01",
        "balance": 12072
      },
      {
        "month": "2026-02",
        "balance": 12132
      },
      {
        "month": "2026-03",
        "balance": 12190
      },
      {
        "month": "2026-04",
        "balance": 12252
      },
      {
        "month": "2026-05",
        "balance": 12307
      },
      {
        "month": "2026-06",
        "balance": 12365
      },
      {
        "month": "2026-07",
        "balance": 12410
      },
      {
        "month": "2026-08",
        "balance": 12453
      },
      {
        "month": "2026-09",
        "balance": 12501
      },
      {
        "month": "2026-10",
        "balance": 12577
      }
    ],
    "coachReply": {
      "reply": "Your Savings balance is $12,577. 2.5% interest. $623 up over 12 months.",
      "sources": [
        "Savings account",
        "12-month account history"
      ],
      "verified": true
    }
  },
  {
    "id": "acct_pnc_ira",
    "institutionId": "inst_pnc",
    "type": "ira",
    "label": "IRA (retirement)",
    "history": [
      46856,
      47137,
      47439,
      47667,
      47906,
      48150,
      48441,
      48777,
      49089,
      49428,
      49737,
      50026
    ],
    "recent": [
      {
        "date": "2026-09-30",
        "label": "Interest earned",
        "amount": 144.65,
        "incoming": true,
        "displayValue": 144.65,
        "displayLabel": "Interest earned"
      },
      {
        "date": "2026-10-05",
        "label": "Contribution",
        "amount": 142.94,
        "incoming": true,
        "displayValue": 142.94,
        "displayLabel": "Contribution"
      },
      {
        "date": "2026-10-31",
        "label": "Interest earned",
        "amount": 145.48,
        "incoming": true,
        "displayValue": 145.48,
        "displayLabel": "Interest earned"
      }
    ],
    "chart": [
      {
        "month": "2025-11",
        "balance": 46856
      },
      {
        "month": "2025-12",
        "balance": 47137
      },
      {
        "month": "2026-01",
        "balance": 47439
      },
      {
        "month": "2026-02",
        "balance": 47667
      },
      {
        "month": "2026-03",
        "balance": 47906
      },
      {
        "month": "2026-04",
        "balance": 48150
      },
      {
        "month": "2026-05",
        "balance": 48441
      },
      {
        "month": "2026-06",
        "balance": 48777
      },
      {
        "month": "2026-07",
        "balance": 49089
      },
      {
        "month": "2026-08",
        "balance": 49428
      },
      {
        "month": "2026-09",
        "balance": 49737
      },
      {
        "month": "2026-10",
        "balance": 50026
      }
    ],
    "coachReply": {
      "reply": "Your IRA (retirement) balance is $50,026. 3.5% interest. $3,170 up over 12 months.",
      "sources": [
        "IRA (retirement) account",
        "12-month account history"
      ],
      "verified": true
    }
  },
  {
    "id": "acct_pnc_card",
    "institutionId": "inst_pnc",
    "type": "credit_card",
    "label": "Credit card",
    "history": [
      9880,
      9888,
      9897,
      9905,
      9913,
      9921,
      9930,
      9938,
      9946,
      9955,
      9963,
      9971
    ],
    "recent": [
      {
        "date": "2026-10-19",
        "label": "Dining",
        "amount": 311.78,
        "incoming": false,
        "displayValue": -311.78,
        "displayLabel": "Dining"
      },
      {
        "date": "2026-10-25",
        "label": "Shopping",
        "amount": 311.78,
        "incoming": false,
        "displayValue": -311.78,
        "displayLabel": "Shopping"
      },
      {
        "date": "2026-10-26",
        "label": "Interest charged",
        "amount": 186.81,
        "incoming": false,
        "displayValue": -186.81,
        "displayLabel": "Interest charged"
      },
      {
        "date": "2026-10-28",
        "label": "Payment received",
        "amount": -1425.62,
        "incoming": true,
        "displayValue": 1425.62,
        "displayLabel": "Payment received"
      }
    ],
    "payoff": {
      "months": 53,
      "totalInterest": 5823,
      "assumption": "Assumes no new purchases and a $299 payment every month. With your current spending on the card, the balance is still rising.",
      "years": 4.4
    },
    "chart": [
      {
        "month": "2025-11",
        "balance": 9880
      },
      {
        "month": "2025-12",
        "balance": 9888
      },
      {
        "month": "2026-01",
        "balance": 9897
      },
      {
        "month": "2026-02",
        "balance": 9905
      },
      {
        "month": "2026-03",
        "balance": 9913
      },
      {
        "month": "2026-04",
        "balance": 9921
      },
      {
        "month": "2026-05",
        "balance": 9930
      },
      {
        "month": "2026-06",
        "balance": 9938
      },
      {
        "month": "2026-07",
        "balance": 9946
      },
      {
        "month": "2026-08",
        "balance": 9955
      },
      {
        "month": "2026-09",
        "balance": 9963
      },
      {
        "month": "2026-10",
        "balance": 9971
      }
    ],
    "coachReply": {
      "reply": "Your Credit card balance is $9,971. 22.5% APR \u00b7 $299/month. $91 up over 12 months. Payoff estimate: 53 months (about 4.4 years) at your current payment, about $5,823 in interest. Assumes no new purchases and a $299 payment every month. With your current spending on the card, the balance is still rising.",
      "sources": [
        "Credit card account",
        "12-month account history"
      ],
      "verified": true
    }
  },
  {
    "id": "acct_pnc_auto",
    "institutionId": "inst_pnc",
    "type": "auto_loan",
    "label": "Auto loan",
    "history": [
      30565,
      30429,
      30249,
      30103,
      29930,
      29797,
      29656,
      29492,
      29380,
      29222,
      29038,
      28908
    ],
    "recent": [
      {
        "date": "2026-09-21",
        "label": "Payment",
        "amount": -366.42,
        "incoming": true,
        "displayValue": 366.42,
        "displayLabel": "Payment received"
      },
      {
        "date": "2026-10-20",
        "label": "Interest charged",
        "amount": 181.49,
        "incoming": false,
        "displayValue": -181.49,
        "displayLabel": "Interest charged"
      },
      {
        "date": "2026-10-21",
        "label": "Payment",
        "amount": -311.4,
        "incoming": true,
        "displayValue": 311.4,
        "displayLabel": "Payment received"
      }
    ],
    "payoff": {
      "months": 57,
      "totalInterest": 5569,
      "assumption": "Assumes the scheduled $602 payment every month.",
      "years": 4.8
    },
    "chart": [
      {
        "month": "2025-11",
        "balance": 30565
      },
      {
        "month": "2025-12",
        "balance": 30429
      },
      {
        "month": "2026-01",
        "balance": 30249
      },
      {
        "month": "2026-02",
        "balance": 30103
      },
      {
        "month": "2026-03",
        "balance": 29930
      },
      {
        "month": "2026-04",
        "balance": 29797
      },
      {
        "month": "2026-05",
        "balance": 29656
      },
      {
        "month": "2026-06",
        "balance": 29492
      },
      {
        "month": "2026-07",
        "balance": 29380
      },
      {
        "month": "2026-08",
        "balance": 29222
      },
      {
        "month": "2026-09",
        "balance": 29038
      },
      {
        "month": "2026-10",
        "balance": 28908
      }
    ],
    "coachReply": {
      "reply": "Your Auto loan balance is $28,908. 7.5% APR \u00b7 $602/month. $1,657 down over 12 months. Payoff estimate: 57 months (about 4.8 years) at your current payment, about $5,569 in interest. Assumes the scheduled $602 payment every month.",
      "sources": [
        "Auto loan account",
        "12-month account history"
      ],
      "verified": true
    }
  },
  {
    "id": "acct_pnc_personal",
    "institutionId": "inst_pnc",
    "type": "personal_loan",
    "label": "Personal loan",
    "history": [
      14897,
      14809,
      14730,
      14648,
      14551,
      14480,
      14359,
      14262,
      14179,
      14102,
      13984,
      13901
    ],
    "recent": [
      {
        "date": "2026-09-21",
        "label": "Payment",
        "amount": -246.65,
        "incoming": true,
        "displayValue": 246.65,
        "displayLabel": "Payment received"
      },
      {
        "date": "2026-10-20",
        "label": "Interest charged",
        "amount": 128.19,
        "incoming": false,
        "displayValue": -128.19,
        "displayLabel": "Interest charged"
      },
      {
        "date": "2026-10-21",
        "label": "Payment",
        "amount": -211.34,
        "incoming": true,
        "displayValue": 211.34,
        "displayLabel": "Payment received"
      }
    ],
    "payoff": {
      "months": 44,
      "totalInterest": 3046,
      "assumption": "Assumes the scheduled $386 payment every month.",
      "years": 3.7
    },
    "chart": [
      {
        "month": "2025-11",
        "balance": 14897
      },
      {
        "month": "2025-12",
        "balance": 14809
      },
      {
        "month": "2026-01",
        "balance": 14730
      },
      {
        "month": "2026-02",
        "balance": 14648
      },
      {
        "month": "2026-03",
        "balance": 14551
      },
      {
        "month": "2026-04",
        "balance": 14480
      },
      {
        "month": "2026-05",
        "balance": 14359
      },
      {
        "month": "2026-06",
        "balance": 14262
      },
      {
        "month": "2026-07",
        "balance": 14179
      },
      {
        "month": "2026-08",
        "balance": 14102
      },
      {
        "month": "2026-09",
        "balance": 13984
      },
      {
        "month": "2026-10",
        "balance": 13901
      }
    ],
    "coachReply": {
      "reply": "Your Personal loan balance is $13,901. 11% APR \u00b7 $386/month. $996 down over 12 months. Payoff estimate: 44 months (about 3.7 years) at your current payment, about $3,046 in interest. Assumes the scheduled $386 payment every month.",
      "sources": [
        "Personal loan account",
        "12-month account history"
      ],
      "verified": true
    }
  },
  {
    "id": "acct_pnc_mortgage",
    "institutionId": "inst_pnc",
    "type": "mortgage",
    "label": "Mortgage",
    "history": [
      286858,
      286343,
      285922,
      285547,
      285026,
      284551,
      283979,
      283598,
      283188,
      282848,
      282305,
      281771
    ],
    "recent": [
      {
        "date": "2026-09-21",
        "label": "Payment",
        "amount": -2075.26,
        "incoming": true,
        "displayValue": 2075.26,
        "displayLabel": "Payment received"
      },
      {
        "date": "2026-10-20",
        "label": "Interest charged",
        "amount": 1529.15,
        "incoming": false,
        "displayValue": -1529.15,
        "displayLabel": "Interest charged"
      },
      {
        "date": "2026-10-21",
        "label": "Payment",
        "amount": -2062.96,
        "incoming": true,
        "displayValue": 2062.96,
        "displayLabel": "Payment received"
      }
    ],
    "payoff": {
      "months": 332,
      "totalInterest": 325707,
      "assumption": "Assumes the scheduled $1,832 payment every month.",
      "years": 27.7
    },
    "chart": [
      {
        "month": "2025-11",
        "balance": 286858
      },
      {
        "month": "2025-12",
        "balance": 286343
      },
      {
        "month": "2026-01",
        "balance": 285922
      },
      {
        "month": "2026-02",
        "balance": 285547
      },
      {
        "month": "2026-03",
        "balance": 285026
      },
      {
        "month": "2026-04",
        "balance": 284551
      },
      {
        "month": "2026-05",
        "balance": 283979
      },
      {
        "month": "2026-06",
        "balance": 283598
      },
      {
        "month": "2026-07",
        "balance": 283188
      },
      {
        "month": "2026-08",
        "balance": 282848
      },
      {
        "month": "2026-09",
        "balance": 282305
      },
      {
        "month": "2026-10",
        "balance": 281771
      }
    ],
    "coachReply": {
      "reply": "Your Mortgage balance is $281,771. 6.5% APR \u00b7 $1,832/month. $5,087 down over 12 months. Payoff estimate: 332 months (about 27.7 years) at your current payment, about $325,707 in interest. Assumes the scheduled $1,832 payment every month.",
      "sources": [
        "Mortgage account",
        "12-month account history"
      ],
      "verified": true
    }
  }
];

export const accountsSummaries = {
  pnc: { totalAssets: 68725.87, totalDebts: 334551.41, totalMonthlyDebtPayments: 3119.04 },
  allLinked: { totalAssets: 89857.68, totalDebts: 341218.59, totalMonthlyDebtPayments: 3319.06 },
  platypus: { totalAssets: 21131.81, totalDebts: 6667.18, totalMonthlyDebtPayments: 200.02 },
  empty: { totalAssets: 0, totalDebts: 0, totalMonthlyDebtPayments: 0 },
};

export const mockCoachReplies = {
0: { reply: "Your card balance is $9,971 and your limit is $5,332. That's 187% of your limit, so you're over it. A healthy level is under 30%. Your balance has also grown every month this past year, from $9,880 to $9,971.", sources: ["Credit card use metric", "Monthly card balances"], verified: true },
1: { reply: "In October you spent $5,669. The biggest categories were housing ($1,990), groceries ($975), utilities ($884), and other spending ($884). Dining, shopping, and transport were $312 each.", sources: ["Spending by category, October 2026"], verified: true },
2: { reply: "Your scheduled debt payments are about 37% of your monthly income. A common target is under 36%. Your largest monthly payments are the mortgage at $1,832 and the auto loan at $602.", sources: ["Debt-to-income metric", "Account list"], verified: true },
3: { reply: "Right now your card balance grows by about $8 a month, because interest at 22.5% is a little more than what you pay down. Paying $50 more each month would flip that: the balance would start shrinking by roughly $40 a month at first.", sources: ["Credit card account", "Simulation: extra payment"], verified: true },
4: { reply: "I'm running in demo mode right now, so I can only answer a few questions. Try one of the suggested questions.", sources: [], verified: false },
} satisfies Record<number, CoachReply>;
