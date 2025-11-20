import z from "zod";

// Examples of metadata based on AccountType
//
// Cash: {
// "location": "Safe in home office"
// "notes": "Emergency fund envelope"
// }
//
// Bank: {
// "bankName": "Equity Bank",
// "accountNumber": "0123456789",
// "branch": "Westlands",
// "accountType": "checking",
// "swiftCode": "EQBLKENA",
// "lastSyncedAt": "2025-11-18T10:30:00Z"
// }
//
// Mobile_Money: {
// "provider": "Safaricom",
// "phoneNumber": "+254712345678",
// "tillNumber": "123456",
// "paybillNumber": "400200",
// "lastBalance": 5000.00,
// "lastChecked": "2025-11-18T08:00:00Z"
// }
//
// Credit {
// "cardIssuer": "KCB",
// "last4Digits": "4567",
// "expiryDate": "2027-12",
// "creditLimit": 100000,
// "billingCycle": 15,
// "interestRate": 2.5,
// "dueDate": "2025-12-15"
//}
//
//Savings: {
//   "bankName": "Cooperative Bank",
//   "accountNumber": "0123456789",
//   "interestRate": 7.5,
//   "minimumBalance": 1000,
//   "maturityDate": "2026-01-15",
//   "autoSave": {
//     "enabled": true,
//     "amount": 5000,
//     "frequency": "monthly"
//   }
//}
//
export const FinAccountType = [
  "BANK",
  "CASH",
  "CREDIT",
  "MOBILE_MONEY",
  "SAVINGS",
  "WALLET",
] as const;

export type FinAccountType = (typeof FinAccountType)[number];

export const createAccountSchema = z.object({
  name: z
    .string()
    .min(3, "Name requires 3 characters")
    .max(255, "Name must be under 255 characters"),
  type: z.enum(FinAccountType),
  balance: z.coerce
    .number()
    .nonnegative("Balance cannot be negative")
    .optional(),
  currency: z.string().length(3).optional(),
  metadata: z.record(z.any(), z.any()).optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

export const updateAccountSchema = z.object({
  name: z
    .string()
    .min(3, "Name requires 3 characters")
    .max(255, "Name must be under 255 characters")
    .optional(),
  type: z.enum(FinAccountType).optional(),
  currency: z.string().length(3).optional(),
  metadata: z.record(z.any(), z.any()).optional(),
});

export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export type AccountQuery = {
  isActive?: boolean;
  type?: FinAccountType;
  currency?: string;
};
