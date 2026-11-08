import type { Account, AccountDetail, Institution } from "@/data/types";

export const pncInstitution: Institution = { id: "inst_pnc", name: "PNC Bank", source: "pnc", status: "synced", lastSynced: "2026-10-31T09:00:00" };
export const platypusInstitution: Institution = { id: "inst_platypus", name: "First Platypus Bank", source: "plaid", status: "synced", lastSynced: "" };
export const platypusAccounts: Account[] = [
  { id: "acct_plat_savings", institutionId: "inst_platypus", type: "savings", balance: 21131.81, yield: 2.5, change12m: 1086, changeMagnitude: 1086, changeDirection: "up", changeTone: "good" },
  { id: "acct_plat_card", institutionId: "inst_platypus", type: "credit_card", balance: 6667.18, apr: 22.5, monthlyPayment: 200.02, creditLimit: 10095.97, change12m: 61, changeMagnitude: 61, changeDirection: "up", changeTone: "bad", utilization: 0.66, overLimit: false, usageWidth: "33%", usagePercent: 66, usageTone: "bad", limitWidth: "50%" },
];
export const platypusDetails: AccountDetail[] = [
  {
    "id": "acct_plat_savings",
    "institutionId": "inst_platypus",
    "type": "savings",
    "label": "High-yield savings",
    "history": [
      20046,
      20145,
      20244,
      20344,
      20444,
      20535,
      20619,
      20712,
      20832,
      20924,
      21051,
      21132
    ],
    "recent": [
      {
        "date": "2026-09-30",
        "label": "Interest earned",
        "amount": 43.77,
        "incoming": true,
        "displayValue": 43.77,
        "displayLabel": "Interest earned"
      },
      {
        "date": "2026-10-05",
        "label": "Savings transfer",
        "amount": 18.27,
        "incoming": true,
        "displayValue": 18.27,
        "displayLabel": "Savings transfer"
      },
      {
        "date": "2026-10-31",
        "label": "Interest earned",
        "amount": 43.93,
        "incoming": true,
        "displayValue": 43.93,
        "displayLabel": "Interest earned"
      }
    ],
    "chart": [
      {
        "month": "2025-11",
        "balance": 20046
      },
      {
        "month": "2025-12",
        "balance": 20145
      },
      {
        "month": "2026-01",
        "balance": 20244
      },
      {
        "month": "2026-02",
        "balance": 20344
      },
      {
        "month": "2026-03",
        "balance": 20444
      },
      {
        "month": "2026-04",
        "balance": 20535
      },
      {
        "month": "2026-05",
        "balance": 20619
      },
      {
        "month": "2026-06",
        "balance": 20712
      },
      {
        "month": "2026-07",
        "balance": 20832
      },
      {
        "month": "2026-08",
        "balance": 20924
      },
      {
        "month": "2026-09",
        "balance": 21051
      },
      {
        "month": "2026-10",
        "balance": 21132
      }
    ],
    "coachReply": {
      "reply": "Your High-yield savings balance is $21,132. 2.5% interest. $1,086 up over 12 months.",
      "sources": [
        "High-yield savings account",
        "12-month account history"
      ],
      "verified": true
    }
  },
  {
    "id": "acct_plat_card",
    "institutionId": "inst_platypus",
    "type": "credit_card",
    "label": "Platypus credit card",
    "history": [
      6606,
      6612,
      6617,
      6623,
      6628,
      6634,
      6639,
      6645,
      6651,
      6656,
      6662,
      6667
    ],
    "recent": [
      {
        "date": "2026-10-19",
        "label": "Dining",
        "amount": 151.56,
        "incoming": false,
        "displayValue": -151.56,
        "displayLabel": "Dining"
      },
      {
        "date": "2026-10-25",
        "label": "Shopping",
        "amount": 151.56,
        "incoming": false,
        "displayValue": -151.56,
        "displayLabel": "Shopping"
      },
      {
        "date": "2026-10-26",
        "label": "Interest charged",
        "amount": 124.91,
        "incoming": false,
        "displayValue": -124.91,
        "displayLabel": "Interest charged"
      },
      {
        "date": "2026-10-28",
        "label": "Payment received",
        "amount": -725.59,
        "incoming": true,
        "displayValue": 725.59,
        "displayLabel": "Payment received"
      }
    ],
    "payoff": {
      "months": 53,
      "totalInterest": 3893,
      "assumption": "Assumes no new purchases and a $200 payment every month. With current spending on the card, the balance is still rising.",
      "years": 4.4
    },
    "chart": [
      {
        "month": "2025-11",
        "balance": 6606
      },
      {
        "month": "2025-12",
        "balance": 6612
      },
      {
        "month": "2026-01",
        "balance": 6617
      },
      {
        "month": "2026-02",
        "balance": 6623
      },
      {
        "month": "2026-03",
        "balance": 6628
      },
      {
        "month": "2026-04",
        "balance": 6634
      },
      {
        "month": "2026-05",
        "balance": 6639
      },
      {
        "month": "2026-06",
        "balance": 6645
      },
      {
        "month": "2026-07",
        "balance": 6651
      },
      {
        "month": "2026-08",
        "balance": 6656
      },
      {
        "month": "2026-09",
        "balance": 6662
      },
      {
        "month": "2026-10",
        "balance": 6667
      }
    ],
    "coachReply": {
      "reply": "Your Platypus credit card balance is $6,667. 22.5% APR \u00b7 $200/month. $61 up over 12 months. Payoff estimate: 53 months (about 4.4 years) at your current payment, about $3,893 in interest. Assumes no new purchases and a $200 payment every month. With current spending on the card, the balance is still rising.",
      "sources": [
        "Platypus credit card account",
        "12-month account history"
      ],
      "verified": true
    }
  }
];
