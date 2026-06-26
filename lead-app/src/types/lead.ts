export interface Lead {
  id: string;
  pageId: string;
  formId: string;
  adName: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  createdAt: string;
  receivedAt: string;
  isTest: boolean;
}

export type WSMessage =
  | { type: 'NEW_LEAD'; lead: Lead }
  | { type: 'LEADS_HISTORY'; leads: Lead[] }
  | { type: 'LEADS_CLEARED' };
