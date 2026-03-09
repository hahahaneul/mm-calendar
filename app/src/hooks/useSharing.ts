import { useState, useCallback } from 'react';
import type { ShareLink, SharePermission, WebhookSubscription } from '../types';
import { SAMPLE_SHARE_LINKS, SAMPLE_WEBHOOKS } from '../data/sampleEvents';

let shareLinkCounter = 3;
let webhookCounter = 3;

export function useSharing() {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>(SAMPLE_SHARE_LINKS);
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>(SAMPLE_WEBHOOKS);

  const createShareLink = useCallback((permission: SharePermission, expiresAt?: string) => {
    const token = Math.random().toString(36).slice(2, 14);
    const link: ShareLink = {
      id: `sl_${String(shareLinkCounter++).padStart(3, '0')}`,
      permission,
      token,
      url: `https://calarc.app/share/${token}`,
      createdAt: new Date().toISOString(),
      expiresAt: expiresAt || undefined,
    };
    setShareLinks((prev) => [...prev, link]);
    return link;
  }, []);

  const deleteShareLink = useCallback((id: string) => {
    setShareLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const addWebhook = useCallback((endpoint: string, events: string[]) => {
    const wh: WebhookSubscription = {
      id: `wh_${String(webhookCounter++).padStart(3, '0')}`,
      endpoint,
      events,
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    setWebhooks((prev) => [...prev, wh]);
  }, []);

  const updateWebhookStatus = useCallback(
    (id: string, status: WebhookSubscription['status']) => {
      setWebhooks((prev) =>
        prev.map((wh) => (wh.id === id ? { ...wh, status } : wh))
      );
    },
    []
  );

  const updateWebhookEvents = useCallback((id: string, events: string[]) => {
    setWebhooks((prev) =>
      prev.map((wh) => (wh.id === id ? { ...wh, events } : wh))
    );
  }, []);

  const deleteWebhook = useCallback((id: string) => {
    setWebhooks((prev) => prev.filter((wh) => wh.id !== id));
  }, []);

  return {
    shareLinks,
    webhooks,
    createShareLink,
    deleteShareLink,
    addWebhook,
    updateWebhookStatus,
    updateWebhookEvents,
    deleteWebhook,
  };
}
