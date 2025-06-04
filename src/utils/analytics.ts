import { debounce } from './crm-operations';

type EventCategory = 'ui' | 'data' | 'user' | 'finance' | 'parcels' | 'crops' | 'inventory';
type EventAction = 'view' | 'click' | 'create' | 'update' | 'delete' | 'export' | 'import' | 'search' | 'filter';

interface EventData {
  [key: string]: string | number | boolean | undefined;
}

export interface AnalyticsEvent {
  category: EventCategory;
  action: EventAction;
  label?: string;
  value?: number;
  data?: EventData;
  timestamp: number;
}

let eventQueue: AnalyticsEvent[] = [];

const initAnalytics = (): void => {
  eventQueue = [];
};

export const trackEvent = (
  category: EventCategory,
  action: EventAction,
  label?: string,
  value?: number,
  data?: EventData
): void => {
  const event: AnalyticsEvent = {
    category,
    action,
    label,
    value,
    data,
    timestamp: Date.now()
  };

  eventQueue.push(event);
  debouncedSendEvents();
};

const sendEvents = async (): Promise<void> => {
  if (eventQueue.length === 0) return;

  // Placeholder for sending data to a backend
  // Example: await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(eventQueue) });

  eventQueue = [];
};

const debouncedSendEvents = debounce(sendEvents, 5000);

export const getAnalyticsData = (): AnalyticsEvent[] => {
  return [...eventQueue];
};

export const clearAnalyticsData = (): void => {
  eventQueue = [];
};

initAnalytics();

export const trackPageView = (pageName: string, data?: EventData): void => {
  trackEvent('ui', 'view', pageName, undefined, data);
};

export const trackUIInteraction = (element: string, data?: EventData): void => {
  trackEvent('ui', 'click', element, undefined, data);
};

export const trackDataOperation = (
  action: 'create' | 'update' | 'delete' | 'export' | 'import',
  dataType: string,
  count: number = 1,
  data?: EventData
): void => {
  trackEvent('data', action, dataType, count, data);
};

export default {
  trackEvent,
  trackPageView,
  trackUIInteraction,
  trackDataOperation,
  getAnalyticsData,
  clearAnalyticsData
};
